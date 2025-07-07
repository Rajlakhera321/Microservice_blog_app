import express from "express";
import { config } from "dotenv";
import blogRoutes from "./routes/blog.js";
import { sql } from "./util/db.js";
import { v2 as cloudinary } from "cloudinary";
import { connectRabbitMQ } from "./util/rabbitmq.js";
import cors from "cors";

config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

const app = express();

connectRabbitMQ();

app.use(express.json());
app.use(cors());

app.use("/api/v1", blogRoutes);

const port = process.env.PORT || 5001;

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
