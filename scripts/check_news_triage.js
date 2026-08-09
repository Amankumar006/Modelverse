const fs = require('fs');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.SUPABASE_SERVICE_ROLE_KEY}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const schema = JSON.parse(data);
    const triage = schema.definitions?.news_triage || schema.components?.schemas?.news_triage;
    console.log(JSON.stringify(triage, null, 2));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
