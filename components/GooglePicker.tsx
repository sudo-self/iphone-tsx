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
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = () => {
        (window as any).gapi.load("client:auth2", {
          callback: () => {
            (window as any).gapi.load("picker", {
              callback: () => {
                setPickerReady(true);
              },
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
      alert("Missing access token");
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

