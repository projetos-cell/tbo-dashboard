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
      console.error("[google-drive] Failed to create folder:", err);
      return null;
    }

    return res.json();
  } catch (err) {
    console.error("[google-drive] Error:", err);
    return null;
  }
}
