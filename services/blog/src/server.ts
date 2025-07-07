import express from "express";
import { config } from "dotenv";
import blogRoutes from "./routes/blogs.js";
import { sql } from "./utils/db.js";
import { createClient } from "redis";
import { startCacheConsumer } from "./utils/consumer.js";
import cors from "cors";

config();

const app = express();

app.use(express.json());
app.use(cors());

await startCacheConsumer();

const port = process.env.PORT || 5001;

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient
  .connect()
  .then(() => console.log("Connected to redis"))
  .catch(console.error);

app.use("/api/v1", blogRoutes);

async function initDB() {
  try {
    await sql`
        CREATE TABLE IF NOT EXISTS blogs(
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        blogcontent TEXT NOT NULL,
        image VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

    // await sql`
    // CREATE TABLE IF NOT EXISTS blogs(
    // id SERIAL PRIMARY KEY,
    // title VARCHAR(255) NOT NULL,
    // description VARCHAR(255) NOT NULL,
    // blogcontent TEXT NOT NULL,
    // image VARCHAR(255) NOT NULL,
    // category VARCHAR(255) NOT NULL,
    // author VARCHAR(255) NOT NULL,
    // create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    // )`

    await sql`
        CREATE TABLE IF NOT EXISTS comments(
        id SERIAL PRIMARY KEY,
        comment VARCHAR(255) NOT NULL,
        userid VARCHAR(255) NOT NULL,
        username TEXT NOT NULL,
        blogid VARCHAR(255) NOT NULL,
        create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

    await sql`
        CREATE TABLE IF NOT EXISTS savedblogs(
        id SERIAL PRIMARY KEY,
        userid VARCHAR(255) NOT NULL,
        blogid VARCHAR(255) NOT NULL,
        create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

    console.log("database initialized successfully.");
  } catch (error) {
    console.log("Error initDb", error);
  }
}

initDB().then(() => {
  app.listen(port, () =>
    console.log(`Server is running on http://localhost:${port}`)
  );
});
