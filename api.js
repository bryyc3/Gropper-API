import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import * as jwtService from './authentication/jwtUtils.js'

import otpRoutes from './routing/otp.js';
import { verifyAccessToken } from './authentication/jwtUtils.js';
import { storeUser, storeUserNotificationToken, getUser } from './database.js';
import tripRoutes from'./routing/trips.js';

import socketHandler from './socketio.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.LOCAL_PORT;
app.use(express.json());


app.post('/verify-refresh', async (req, res) =>{
  const refreshToken = req.headers['authorization']
  const user = jwtService.verifyRefreshToken(refreshToken)
  
  if (!user) return res.sendStatus(403)
  
  const access = jwtService.generateAccessToken(user.phoneNumber)
  res.json({accessToken: access, refreshToken: null})
})//verify refresh token 

app.use("/", otpRoutes);

app.use(verifyAccessToken);//requires access token to be verified before using trip routes

app.use((req, res, next) => {
  req.io = io;
  next();
})

app.post('/allow-notifications', async (req, res) =>{
  const phoneNumber = JSON.parse(req.body.userNumber);
  const notiToken = JSON.parse(req.body.userToken);

  try{
    const notAlreadyUser = await getUser(phoneNumber);

    if(notAlreadyUser){
      await storeUser(phoneNumber);
    }

    await storeUserNotificationToken(phoneNumber, notiToken);
  } catch (err){
    console.log(err);
    res.send(false);
  }
})//store notification token associated with a user when they allow notifications

app.use("/", tripRoutes);

io.on('connection', (socket) =>{
  socketHandler(io, socket);
})//connect to socketIO



server.listen(port, ()=>{
  console.log(`Server running on port ${port}`);
})




