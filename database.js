import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

export async function getHostedTrips(userNumber){
    const [tripsHosted] = await pool.query(
        `
        SELECT Trips.tripId, Trips.location, Trips.host, Trips.locationDescription, Trips.status,
        COALESCE(
            JSON_ARRAYAGG(
                JSON_OBJECT('itemName', Requested_Items.itemName, 
                            'itemDescription', Requested_Items.itemDescription,
                            'requestor', Requested_Items.requestor)
            ),
            JSON_ARRAY()
        ) AS itemsRequested
        FROM Trips
        LEFT JOIN Requested_Items ON Trips.tripId = Requested_Items.tripId
        WHERE Trips.host = ?
        GROUP BY Trips.tripId`,userNumber
    );
 
    return tripsHosted
}//search for the trips a user is hosting
//and the items requested(by all users) within each trip

export async function getRequestedTrips(userNumber){
    const [tripsRequested] = await pool.query(
        `SELECT DISTINCT Trips.tripId, Trips.host, Trips.location, Trips.locationDescription, Trips.status,
         COALESCE(
            JSON_ARRAYAGG(
                JSON_OBJECT('itemName', Requested_Items.itemName, 
                            'itemDescription', Requested_Items.itemDescription,
                            'requestor', Requested_Items.requestor)
            ),
                JSON_ARRAY()
            ) AS itemsRequested
         FROM Requested_Items
         JOIN Trips ON Requested_Items.tripId = Trips.tripId
         WHERE Requested_Items.requestor = ?
         GROUP BY Trips.tripId`, userNumber
    );

    return tripsRequested
    
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

function storeRequestorInfo(requestorArr, items, tripId){
    if(requestorArr){
        requestorArr.forEach(async requestor => {
            requestor.itemName = "";
            requestor.itemDescription = "";
            await pool.query(
                `INSERT INTO Requested_Items(requestor, tripId, itemName, itemDescription)
                 VALUES(?,?,?,?)`, [requestor.phoneNumber, tripId, requestor.itemName, requestor.itemDescription]
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
