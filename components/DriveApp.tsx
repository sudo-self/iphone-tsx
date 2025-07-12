"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRef, useState } from "react";

async function listDriveFiles(accessToken: string) {
  const res = await fetch(
    "https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,iconLink)",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || "Failed to list files");
  }

  const data = await res.json();
  return data.files as Array<{ id: string; name: string; mimeType: string; iconLink?: string }>;
}

export default function DriveApp() {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<
    Array<{ id: string; name: string; mimeType: string; iconLink?: string }>
  >([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const uploadToDrive = async () => {
    const file = fileInputRef.current?.files?.[0];
    const accessToken = (session as any)?.accessToken || (session as any)?.access_token;

    if (!file) {
      alert("📂 Please select a file.");
      return;
    }
    if (!accessToken) {
      alert("🔒 Missing access token. Please sign in again.");
      return;
    }

    try {
      setUploading(true);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-access-token": accessToken,
          "x-file-name": encodeURIComponent(file.name),
          "x-mime-type": file.type || "application/octet-stream",
        },
        body: file,
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ '${file.name}' uploaded to Drive!\nFile ID: ${data.fileId}`);
      } else {
        alert(`❌ Upload failed: ${data.error || "Unknown error"}`);
      }
    } catch (error: any) {
      alert(`❌ Upload failed: ${error.message || error}`);
    } finally {
      setUploading(false);
    }
  };

  const fetchFiles = async () => {
    const accessToken = (session as any)?.accessToken || (session as any)?.access_token;
    if (!accessToken) {
      alert("🔒 Missing access token. Please sign in again.");
      return;
    }
    setLoadingFiles(true);
    setListError(null);
    try {
      const files = await listDriveFiles(accessToken);
      setFiles(files);
    } catch (e: any) {
      setListError(e.message);
    } finally {
      setLoadingFiles(false);
    }
  };

  return (
    <div className="bg-gray-200 flex flex-col items-center p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl text-gray-200 font-semibold mb-4">Google Drive Upload</h2>
      {session ? (
        <>
          <p className="mb-2 text-yellow-500">Signed in as {session.user?.email}</p>
          <input
            type="file"
            accept="image/*,.pdf,.zip,.doc,.docx,.txt"
            ref={fileInputRef}
            className="mb-4"
          />
          <button
            onClick={uploadToDrive}
            disabled={uploading}
            className={`px-4 py-2 rounded mb-4 text-white ${
              uploading ? "bg-gray-400 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-600"
            }`}
          >
            {uploading ? "Uploading..." : "Upload to Google Drive"}
          </button>

          {/* New List Files Button */}
          <button
            onClick={fetchFiles}
            disabled={loadingFiles}
            className="mb-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loadingFiles ? "Loading files..." : "List My Drive Files"}
          </button>

          {/* Error Message */}
          {listError && <p className="text-red-500 mb-2">{listError}</p>}

          {/* Files List */}
          <ul className="w-full text-left">
            {files.map(({ id, name, iconLink }) => (
              <li key={id} className="flex items-center space-x-3 py-2 border-b border-gray-700">
                {iconLink && (
                  <img
                    src={iconLink}
                    alt=""
                    className="w-6 h-6"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span>{name}</span>
              </li>
            ))}
          </ul>

          <button onClick={() => signOut()} className="text-red-400 hover:underline mt-6">
            Sign out
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn("google")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-pink-600"
        >
          Google Sign in
        </button>
      )}
    </div>
  );
}





