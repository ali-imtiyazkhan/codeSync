import { copyFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");
const vsixName = "codesync-vscode-0.0.1.vsix";
const src = path.join(webRoot, "..", "vscode-extension", vsixName);
const destDir = path.join(webRoot, "public", "extensions");
const dest = path.join(destDir, vsixName);

await mkdir(destDir, { recursive: true });
await copyFile(src, dest);
console.log(`Copied ${vsixName} → public/extensions/`);
