"use client";

import { useForm, ValidationError } from "@formspree/react";
import { SendHorizonal, Mail } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti";

const formId = process.env.NEXT_PUBLIC_FORMSPREE_ID;

if (!formId) {
  throw new Error("Missing NEXT_PUBLIC_FORMSPREE_ID environment variable");
}

export default function EmailApp() {
  const [state, handleSubmit, reset] = useForm(formId);

  useEffect(() => {
    if (state.succeeded) {
      confetti();
      const timeout = setTimeout(() => reset(), 1500);
      return () => clearTimeout(timeout);
    }
  }, [state.succeeded, reset]);

  if (state.succeeded) {
    return (
      <div className="p-6 text-center text-green-600">
        <p>Email sent successfully!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 text-white">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Mail className="w-5 h-5" /> New Email
      </h2>

      <div>
        <input
          type="email"
          name="email"
          placeholder="YourAwesome@gmail.com"
          required
          className="w-full p-2 rounded bg-white/10 border border-white/20"
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} />
      </div>

      <div>
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          required
          className="w-full p-2 rounded bg-white/10 border border-white/20"
        />
      </div>

      <div>
        <textarea
          name="message"
          placeholder="Message"
          required
          rows={4}
          className="w-full p-2 rounded bg-white/10 border border-white/20"
        />
        <ValidationError prefix="Message" field="message" errors={state.errors} />
      </div>

      <button
        type="submit"
        disabled={state.submitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
      >
        <SendHorizonal className="w-4 h-4" />
        Send
      </button>
    </form>
  );
}
