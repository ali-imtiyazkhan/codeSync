import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { VSCODE_EXTENSION_VSIX } from "@/lib/vscodeExtension";

const VSIX_CANDIDATE_PATHS = [
  path.join(process.cwd(), "public", "extensions", VSCODE_EXTENSION_VSIX),
  path.join(process.cwd(), "..", "vscode-extension", VSCODE_EXTENSION_VSIX),
];

export async function GET() {
  for (const filePath of VSIX_CANDIDATE_PATHS) {
    try {
      const data = await readFile(filePath);
      return new NextResponse(data, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${VSCODE_EXTENSION_VSIX}"`,
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch {
      // try next path
    }
  }

  return NextResponse.json(
    {
      error: "VSIX not found",
      hint: "From the repo root run: pnpm --filter codesync-vscode run package",
    },
    { status: 404 },
  );
}
