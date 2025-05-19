import express from 'express';
import { storeTripInfo } from  './database.js'

const app = express();

app.use(express.json());

app.get('/trips', async (req, res) => {

})//trips that have been requested or that are hosted by a user




app.post('/create-user', async (req, res) => {
    
})//store user info 

app.post('/create-trip', async (req, res) => {
    const tripInfo = req.body.tripInfo;
    const contacts = req.body.contacts;
    const itemsRequested = req.body.items;
    
    const trip = await storeTripInfo(tripInfo, contacts, itemsRequested);
    res.json(trip);
})//stores trip information that was either requested or created by the host



 
app.listen(8080, ()=>{
  console.log('Server running on port 8080');
})