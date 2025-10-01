import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import * as jwtService from './authentication/jwtUtils.js'

import otpRoutes from './routing/otp.js';
import { verifyAccessToken } from './authentication/jwtUtils.js';
import tripRoutes from'./routing/trips.js';

import socketHandler from './socketio.js';

const app = express();
const server = http.createServer(app)
const io = new Server(server)
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
app.use("/", tripRoutes);

io.on('connection', (socket) =>{
    socketHandler(io, socket);
})



server.listen(8080, ()=>{
  console.log('Server running on port 8080');
})




