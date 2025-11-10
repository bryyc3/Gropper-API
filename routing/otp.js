import { Router } from 'express';
import * as otpService from '../authentication/sms.js';
import * as jwtService from '../authentication/jwtUtils.js';

const router = Router();

router.post('/generate-otp', async (req, res) =>{
    const userPhoneNumber = req.body;
  
    const otpSent = await otpService.sendOtp(userPhoneNumber);
    
    if(otpSent === "pending"){
      res.status(200);
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
      console.log("success verification");
      res.json(tokens);
    }
    else{
      console.log("failed verification");
      res.status(400)
    }
})//verify otp sent to user via sms
  
router.post('/simulate-otp', async (req, res) =>{
    const number = req.body.phoneNumber
    res.status(200).send(true)
  })
  
router.post('/simulate-otp-verification', async (req, res) =>{
    const userPhone = req.body.phoneNumber
    const enteredCode = req.body.userCode
    const secretCode = '"test"'
    if(enteredCode === secretCode){
        const refresh = jwtService.generateRefreshToken(userPhone);
        const access = jwtService.generateAccessToken(userPhone);
        const tokens = {refreshToken: refresh, accessToken: access}
        console.log(refresh)
        res.json(tokens);
    }
    else{
      console.log("failed verify")
      res.status(400).send("invalid")
    }
})

export default router;