"use client"

import { useEffect } from "react"

export function useMessengerWebhook(callback: (event: any) => void) {
  useEffect(() => {
    async function handleWebhookEvent(event: any) {
      try {
       
        if (event?.object === "page") {
          for (const entry of event.entry || []) {
            for (const msg of entry.messaging || []) {
              callback(msg)
            }
          }
        }
      } catch (err) {
        console.error("[Messenger] Hook error:", err)
      }
    }


    window.addEventListener("messenger-event", (e: any) => handleWebhookEvent(e.detail))

    return () => {
      window.removeEventListener("messenger-event", (e: any) => handleWebhookEvent(e.detail))
    }
  }, [callback])
}
