import jwt from 'jsonwebtoken';


export const generateToken = (payload: { id: string; permession: string[] }) =>
  jwt.sign(payload, process.env.JWT_KEY!, {
    expiresIn: '1m'
  });
