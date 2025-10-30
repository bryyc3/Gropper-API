import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function generateAccessToken(phoneNumber){
    return jwt.sign({phoneNumber: phoneNumber}, process.env.ACCESS_SECRET, {expiresIn: process.env.JWT_ACCESS_EXPIRY})
}

export function generateRefreshToken(phoneNumber){
    return jwt.sign({phoneNumber: phoneNumber}, process.env.REFRESH_SECRET, {expiresIn: process.env.JWT_REFRESH_EXPIRY})
}

export function verifyAccessToken (req, res, next){
    const accessToken = req.headers['authorization']
    if (accessToken == null) return res.status(401).send("invalid")
        
    const tokenVerified = jwt.verify(accessToken, process.env.ACCESS_SECRET, (err, user) =>{
        if(err) return false
        return user
    })
    
    if(!tokenVerified) return res.sendStatus(401)
    
    next()
}//verify access token on every request 
  

export function verifyRefreshToken(token){
     return jwt.verify(token, process.env.REFRESH_SECRET, (err, user) =>{
        if(err) return false
        return user
    })
}

export function verifySocketToken(token){
    return jwt.verify(token, process.env.REFRESH_SECRET, (err, user) =>{
        if(err) return false
        return user
    })
}