import express from 'express';
import { storeTripInfo, getHostedTrips, getRequestedTrips } from  './database.js'
import { sendOtp, verifyOtp } from './sms.js';
import { generateToken } from './jwtUtils.js';

const app = express();

app.use(express.json());

app.get('/trips', async (req, res) => {
  const hostedTrips = await getHostedTrips("1111111111");
  const requestedTrips = await getRequestedTrips("1111111111");
  
  const allTrips = {hostedTripData: hostedTrips,
                    requestedTripData: requestedTrips};
  res.json(allTrips);

})//all trips user is hosting or can make requests for 


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
    const refresh = generateToken(userPhoneNumber, 'refresh');
    const access = generateToken(userPhoneNumber, 'access');
    const tokens = {refreshToken: refresh, accessToken: access}
    res.json(tokens);
  }
  else{
    res.status(400).send("Invalid OTP")
  }
})
app.post('/create-user', async (req, res) => {
    
})//store user info 

app.post('/create-trip', async (req, res) => {
    const tripData = JSON.parse(req.body.tripInfo);
    const contacts = JSON.parse(req.body.contacts);
    await storeTripInfo(tripData, contacts);
})//stores trip information that was either requested or created by the host



 
app.listen(8080, ()=>{
  console.log('Server running on port 8080');
})




