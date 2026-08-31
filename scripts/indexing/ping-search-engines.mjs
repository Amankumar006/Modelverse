// scripts/indexing/ping-search-engines.mjs
import crypto from 'crypto';

/**
 * Minimal JWT generation for Google Service Account authentication
 * (No external dependencies like googleapis required)
 */
function generateJwt(serviceAccountEmail, privateKey, scope) {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccountEmail,
    scope: scope,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const toBase64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const encodedHeader = toBase64Url(header);
  const encodedPayload = toBase64Url(payload);
  
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  const signature = signer.sign(privateKey, 'base64url');
  
  return `${unsignedToken}.${signature}`;
}

/**
 * Fetch OAuth2 token from Google
 */
async function getGoogleAccessToken(serviceAccountEmail, privateKey) {
  const jwt = generateJwt(serviceAccountEmail, privateKey, 'https://www.googleapis.com/auth/indexing');
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to get access token: ${data.error_description || JSON.stringify(data)}`);
  }
  return data.access_token;
}

/**
 * Ping Google Indexing API
 */
async function pingGoogleIndexingAPI(urls, type = 'URL_UPDATED', saJson) {
  try {
    console.log(`[Google Indexing API] Starting ping for ${urls.length} URL(s)...`);
    const { client_email, private_key } = saJson;
    
    if (!client_email || !private_key) {
      throw new Error("Invalid Service Account JSON: Missing client_email or private_key");
    }

    const accessToken = await getGoogleAccessToken(client_email, private_key);
    const endpoint = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
    
    const results = [];
    
    // Process sequentially to respect rate limits safely
    for (const url of urls) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            url: url,
            type: type // 'URL_UPDATED' or 'URL_DELETED'
          }),
        });

        if (response.ok) {
          console.log(`[Google Indexing API] SUCCESS -> ${url}`);
          results.push({ url, status: 'success' });
        } else {
          const data = await response.json();
          console.error(`[Google Indexing API] ERROR for ${url}:`, data.error?.message || JSON.stringify(data));
          results.push({ url, status: 'error', error: data.error?.message });
        }
      } catch (err) {
        console.error(`[Google Indexing API] FETCH ERROR for ${url}:`, err.message);
        results.push({ url, status: 'error', error: err.message });
      }
    }
    return results;
  } catch (err) {
    console.error(`[Google Indexing API] FATAL ERROR:`, err.message);
    return [];
  }
}

/**
 * Ping IndexNow Protocol
 */
async function pingIndexNow(urls, host, key) {
  try {
    if (!urls || urls.length === 0) return [];
    console.log(`[IndexNow] Starting ping for ${urls.length} URL(s)...`);
    
    const endpoint = 'https://api.indexnow.org/indexnow';
    const payload = {
      host: host,
      key: key,
      keyLocation: `https://${host}/${key}.txt`,
      urlList: urls
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 202 || response.status === 200) {
      console.log(`[IndexNow] SUCCESS -> Pushed ${urls.length} URL(s) to IndexNow.`);
      return urls.map(u => ({ url: u, status: 'success' }));
    } else {
      const text = await response.text();
      console.error(`[IndexNow] ERROR -> Status ${response.status}:`, text);
      return urls.map(u => ({ url: u, status: 'error', error: text }));
    }
  } catch (err) {
    console.error(`[IndexNow] FATAL ERROR:`, err.message);
    return urls.map(u => ({ url: u, status: 'error', error: err.message }));
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const action = args[0];
  const urls = args.slice(1);

  if (!['URL_UPDATED', 'URL_DELETED'].includes(action)) {
    console.error('Usage: node scripts/indexing/ping-search-engines.mjs <URL_UPDATED|URL_DELETED> <url1> <url2> ...');
    process.exit(1);
  }

  if (urls.length === 0) {
    console.error('No URLs provided. Exiting.');
    process.exit(0);
  }

  const GOOGLE_SA_JSON_STR = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const INDEXNOW_KEY = process.env.INDEXNOW_KEY;
  let HOST_NAME = process.env.HOST_NAME;

  if (!HOST_NAME) {
    try {
      HOST_NAME = new URL(urls[0]).hostname;
    } catch {
      console.error('Invalid URL provided. Cannot extract hostname.');
      process.exit(1);
    }
  }

  const tasks = [];

  // 1. Google Indexing API Task
  if (GOOGLE_SA_JSON_STR) {
    try {
      const saJson = JSON.parse(GOOGLE_SA_JSON_STR);
      tasks.push(pingGoogleIndexingAPI(urls, action, saJson));
    } catch {
      console.error('[Configuration Error] Invalid GOOGLE_SERVICE_ACCOUNT_JSON format.');
    }
  } else {
    console.warn('[Warning] GOOGLE_SERVICE_ACCOUNT_JSON not provided. Skipping Google Indexing API.');
  }

  // 2. IndexNow Task
  if (INDEXNOW_KEY) {
    tasks.push(pingIndexNow(urls, HOST_NAME, INDEXNOW_KEY));
  } else {
    console.warn('[Warning] INDEXNOW_KEY not provided. Skipping IndexNow.');
  }

  console.log(`\n--- Dispatching Pings for ${urls.length} URL(s) [Action: ${action}] ---`);
  
  // Non-blocking execution
  await Promise.allSettled(tasks);
  
  console.log(`--- Ping Execution Complete ---\n`);
}

main().catch(err => console.error("Unhandled exception:", err));
