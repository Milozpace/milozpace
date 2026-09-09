import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const rootIndex = process.argv.indexOf("--root");
const root = resolve(rootIndex >= 0 ? process.argv[rootIndex + 1] : resolve(process.cwd(), "out"));
const portIndex = process.argv.indexOf("--port");
const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : process.env.PORT ?? 4173);

if (!existsSync(root)) {
  console.error("预览目录不存在；默认请先运行 npm run build。");
  process.exit(1);
}

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

createServer((request, response) => {
  const rawPath = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  const safePath = normalize(rawPath).replace(/^([/\\])+/, "");
  let filePath = join(root, safePath);
  if (!filePath.startsWith(root)) filePath = join(root, "404.html");
  else if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, "index.html");
  else if (!existsSync(filePath) && existsSync(`${filePath}.html`)) filePath = `${filePath}.html`;
  if (!existsSync(filePath)) {
    response.statusCode = 404;
    const fallback = join(root, "404.html");
    if (!existsSync(fallback)) {
      response.setHeader("Content-Type", "text/plain; charset=utf-8");
      response.end("Not found");
      return;
    }
    filePath = fallback;
  }
  response.setHeader("Content-Type", mime[extname(filePath)] ?? "application/octet-stream");
  response.setHeader("Cache-Control", "no-store");
  createReadStream(filePath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Milozpace preview: http://127.0.0.1:${port}`);
});
