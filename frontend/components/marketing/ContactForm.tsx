"use client";

import { FormEvent, useState } from "react";
import { API_BASE } from "@/lib/api-base";
import { useToast } from "@/components/providers/ToastProvider";
import { track } from "@/lib/analytics";

type ContactResponse = { message?: string; detail?: string };

export function ContactForm() {
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setSending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      website: String(formData.get("website") ?? ""),
    };

    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ContactResponse;
      if (!response.ok) {
        throw new Error(result.detail || "We couldn't send your message. Please try again.");
      }
      form.reset();
      track("contact_form_success");
      showToast(result.message || "Your message has been sent.", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "We couldn't send your message. Please try again.",
        "error",
      );
    } finally {
      setSending(false);
    }
  }

  const fieldClass =
    "w-full rounded-input border border-border bg-white px-4 py-3 text-sm text-ink-primary placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <form className="mt-5 space-y-4" onSubmit={submit}>
      <div>
        <label htmlFor="contact-name" className="mb-1 block text-sm font-semibold text-ink-primary">Name</label>
        <input id="contact-name" name="name" autoComplete="name" required maxLength={100} placeholder="Your name" className={fieldClass} />
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1 block text-sm font-semibold text-ink-primary">Email</label>
        <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="Your email" className={fieldClass} />
      </div>
      <div>
        <label htmlFor="contact-subject" className="mb-1 block text-sm font-semibold text-ink-primary">Subject</label>
        <input id="contact-subject" name="subject" required minLength={3} maxLength={150} placeholder="What can we help with?" className={fieldClass} />
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1 block text-sm font-semibold text-ink-primary">Message</label>
        <textarea id="contact-message" name="message" rows={5} required minLength={10} maxLength={5000} placeholder="Write your message" className={fieldClass} />
      </div>
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button disabled={sending} type="submit" className="rounded-input bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60">
        {sending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
