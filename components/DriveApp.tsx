"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRef, useState } from "react";

export default function GoogleDrive() {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadToDrive = async () => {
    const file = fileInputRef.current?.files?.[0];
    const accessToken = (session as any)?.accessToken || (session as any)?.access_token;

    if (!file) return alert("Please select a file.");
    if (!accessToken) return alert("Missing access token. Please sign in again.");

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
        alert(`iphone tsx Uploaded to Drive with ID: ${data.fileId}`);
      } else {
        alert(`Upload failed: ${data.error || "Unknown error"}`);
      }
    } catch (error: any) {
      alert(`Upload failed: ${error.message || error}`);
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
          <input type="file" ref={fileInputRef} className="mb-4" />
          <button
            onClick={uploadToDrive}
            className={`px-4 py-2 rounded mb-4 text-white ${
              uploading ? "bg-gray-400 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-500"
            }`}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload to Google Drive"}
          </button>
          <button
            onClick={() => signOut()}
            className="text-red-500 underline"
          >
            Sign out
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn("google")}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-pink-500"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}


