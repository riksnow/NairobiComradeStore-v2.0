import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

/**
 * Connect to MongoDB once and reuse the connection across hot reloads and
 * serverless invocations. The in-flight promise is cached too; on failure it
 * is reset so a later call can retry instead of awaiting a rejected promise.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to your environment.");
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        family: 4, // force IPv4 — avoids ReplicaSetNoPrimary on broken IPv6 networks
        serverSelectionTimeoutMS: 15000, // fail fast with a clear error
      })
      .catch((err) => {
        cache.promise = null; // allow retry on next call
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
