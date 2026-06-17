/*
  Resend email sender. Never throws — logs and returns false on failure so a
  failed email can never break order creation or status updates. No-ops (returns
  false) when RESEND_API_KEY is not configured.
*/

type SendArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendArgs): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? process.env.SENDER_EMAIL ?? "Nairobi Comrade Store <onboarding@resend.dev>";
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set — skipping send to", to);
    return false;
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      console.error("[email] send failed:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] unexpected error:", err);
    return false;
  }
}
