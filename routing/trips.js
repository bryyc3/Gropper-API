import { Router } from 'express'
import * as dbService from  '../database.js';

const router = Router();

router.post('/trips', async (req, res) =>{
    const userPhone = JSON.parse(req.body.user)
    try{
      const hostedTrips = await dbService.getHostedTrips(userPhone);
      const requestedTrips = await dbService.getRequestedTrips(userPhone);
      const allTrips = {hostedTripData: hostedTrips,
                        requestedTripData: requestedTrips};
      res.json(allTrips);
    }
    catch (err){
      console.log(err)
      res.sendStatus(500)
    }
})//all trips user is hosting or can make requests for 
  
router.post('/create-trip', async (req, res) =>{
      const tripData = JSON.parse(req.body.tripInfo);
      const selectedRequestors = JSON.parse(req.body.contacts);
      try{
        await dbService.storeTripInfo(tripData, selectedRequestors);
        const newTrip = await dbService.getUpdatedTrip(tripData.tripId);

        if(selectedRequestors.length > 0){
          req.io.to(`user_${tripData.host.phoneNumber}`).emit("newHostedTrip", newTrip);
          for(let requestor of selectedRequestors){
            req.io.to(`user_${requestor.phoneNumber}`).emit("newTrip", newTrip);
            
          } 
        }
        else{
          req.io.to(`user_${tripData.requestors[0].phoneNumber}`).emit("newTrip", newTrip);
          req.io.to(`user_${tripData.host.phoneNumber}`).emit("newRequest", newTrip);
        }
        res.send(true)
        
      } catch (err){
        console.log(err)
        res.send(false)
      }
       
})//stores trip information that was either requested or created by the host
  
router.post('/update-items', async (req, res) =>{
    const trip = JSON.parse(req.body.tripId);
    const host = JSON.parse(req.body.host);
    const requestorPhone = JSON.parse(req.body.user);
    const items = JSON.parse(req.body.items);

    try{
      await dbService.updateItems(trip, requestorPhone, items);
      const tripUpdated = await dbService.getUpdatedTrip(trip);

      req.io.to(`user_${host}`).emit("itemsAdded", tripUpdated);
      res.send(true);
    } catch (err){
      console.log(err)
      res.send(false);
    }
})

router.post('/add-requestors', async (req, res) =>{
  const trip = JSON.parse(req.body.tripId);
  const selectedRequestors = JSON.parse(req.body.contacts);

  try{
    await dbService.storeRequestorInfo(selectedRequestors, [], trip);
    const tripUpdated = await dbService.getUpdatedTrip(trip);

    for(let requestor of selectedRequestors){
      req.io.to(`user_${requestor.phoneNumber}`).emit("newTrip", tripUpdated);
    } 
    res.send(true);
  } catch (err){
    console.log(err)
    res.send(false);
  }
})

router.post('/accept-trip', async (req, res) =>{
  const trip = JSON.parse(req.body.tripId);

  try{
    await dbService.acceptTrip(trip);
    console.log(trip)
    const newTripData = await dbService.getUpdatedTrip(trip);
    req.io.to(`trip_${trip}`).emit("tripAccepted", newTripData);
    res.send(true);
  } catch (err){
    console.log(err);
    res.send(false);
  }
})

router.delete('/delete-item', async (req, res) =>{
  const tripId = JSON.parse(req.body.tripId);
  const userPhone = JSON.parse(req.body.user);
  const itemName = JSON.parse(req.body.item);

  try{
    await dbService.deleteItem(tripId, userPhone, itemName);
    const tripUpdated = await dbService.getUpdatedTrip(tripId);
    console.log(tripUpdated.host.phoneNumber)
    req.io.to(`user_${tripUpdated.host.phoneNumber}`).emit("itemDeleted", tripUpdated);
    res.send(tripUpdated);
  } catch (err){
    console.log(err);
    res.send(false);
  }
})

router.delete('/delete-trip', async (req, res) =>{
  const trip = JSON.parse(req.body.tripId);

  try{
    await dbService.deleteTrip(trip);
    req.io.to(`trip_${trip}`).emit("tripDeleted", {"tripId": trip});
    res.send(true);
  } catch (err){
    console.log(err);
    res.send(false);
  }
})

export default router;