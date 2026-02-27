import { Router } from 'express';
import * as otpService from '../authentication/sms.js';
import * as jwtService from '../authentication/jwtUtils.js';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

router.post('/generate-otp', async (req, res) =>{
    const userPhoneNumber = JSON.parse(req.body.phoneNumber);

    if(userPhoneNumber == process.env.DEVTEST_PHONE){
      res.status(200).send(true)
    } else {
      const otpSent = await otpService.sendOtp(userPhoneNumber);
      if(otpSent === "pending"){
        res.status(200).send(true)
      }
    }
})//send user otp for authorization 
  
router.post('/verify-otp', async (req, res) =>{
    const userPhoneNumber = JSON.parse(req.body.phoneNumber);
    const enteredOtp = JSON.parse(req.body.userCode);
    
    if(userPhoneNumber == process.env.DEVTEST_PHONE && enteredOtp == process.env.DEVTEST_PASSWORD){
      const refresh = jwtService.generateRefreshToken(userPhoneNumber);
      const access = jwtService.generateAccessToken(userPhoneNumber);
      const tokens = {refreshToken: refresh, accessToken: access};
      res.json(tokens);
    } else{
      const otpVerified =  await otpService.verifyOtp(userPhoneNumber, enteredOtp)
  
      if(otpVerified === "approved"){
        const refresh = jwtService.generateRefreshToken(userPhoneNumber);
        const access = jwtService.generateAccessToken(userPhoneNumber);
        const tokens = {refreshToken: refresh, accessToken: access};
        res.json(tokens);
      }
      if(otpVerified === "pending"){
        console.log("Incorrect password");
        res.status(400)
      }
    }
})//verify otp sent to user via sms

export default router;