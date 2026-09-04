export const DEFAULT_INDEXNOW_KEY = "e4c1b98f2a7d45609381e029471bfa3c";

export function getIndexNowKey(): string {
  return process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY;
}

export interface IndexNowResponse {
  ok: boolean;
  status: number;
  message?: string;
  urlCount: number;
}

/**
 * Submit URLs to the IndexNow protocol (supported by Microsoft Bing, Yandex, Seznam, Naver).
 */
export async function submitToIndexNow(
  urls: string[],
  options?: { host?: string; key?: string }
): Promise<IndexNowResponse> {
  if (!urls || urls.length === 0) {
    return { ok: true, status: 200, message: "No URLs to submit", urlCount: 0 };
  }

  const key = options?.key || getIndexNowKey();
  const firstUrl = urls[0];
  let host = options?.host;

  if (!host) {
    try {
      host = new URL(firstUrl).hostname;
    } catch {
      host = "www.themodelverse.in";
    }
  }

  // IndexNow allows maximum 10,000 URLs per batch
  const cleanUrls = Array.from(
    new Set(urls.filter((u) => typeof u === "string" && u.startsWith("http")))
  ).slice(0, 10000);

  const payload = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: cleanUrls,
  };

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    // 200: OK, 202: Accepted (valid key and URLs received by IndexNow)
    const isSuccess = res.ok || res.status === 200 || res.status === 202;
    const resText = await res.text().catch(() => "");

    return {
      ok: isSuccess,
      status: res.status,
      message: isSuccess
        ? "URLs successfully submitted to IndexNow (Bing & participating search engines)"
        : resText || `HTTP ${res.status}`,
      urlCount: cleanUrls.length,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "IndexNow network error";
    return {
      ok: false,
      status: 500,
      message: errMsg,
      urlCount: cleanUrls.length,
    };
  }
}
