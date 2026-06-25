import mongoose from "mongoose";

type MongoCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var fr3shWMSMongo: MongoCache | undefined;
}

const cache = globalThis.fr3shWMSMongo ?? { conn: null, promise: null };
globalThis.fr3shWMSMongo = cache;

const getMongoUri = () => {
  const uri = process.env.MONGODB_URI?.trim().replace(/^["']|["']$/g, "");
  if (!uri || uri.includes("<name>") || uri.includes("<pwd>")) {
    throw new Error("MONGODB_URI is missing or still contains placeholder credentials.");
  }
  return uri;
};

mongoose.set("bufferCommands", false);

export const mongoDB = async () => {
  if (cache.conn && mongoose.connection.readyState === 1) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(getMongoUri(), {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 30000,
        bufferCommands: false,
      })
      .then((m) => {
        console.log("FR3SH WMS DB Connected");
        cache.conn = m;
        return m;
      })
      .catch((err: unknown) => {
        cache.promise = null;
        cache.conn = null;
        throw err;
      });
  }

  return cache.promise;
};
