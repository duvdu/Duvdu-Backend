import express from "express";
import cookieSession from "cookie-session";
import dotenv from "dotenv";
import { globalErrorHandlingMiddleware } from "@duvdu-v1/duvdu";


export const app = express();
dotenv.config();

app.set("trust proxy", true);
app.use(express.json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test"
}));


//global error middleware
app.use(globalErrorHandlingMiddleware)