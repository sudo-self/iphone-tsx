"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface GooglePickerProps {
  onPick: (file: any) => void;
}

export default function GooglePicker({ onPick }: GooglePickerProps) {
  const { data: session } = useSession();
  const [pickerReady, setPickerReady] = useState(false);

  useEffect(() => {
    const loadPicker = () => {
      if ((window as any).google && (window as any).google.picker) {
        setPickerReady(true);
      } else {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.onload = () => {
          (window as any).gapi.load("picker", {
            callback: () => setPickerReady(true),
          });
        };
        document.body.appendChild(script);
      }
    };

    loadPicker();
  }, []);

  const openPicker = () => {
    const token =
      (session as any)?.accessToken ||
      (session as any)?.access_token ||
      (session as any)?.id_token;

    if (!token) return alert("Missing access token");

    const view = new (window as any).google.picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true);

    const picker = new (window as any).google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(token)
      .setDeveloperKey(process.env.NEXT_PUBLIC_PICKER_API_KEY)
      .setCallback((data: any) => {
        if (data.action === "picked") {
          onPick(data.docs[0]);
        }
      })
      .build();

    picker.setVisible(true);
  };

  return (
    <button
      onClick={openPicker}
      disabled={!pickerReady}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      {pickerReady ? "Open Google Picker" : "Loading..."}
    </button>
  );
}
