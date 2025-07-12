"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRef, useState } from "react";

export default function DriveApp() {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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
          "x-file-name": file.name,
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

  return (
    <div className="flex flex-col items-center p-6">
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
          <button onClick={() => signOut()} className="text-red-400 hover:underline">
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




