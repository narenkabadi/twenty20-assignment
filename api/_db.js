const { MongoClient } = require("mongodb");

let cached = global._mongoCached;
if (!cached) cached = global._mongoCached = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in env");
  }

  if (!cached.promise) {
    const client = new MongoClient(process.env.MONGODB_URI);
    cached.promise = client.connect().then((client) => {
      return {
        client,
        db: client.db("twenty20_assignment"),
        users: client.db("twenty20_assignment").collection("users")
      };
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };
