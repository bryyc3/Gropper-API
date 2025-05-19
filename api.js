import express from 'express';
import { } from  './database.js'

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
    
    console.log(tripInfo, itemsRequested, contacts)
})//stores trip information
  //hosts can accept or decline a trip that was created as a request



 
app.listen(8080, ()=>{
  console.log('Server running on port 8080');
})