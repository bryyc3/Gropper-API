import express from 'express';
import { storeTripInfo, getHostedTrips, getRequestedTrips } from  './database.js'

const app = express();

app.use(express.json());

app.get('/trips', async (req, res) => {

  const hostedTrips = await getHostedTrips("000");
  const requestedTrips = await getRequestedTrips("000")

  res.json(hostedTrips, requestedTrips)

})//all trips user is hosting or can make requests for 




app.post('/create-user', async (req, res) => {
    
})//store user info 

app.post('/create-trip', async (req, res) => {
    const tripData = JSON.parse(req.body.tripInfo);
    const contacts = JSON.parse(req.body.contacts);

    const trip = await storeTripInfo(tripData, contacts);
    res.json(trip);
})//stores trip information that was either requested or created by the host



 
app.listen(8080, ()=>{
  console.log('Server running on port 8080');
})