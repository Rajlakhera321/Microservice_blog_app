import {google} from "googleapis";
import {config} from "dotenv";

config();

const GOOGLE_CLOUD_ID = process.env.GOOGLE_CLOUD_ID;
const GOOGLE_CLOUD_SECRET = process.env.GOOGLE_CLOUD_SECRET;

export const oauth2client = new google.auth.OAuth2(
    GOOGLE_CLOUD_ID,
    GOOGLE_CLOUD_SECRET,
    "postmessage"
);