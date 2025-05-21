import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();


export async function getHostedTrips(){

}

export async function getRequestedTrips(){

}

export async function getRequestedItems(){

}



export async function createUser(){

}

export async function storeTripInfo(tripData, requestors){
    await pool.query(
        `INSERT INTO Trips(tripId, location, locationDescription, host, status)
         VALUES(?, ?, ?, ?, ?)`,[tripData.tripId, tripData.location, tripData.locationDescription, tripData.host, tripData.status]
    );
    storeRequestorInfo(requestors, tripData.itemsRequested, tripData.tripId)
}

export async function storeRequestorInfo(requestorArr, items, tripId){
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
