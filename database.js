import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

async function getRequestedItems(involvedTrips){
    involvedTrips.forEach(async trip =>{
        const [itemsArray] = await pool.query(
            `SELECT * FROM Requested_Items WHERE tripId = ?`, trip.tripId
        );
        trip.itemsRequested = itemsArray;
    });
}//get all items requested for each trip a user is involved in
//and add array of items to each trip object

export async function getHostedTrips(userNumber){
    const [tripsHosted] = await pool.query(
        `SELECT * FROM Trips WHERE host = ?`, userNumber 
    );
    if(tripsHosted.length > 0){
        await getRequestedItems(tripsHosted)
        return tripsHosted
    }
}//search for the trips a user is hosting
//and the items requested(by all users) within each trip

export async function getRequestedTrips(userNumber){
    const [tripsRequested] = await pool.query(
        `SELECT DISTINCT Trips.tripId, Trips.host, Trips.location, Trips.locationDescription, Trips.status
         FROM Requested_Items
         JOIN Trips ON Requested_Items.tripId = Trips.tripId
         WHERE Requested_Items.requestor = ?`, userNumber
    );
    if(tripsRequested.length > 0){
        await getRequestedItems(tripsRequested)
        return tripsRequested
    }
}//search for the trips a user can make requests to
//and the items that have been requested(by all users) within each trip




export async function createUser(){

}

export async function storeTripInfo(tripData, requestors){
    await pool.query(
        `INSERT INTO Trips(tripId, location, locationDescription, host, status)
         VALUES(?, ?, ?, ?, ?)`,[tripData.tripId, tripData.location, tripData.locationDescription, tripData.host, tripData.status]
    );
    await storeRequestorInfo(requestors, tripData.itemsRequested, tripData.tripId)
}

async function storeRequestorInfo(requestorArr, items, tripId){
    if(requestorArr){
        requestorArr.forEach(async requestor => {
            await pool.query(
                `INSERT INTO Requested_Items(requestor, tripId)
                 VALUES(?,?)`, [requestor.phoneNumber, tripId]
            )
        });
    }//store the requestors that can request for items within a trip
    else{
        items.forEach(async item => {
            await pool.query(
                `INSERT INTO Requested_Items(itemName, itemDescription, requestor, tripId)
                 VALUES(?,?,?,?)`, [item.itemName, item.itemDescription, item.requestor, tripId]
            )
        });
    }//store the items a requestor has requested within a trip
}
