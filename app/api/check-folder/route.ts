// app/api/check-folder/route.ts
import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { name_email, name } = await request.json();

    const projectRoot = process.cwd();
    const parentDir = path.join(projectRoot, "..");
    const dataDir = path.join(parentDir, "data", "pics");
    const name_val = `[${name_email}] ${name}`;

    const folders = readdirSync(dataDir, { withFileTypes: true });
    const exists = folders
      .filter((dirent) => dirent.isDirectory())
      .some((dir) => dir.name === name_val);

    return NextResponse.json({ exists, dataDir, name_val });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
