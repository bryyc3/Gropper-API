import { request, Router } from 'express'
import * as dbService from  '../database.js';
import * as pushNotification from '../pushNotification.js';

const router = Router();

router.post('/trips', async (req, res) =>{
    const userPhone = req.body.user
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
            const notificationToken = await dbService.getUserNotificationToken(requestor.phoneNumber);
            pushNotification.sendPush(notificationToken, "New Trip Created", "You have been added to a new trip")
          } 
        }
        else{
          req.io.to(`user_${tripData.requestors[0].phoneNumber}`).emit("newTrip", newTrip);
          req.io.to(`user_${tripData.host.phoneNumber}`).emit("newRequest", newTrip);
          const notificationToken = await dbService.getUserNotificationToken(tripData.host.phoneNumber);
          pushNotification.sendPush(notificationToken, "New Trip Request", `Someone is requesting a trip to ${tripData.location}`);
        }
        res.send(true)
        
      } catch (err){
        console.log(err)
        res.send(false)
      }
       
})//stores trip information that was either requested or created by the host
  
router.post('/update-items', async (req, res) =>{
    const trip = req.body.tripId;
    const host = req.body.host;
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
  const trip = req.body.tripId;
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
  const tripId = req.body.tripId;

  try{
    await dbService.acceptTrip(tripId);
    const newTripData = await dbService.getUpdatedTrip(tripId);
    req.io.to(`trip_${tripId}`).emit("tripAccepted", newTripData);
    res.send(true);
  } catch (err){
    console.log(err);
    res.send(false);
  }
})

router.delete('/delete-item', async (req, res) =>{
  const tripId = req.body.tripId;
  const userPhone = req.body.user;
  const itemName = req.body.item;
  const count = req.body.itemsCount;

  try{
    await dbService.deleteItem(tripId, userPhone, itemName, count);
    const tripUpdated = await dbService.getUpdatedTrip(tripId);
    req.io.to(`user_${tripUpdated.host.phoneNumber}`).emit("itemDeleted", tripUpdated);
    res.send(tripUpdated);
  } catch (err){
    console.log(err);
    res.send(false);
  }
})

router.delete('/remove-requestor', async (req, res) =>{
  const requestor = req.body.requestor;
  const trip = req.body.tripId;

  try{
    await dbService.removeRequestor(requestor, trip);
    req.io.to(`user_${requestor}`).emit("tripDeleted", {"tripId": trip});
    res.send(true);
  } catch (err){
    console.log(err);
    res.send(false);
  }
})

router.delete('/delete-trip', async (req, res) =>{
  const trip = req.body.tripId;

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