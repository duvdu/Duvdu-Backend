import { Request } from "express";
import jwt from "jsonwebtoken";


export const generateToken = (payload: { id: string, email: string } , req:Request) => {
    const token = jwt.sign(payload, process.env.JWT_KEY!, { expiresIn: '10d' });
    req.session = {
        jwt: token
    };
    return req;
};