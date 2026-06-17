/*
  Orchestrates transactional order emails with deduplication. Each order tracks
  which emails were already sent in order.emailsSent.[kind]; we skip if already
  true and only mark true after a successful send. Email bodies are simple HTML
  here; swap in the React Email templates (emails/*) when wired.
*/

import { sendEmail } from "@/lib/email";
import { formatKsh } from "@/lib/utils";

export type EmailKind =
  | "confirmation"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export function emailKindForStatus(status: string): EmailKind | null {
  switch (status) {
    case "Pending": return "confirmation";
    case "Processing": return "processing";
    case "Shipped": return "shipped";
    case "Delivered": return "delivered";
    case "Cancelled": return "cancelled";
    default: return null;
  }
}

const SUBJECTS: Record<EmailKind, string> = {
  confirmation: "Your NairobiComradeStore order is confirmed",
  processing: "Your order is being prepared",
  shipped: "Your order has shipped",
  delivered: "Your order was delivered",
  cancelled: "Your order was cancelled",
};

type OrderLike = {
  _id?: unknown;
  total: number;
  status: string;
  emailsSent?: Partial<Record<EmailKind, boolean>>;
};

/**
 * Sends the email matching the order's current status if it hasn't been sent.
 * Returns the kind that was sent (so the caller can persist emailsSent), or null.
 */
export async function sendOrderEmailForStatus(
  order: OrderLike,
  toEmail: string,
  customerName = "comrade"
): Promise<EmailKind | null> {
  const kind = emailKindForStatus(order.status);
  if (!kind) return null;
  if (order.emailsSent?.[kind]) return null; // already sent — dedup

  const subject = SUBJECTS[kind];
  const html = `
    <div style="font-family:Georgia,serif;color:#3d3929">
      <h2 style="color:#c96442">${subject}</h2>
      <p>Hi ${customerName},</p>
      <p>Order total: <strong>${formatKsh(order.total)}</strong></p>
      <p>Asante for shopping with NairobiComradeStore.</p>
    </div>`;

  const ok = await sendEmail({ to: toEmail, subject, html });
  return ok ? kind : null;
}
