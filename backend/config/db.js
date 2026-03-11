import mongoose from "mongoose";
import dns from "node:dns/promises";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

async function withTimeout(promise, timeoutMs, message) {
  let timeoutId;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function preflightMongoSrv(uri) {
  if (!uri.startsWith("mongodb+srv://")) return;

  const hostMatch = uri.match(/@([^/?]+)/);
  const host = hostMatch ? hostMatch[1] : "";
  if (!host) return;

  await withTimeout(
    dns.resolveSrv(`_mongodb._tcp.${host}`),
    5000,
    `DNS SRV lookup timed out for ${host}`,
  );
}

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const fallbackUri = process.env.MONGO_URI_FALLBACK || "mongodb://127.0.0.1:27017/uzima";

  if (!primaryUri) {
    throw new Error("Missing MONGO_URI (or MONGODB_URI) in environment variables.");
  }

  const connectOptions = {
    serverSelectionTimeoutMS: 12000,
    connectTimeoutMS: 12000,
  };
  const attempts = [primaryUri];
  if (fallbackUri && fallbackUri !== primaryUri) attempts.push(fallbackUri);

  for (const uri of attempts) {
    try {
      await preflightMongoSrv(uri);
      await mongoose.connect(uri, connectOptions);
      console.log(`MongoDB connected successfully (${uri.includes("127.0.0.1") ? "local" : "remote"})`);
      return;
    } catch (error) {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect().catch(() => {});
      }
      const hostMatch = uri.match(/@([^/?]+)/);
      const host = hostMatch ? hostMatch[1] : uri;
      console.error(`MongoDB connection attempt failed for ${host}: ${error.message}`);
    }
  }

  throw new Error(
    "Unable to connect to MongoDB using both primary and fallback URIs. Check Atlas network access, URI credentials, or run local MongoDB.",
  );
};

export default connectDB;
