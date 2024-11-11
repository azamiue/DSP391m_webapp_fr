import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const name = formData.get("name") as string;

    if (!image || !name) {
      return NextResponse.json(
        { error: "Image or email not provided" },
        { status: 400 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use /tmp directory instead of project directory
    const picsDir = join("/tmp", "pics", name);
    await mkdir(picsDir, { recursive: true });

    const filename = image.name;
    const filepath = join(picsDir, filename);
    await writeFile(filepath, new Uint8Array(buffer));

    // Return success response with the file path
    return NextResponse.json({
      success: true,
      filename,
      name,
      filepath: filepath,
    });
  } catch (error) {
    console.error("Error saving image:", error);
    return NextResponse.json(
      { error: "Failed to save image", details: (error as Error).message },
      { status: 500 }
    );
  }
}
