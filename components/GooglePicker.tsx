"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface GooglePickerProps {
  onPick: (file: any) => void;
}

export default function GooglePicker({ onPick }: GooglePickerProps) {
  const { data: session } = useSession();
  const [pickerReady, setPickerReady] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    const loadPicker = () => {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.async = true;
      script.onload = () => {
        (window as any).gapi.load("client:auth2", {
          callback: () => {
            (window as any).gapi.load("picker", {
              callback: () => setPickerReady(true),
            });
          },
        });
      };
      document.body.appendChild(script);
    };

    if (!(window as any).gapi) {
      loadPicker();
    } else {
      (window as any).gapi.load("picker", {
        callback: () => setPickerReady(true),
      });
    }
  }, []);

  const openPicker = () => {
    const token = (session as any)?.accessToken;

    if (!token) {
      alert("🔐 Missing access token. Please sign in.");
      return;
    }

    const view = new (window as any).google.picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true);

    const picker = new (window as any).google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(token)
      .setDeveloperKey(process.env.NEXT_PUBLIC_PICKER_API_KEY)
      .setCallback((data: any) => {
        if (data.action === "picked" && data.docs.length > 0) {
          onPick(data.docs[0]);
        } else if (data.action === "cancel") {
          console.log("❌ Picker cancelled");
        }
        setPickerOpen(false);
      })
      .build();

    picker.setVisible(true);
    setPickerOpen(true);
  };

  return (
    <div className="w-full text-center mt-2">
      <button
        onClick={openPicker}
        disabled={!pickerReady || pickerOpen}
        className={`px-4 py-2 rounded font-medium text-white transition ${
          pickerReady && !pickerOpen
            ? "bg-indigo-600 hover:bg-indigo-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {pickerReady
          ? pickerOpen
            ? "Picker Open"
            : "📂 Pick from Google Drive"
          : "Loading Picker..."}
      </button>
    </div>
  );
}



