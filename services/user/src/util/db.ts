import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL as string);

        console.log("Connected to mongodb");
    } catch (error) {
        console.log(error, "connecttion error");
    }
}

export default connectDb;