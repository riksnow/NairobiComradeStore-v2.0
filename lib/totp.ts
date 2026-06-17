import { authenticator } from "otplib";

// Allow a small clock-drift window (±1 step).
authenticator.options = { window: 1 };

export const ISSUER = "NairobiComradeStore";

export function generateSecret(): string {
  return authenticator.generateSecret();
}

export function otpauthURL(email: string, secret: string): string {
  return authenticator.keyuri(email, ISSUER, secret);
}

export function verifyToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token: String(token).replace(/\s/g, ""), secret });
  } catch {
    return false;
  }
}
