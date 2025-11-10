import jwt  from "jsonwebtoken";
import { verifySocketToken } from "./authentication/jwtUtils.js";
import { getHostedTrips, getRequestedTrips } from "./database.js";

export default async function socketHandler(io, socket){
    const token = socket.handshake.headers["authorization"].split(" ")[1];
    if(!token){
      socket.disconnect();
      console.log("disconnecting")
    }
    
    try{
      const payload = verifySocketToken(token);
      const user = JSON.parse(payload.phoneNumber);
      socket.join(`user_${user}`)
      console.log(`Room ${user} joined`)

      const hostedTrips = await getHostedTrips(user);
      
      await getHostedTrips(user).then(trips => {
        if(trips !== null){
          trips.forEach(trip => socket.join(`trip_${trip.id}`))
        };
      });
      await getRequestedTrips(user).then(trips => {
        if(trips !== null){
          trips.forEach(trip => socket.join(`trip_${trip.id}`));
        }
      });

      socket.on("joinTrip", (tripId) => {
        socket.join(`trip_${tripId}`);
        console.log(`Joined ${tripId}`)
      });

    } catch(err){
      socket.disconnect()
      console.log(err)
    }
}