import express from 'express';
import { storeTripInfo, getHostedTrips, getRequestedTrips } from  './database.js'
import { sendOtp, verifyOtp } from './sms.js';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from './jwtUtils.js';

const app = express();

app.use(express.json());

app.post('/generate-otp', async (req, res) => {
  const userPhoneNumber = req.body;

  const otpSent = await sendOtp(userPhoneNumber);
  
  if(otpSent === "pending"){
    res.status(200);
  }
})//send user otp for authorization 

app.post('/verify-otp', async (req, res) => {
  const userPhoneNumber = req.body.phoneNumber;
  const enteredOtp = req.body.otp;
   
  const otpVerified = await verifyOtp(userPhoneNumber, enteredOtp)

  if(otpVerified === "approved"){
    const refresh = generateRefreshToken(userPhoneNumber);
    const access = generateAccessToken(userPhoneNumber);
    const tokens = {refreshToken: refresh, accessToken: access}
    res.json(tokens);
  }
  else{
    res.status(400)
  }
})//verify otp sent to user via sms


app.post('/verify-refresh', async (req, res) =>{
  const refreshToken = req.headers['authorization']
  const user = verifyRefreshToken(refreshToken)
  
  if (!user) return res.sendStatus(403)
  
  const access = generateAccessToken(user.phoneNumber)
  res.json({accessToken: access, refreshToken: null})
})//verify refresh token 


app.post('/create-user', async (req, res) => {
    
})//store user info 



app.post('/trips', verifyAccessToken, async (req, res) => {
  const userPhone = JSON.parse(req.body.user)
  try{
    const hostedTrips = await getHostedTrips(userPhone);
    const requestedTrips = await getRequestedTrips(userPhone);
    const allTrips = {hostedTripData: hostedTrips,
                      requestedTripData: requestedTrips};
                      console.log(allTrips)
    res.json(allTrips);
  }
  catch{
    res.sendStatus(500)
  }
})//all trips user is hosting or can make requests for 

app.post('/create-trip', verifyAccessToken, async (req, res) => {
    const tripData = JSON.parse(req.body.tripInfo);
    const selectedRequestors = JSON.parse(req.body.contacts);
    try{
      await storeTripInfo(tripData, selectedRequestors)
      res.send(true)
    } catch {
      res.send(false)
    }
     
})//stores trip information that was either requested or created by the host

app.post('/simulate-otp', async (req, res) =>{
    const number = req.body.phoneNumber
    res.status(200).send(true)
})

 app.post('/simulate-otp-verification', async (req, res) =>{
    const userPhone = req.body.phoneNumber
    const enteredCode = req.body.userCode
    const secretCode = '"test"'
    if(enteredCode === secretCode){
        const refresh = generateRefreshToken(userPhone);
        const access = generateAccessToken(userPhone);
        const tokens = {refreshToken: refresh, accessToken: access}
        res.json(tokens);
    }
    else{
      res.status(400).send("invalid")
    }
 })


app.listen(8080, ()=>{
  console.log('Server running on port 8080');
})




