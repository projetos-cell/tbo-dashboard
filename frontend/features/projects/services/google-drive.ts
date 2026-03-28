import { createLogger } from "@/lib/logger";

const log = createLogger("google-drive");

/**
 * Creates Google Drive folder structure for a project.
 * Calls the API route that uses a Google Service Account.
 */
export async function createProjectDriveFolder(
  projectId: string,
  projectName: string,
): Promise<{ folderId: string; folderUrl: string } | null> {
  try {
    const res = await fetch("/api/google/drive/create-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, projectName }),
    });

    if (!res.ok) {
      const err = await res.json();
      log.error("Failed to create folder", { projectId, err });
      return null;
    }

    return res.json();
  } catch (err) {
    log.error("Unexpected error", { projectId, err: String(err) });
    return null;
  }
}
