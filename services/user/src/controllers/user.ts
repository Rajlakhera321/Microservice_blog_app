import { Request, Response } from "express";
import User from "../model/User.js";
import jwt from 'jsonwebtoken';
import TryCatch from "../util/tryCatch.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../util/datauri.js";
import { v2 as cloudinary } from "cloudinary";
import { oauth2client } from "../util/googleConfig.js";
import axios from "axios";
import { google } from "googleapis";

export const loginUser = TryCatch(async (req, res) => {
    const { code } = req.body;

    if (!code) {
        res.status(400).json({
            message: "Authorization code is required."
        });
        return;
    }

    const googleRes = await oauth2client.getToken(code);

    oauth2client.setCredentials(googleRes.tokens);

    let userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`)

    const { email, name, picture } = userRes.data;

    let user = await User.findOne({ email });

    if (!user) {
        user = await User.create({
            name,
            email,
            image: picture,
        })
    }

    const token = await jwt.sign({ user }, process.env.JWT_SEC as string, {
        expiresIn: '5d'
    })

    res.status(200).json({
        message: "Login success",
        token,
        user
    })
})

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    res.json(user);
})

export const getUserProfile = TryCatch(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404).json({
            message: "No User With Given Id."
        })
        return;
    }

    res.status(200).json(user);
})

export const updateUser = TryCatch(async (req: AuthenticatedRequest, res) => {
    const { name, instagram, facebook, linkedIn, bio } = req.body;

    const user = await User.findByIdAndUpdate(req.user?._id, {
        name,
        instagram,
        facebook,
        linkedIn,
        bio
    }, { new: true });

    const token = await jwt.sign({ user }, process.env.JWT_SEC as string, {
        expiresIn: '5d'
    })

    res.status(200).json({
        message: "User Updated",
        token,
        user
    })
})

export const updateProfilePic = TryCatch(async (req: AuthenticatedRequest, res) => {
    const file = req.file;
    if (!file) {
        res.status(400).json({
            message: "No file to upload."
        })
        return;
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
        res.status(400).json({
            message: "Failed to generate buffer."
        })
        return;
    }

    const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
        folder: "blogs"
    });

    const user = await User.findByIdAndUpdate(req.user?._id, {
        image: cloud.secure_url
    }, { new: true });

    const token = await jwt.sign({ user }, process.env.JWT_SEC as string, {
        expiresIn: '5d'
    })

    res.status(200).json({
        message: "User profile pic updated",
        token,
        user
    })
})