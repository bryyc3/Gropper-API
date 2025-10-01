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
    catch{
      res.sendStatus(500)
    }
})//all trips user is hosting or can make requests for 
  
router.post('/create-trip', async (req, res) =>{
      const tripData = JSON.parse(req.body.tripInfo);
      const selectedRequestors = JSON.parse(req.body.contacts);
      try{
        await dbService.storeTripInfo(tripData, selectedRequestors)
        res.send(true)
      } catch {
        console.log("fail")
        res.send(false)
      }
       
})//stores trip information that was either requested or created by the host
  
router.post('/update-items', async (req, res) =>{
    const trip = JSON.parse(req.body.tripId);
    const user = JSON.parse(req.body.user);
    const items = JSON.parse(req.body.items);
  
    try{
      await dbService.updateItems(trip, user, items);
      res.send(true);
    } catch {
      res.send(false);
    }
})

export default router;