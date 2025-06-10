import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function generateToken(phoneNumber, tokenType){
    if(tokenType === 'refresh'){
        return jwt.sign({phoneNumber: phoneNumber}, process.env.TOKEN_SECRET, {expiresIn: [process.env.JWT_REFRESH_EXPIRY]})
    }
    else if(tokenType === 'access'){
        return jwt.sign({phoneNumber: phoneNumber}, process.env.TOKEN_SECRET, {expiresIn: [process.env.JWT_ACCESS_EXPIRY]})
    }
    
}