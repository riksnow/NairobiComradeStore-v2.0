/*
  M-Pesa Daraja STK push. No-ops with a clear result when credentials are absent
  so checkout still works in the base/demo. On success returns the Safaricom
  CheckoutRequestID; the webhook (app/api/webhooks/mpesa) later confirms payment.
*/

const BASE: Record<string, string> = {
  sandbox: "https://sandbox.safaricom.co.ke",
  production: "https://api.safaricom.co.ke",
};

function configured() {
  return Boolean(
    process.env.MPESA_CONSUMER_KEY &&
      process.env.MPESA_CONSUMER_SECRET &&
      process.env.MPESA_PASSKEY &&
      process.env.MPESA_SHORTCODE
  );
}

async function getAccessToken(base: string): Promise<string | null> {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");
  const res = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

export type StkResult =
  | { ok: true; checkoutRequestId: string }
  | { ok: false; reason: string };

export async function initiateStkPush(params: {
  phone: string; // 2547XXXXXXXX
  amount: number;
  accountRef: string;
  description?: string;
}): Promise<StkResult> {
  if (!configured()) {
    return { ok: false, reason: "M-Pesa not configured" };
  }
  const env = (process.env.MPESA_ENV ?? process.env.MPESA_ENVIRONMENT) === "production" ? "production" : "sandbox";
  const base = BASE[env];
  try {
    const token = await getAccessToken(base);
    if (!token) return { ok: false, reason: "Failed to get access token" };

    const ts = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);
    const shortcode = process.env.MPESA_SHORTCODE as string;
    const password = Buffer.from(
      `${shortcode}${process.env.MPESA_PASSKEY}${ts}`
    ).toString("base64");

    const res = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: ts,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(params.amount),
        PartyA: params.phone,
        PartyB: shortcode,
        PhoneNumber: params.phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: params.accountRef,
        TransactionDesc: params.description ?? "NairobiComradeStore order",
      }),
    });
    const data = (await res.json()) as { CheckoutRequestID?: string; errorMessage?: string };
    if (data.CheckoutRequestID) return { ok: true, checkoutRequestId: data.CheckoutRequestID };
    return { ok: false, reason: data.errorMessage ?? "STK push failed" };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "STK push error" };
  }
}
