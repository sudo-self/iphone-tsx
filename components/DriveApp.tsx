"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRef, useState } from "react";
import GooglePicker from "./GooglePicker";

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
  return data.files as Array<{
    id: string;
    name: string;
    mimeType: string;
    iconLink?: string;
  }>;
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
  const [pickedFile, setPickedFile] = useState<any | null>(null);

  const fallbackIcon =
    "https://drive-thirdparty.googleusercontent.com/16/type/image/png";

  const uploadToDrive = async () => {
    const file = fileInputRef.current?.files?.[0];
    const accessToken = (session as any)?.accessToken || (session as any)?.access_token;

    if (!file) return alert("📂 Please select a file.");
    if (!accessToken) return alert("🔒 Missing access token. Please sign in again.");

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
    if (!accessToken) return alert("🔒 Missing access token. Please sign in again.");

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
    <div className="bg-gray-200 min-h-screen w-full max-w-md mx-auto p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-green-800 mb-6 text-center">Google Drive</h1>

      {session ? (
        <>
          <div className="text-sm text-blue-600 mb-4 text-center">
            Signed in as <span className="font-semibold">{session.user?.email}</span>
          </div>

          <div className="flex flex-col items-center gap-3 mb-6">
            <input
              type="file"
              accept="image/*,.pdf,.zip,.doc,.docx,.txt"
              ref={fileInputRef}
              className="w-full text-sm"
            />
            <button
              onClick={uploadToDrive}
              disabled={uploading}
              className={`w-full px-4 py-2 rounded text-black font-medium transition ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {uploading ? "Uploading..." : "Upload to Google Drive"}
            </button>
          </div>


          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={fetchFiles}
              disabled={loadingFiles}
              className="w-full px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingFiles ? "Loading files..." : "Drive Files"}
            </button>

            <GooglePicker onPick={(file) => setPickedFile(file)} />
          </div>

   
          {pickedFile && (
            <div className="bg-white border border-gray-300 rounded p-4 text-sm mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Picked File</h3>
              <pre className="text-gray-600 whitespace-pre-wrap break-words text-xs">
                {JSON.stringify(pickedFile, null, 2)}
              </pre>
            </div>
          )}

     
          {listError && <p className="text-red-600 mb-4">{listError}</p>}

  
          {files.length > 0 && (
            <div className="bg-white border border-gray-300 rounded p-4">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Drive Files</h3>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {files.map(({ id, name, iconLink }) => (
                  <li
                    key={id}
                    className="flex items-center space-x-3 text-sm text-gray-700 border-b border-gray-200 pb-2"
                  >
                    <img
                      src={iconLink || fallbackIcon}
                      alt="file icon"
                      className="w-5 h-5"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

  
          <div className="text-center mt-6">
            <button
              onClick={() => signOut()}
              className="text-red-600 hover:underline text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </>
      ) : (
        <div className="flex justify-center">
          <button
            onClick={() => signIn("google")}
            className="bg-green-700 text-white px-6 py-2 rounded font-semibold hover:bg-pink-700 transition"
          >
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
}









