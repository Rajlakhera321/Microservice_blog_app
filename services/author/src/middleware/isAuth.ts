import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    image: string;
    instagram: string;
    facebook: string;
    linkedIn: string;
    bio: string;
}

export interface AuthenticatedRequest extends Request {
    user?: IUser | null
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Please login - No auth header"
            })
        }

        const token = authHeader.split(" ")[1];

        const decodeValue = jwt.verify(token, process.env.JWT_SEC as string) as JwtPayload;

        if (!decodeValue || !decodeValue.user) {
            return res.status(401).json({
                message: "Invalid token"
            })
        }

        req.user = decodeValue.user;

        next();
    } catch (error: any) {
        console.log(error.message, "JWT Authentication Error");
        return res.status(401).json({
            message: "Please Login - jwt error"
        })
    }
}