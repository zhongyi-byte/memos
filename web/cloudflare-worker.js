export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    if (response.status !== 404) {
      return response;
    }

    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    const looksLikeAppRoute = !url.pathname.includes(".");

    if (acceptsHtml && looksLikeAppRoute) {
      const indexUrl = new URL("/index.html", request.url);
      return env.ASSETS.fetch(new Request(indexUrl, request));
    }

    return response;
  },
};
