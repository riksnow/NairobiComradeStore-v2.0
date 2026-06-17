import { isValidObjectId } from "mongoose";

/**
 * Resolve the Mongoose user document for the current session.
 * Tries the session id first, then falls back to the email — this keeps
 * account actions working even if a JWT carries a stale/missing id
 * (e.g. after re-seeding the database).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function resolveUserDoc(User: any, sessionUser: { id?: string; email?: string | null } | null) {
  if (!sessionUser) return null;
  if (sessionUser.id && isValidObjectId(sessionUser.id)) {
    const byId = await User.findById(sessionUser.id);
    if (byId) return byId;
  }
  if (sessionUser.email) {
    return User.findOne({ email: String(sessionUser.email).toLowerCase() });
  }
  return null;
}
