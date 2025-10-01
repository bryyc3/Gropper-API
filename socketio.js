import jwt  from "jsonwebtoken";
import { getHostedTrips, getRequestedTrips } from "./database.js";

export default async function socketHandler(io, socket){
    const token = socket.handshake.headers["authorization"].split(" ")[1];

  if(!token){
    socket.disconnect();
  }

  try{
    const payload = verifySocketToken(token);
    const user = payload.phoneNumber;

    getHostedTrips(user).then(trips => {
      trips.forEach(trip => socket.join(`trip_${trip.id}`));
    });
    getRequestedTrips(user).then(trips => {
      trips.forEach(trip => socket.join(`trip_${trip.id}`));
    });
  } catch(err){
    socket.disconnect()
  }
}