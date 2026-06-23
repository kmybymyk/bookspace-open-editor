import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

const distRoot = "dist";
const routes = ["editor/index.html", "en/editor/index.html"];

await Promise.all(
  routes.map(async (route) => {
    const target = join(distRoot, route);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(join(distRoot, "index.html"), target);
  }),
);
