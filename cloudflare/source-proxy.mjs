const TARGET_BASE = "http://fencing.yy-sport.com.cn";  // ← 改为 http

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/html, */*",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  "Referer": "https://fencing.yy-sport.com.cn/",
  "Origin": "https://fencing.yy-sport.com.cn",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // OPTIONS 预检直接放行
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    const canRetry = ["GET", "HEAD"].includes(request.method)
      || (request.method === "POST" && url.pathname === "/fencingapi/sigup/memberlistbytype");
    const body = ["GET", "HEAD"].includes(request.method) ? null
      : canRetry ? await request.arrayBuffer() : request.body;
    const send = (base) => fetch(base + url.pathname + url.search, {
      method: request.method,
      headers: {
        ...BROWSER_HEADERS,
        ...(request.headers.get("Content-Type")
          ? { "Content-Type": request.headers.get("Content-Type") }
          : {}),
        ...(request.headers.get("Authorization")
          ? { Authorization: request.headers.get("Authorization") }
          : {}),
      },
      body,
      ...(canRetry ? { signal: AbortSignal.timeout(10000) } : {}),
    });
    let response;
    let usedFallback = false;
    try {
      response = await send(TARGET_BASE);
    } catch (error) {
      if (!canRetry) throw error;
      usedFallback = true;
      response = await send("https://fencing.yy-sport.com.cn");
    }
    if (canRetry && !usedFallback && [502, 503, 504, 522, 524].includes(response.status)) {
      response = await send("https://fencing.yy-sport.com.cn");
    }

    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  },
};
