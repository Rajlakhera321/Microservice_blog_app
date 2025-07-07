import express from "express";
import { config } from "dotenv";
import connectDb from "./util/db.js";
import userRoutes from "./routes/user.js"
import { v2 as cloudinary } from 'cloudinary';
import cors from "cors";

config();

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_SECRET_KEY
});

const app = express();
app.use(cors());

await connectDb();
app.use(express.json());

app.use("/api/v1", userRoutes);

const port = process.env.PORT;

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`))