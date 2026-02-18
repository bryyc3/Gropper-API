import { Router } from 'express';
import * as otpService from '../authentication/sms.js';
import * as jwtService from '../authentication/jwtUtils.js';

const router = Router();

router.post('/generate-otp', async (req, res) =>{
    const userPhoneNumber = req.body.phoneNumber;
  
    const otpSent = await otpService.sendOtp(userPhoneNumber);
    
    if(otpSent === "pending"){
      res.status(200).send(true)
    }
})//send user otp for authorization 
  
router.post('/verify-otp', async (req, res) =>{
    const userPhoneNumber = req.body.phoneNumber;
    const enteredOtp = req.body.otp;
     
    const otpVerified = await otpService.verifyOtp(userPhoneNumber, enteredOtp)
  
    if(otpVerified === "approved"){
      const refresh = jwtService.generateRefreshToken(userPhoneNumber);
      const access = jwtService.generateAccessToken(userPhoneNumber);
      const tokens = {refreshToken: refresh, accessToken: access}
      res.json(tokens);
    }
    else{
      console.log("failed verification");
      res.status(400)
    }
})//verify otp sent to user via sms

export default router;