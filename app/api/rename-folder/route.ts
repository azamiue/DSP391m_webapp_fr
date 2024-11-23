import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      index,
      name_email,
      name,
      tempName,
      organization,
      tempOrganization,
      selectPlan,
      tempSelectPlan,
    } = await request.json();

    // Define the directories
    const projectRoot = process.cwd();
    const parentDir = path.join(projectRoot, "..");
    const dataDir = path.join(parentDir, "data", "pics");

    // Build old and new folder paths
    const oldFolderName = `[${index}]_[${name_email}]_[${tempName}]_[${tempOrganization}]_[${tempSelectPlan}]`;
    const newFolderName = `[${index}]_[${name_email}]_[${name}]_[${organization}]_[${selectPlan}]`;
    const oldFolderPath = path.join(dataDir, oldFolderName);
    const newFolderPath = path.join(dataDir, newFolderName);

    // Rename the folder
    await fs.rename(oldFolderPath, newFolderPath);

    return NextResponse.json(
      {
        message: `Folder renamed from "${oldFolderName}" to "${newFolderName}" successfully.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error renaming folder:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
