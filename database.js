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
                JSON_OBJECT('phoneNumber', Requested_Items.requestor, 
                            'itemsRequested', Requested_Items.items)
            ), JSON_ARRAY()
        ) AS requestors
        FROM Trips
        LEFT JOIN (
            SELECT tripId, requestor, 
            CASE 
            WHEN COUNT(itemName) > 0 THEN JSON_ARRAYAGG(
                JSON_OBJECT(
                    'itemName', itemName,
                    'itemDescription', itemDescription
                )
            )
            ELSE NULL
        END AS items
            FROM Requested_Items 
            GROUP BY tripId, requestor
        ) Requested_Items ON Trips.tripId = Requested_Items.tripId
        WHERE Trips.host = ?
        GROUP BY Trips.tripId`,userNumber
    );
    if(tripsHosted.length == 0){
        return null
    }
    return tripsHosted
}//search for the trips a user is hosting
//and the items requested(by all users) within each trip

export async function getRequestedTrips(userNumber){
    const [tripsRequested] = await pool.query(
        `SELECT DISTINCT Trips.tripId, Trips.host, Trips.location, Trips.locationDescription, Trips.status,
         JSON_ARRAY(
            JSON_OBJECT(
                    'phoneNumber', Requested_Items.requestor,
                    'itemsRequested',
                    COALESCE(
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'itemName', Requested_Items.itemName, 
                                'itemDescription', Requested_Items.itemDescription
                            )
                        ),
                        JSON_ARRAY()
                    )
                ) 
         ) AS requestors    
         FROM Requested_Items
         JOIN Trips ON Requested_Items.tripId = Trips.tripId
         WHERE Requested_Items.requestor = ?
         GROUP BY Trips.tripId`, userNumber
    );
    if(tripsRequested.length == 0){
        return null
    }
    return tripsRequested
    
}//search for the trips a user can make requests to
//and the items that have been requested(by the user) within each trip


export async function storeTripInfo(tripData, requestorsSelected){
    await pool.query(
        `INSERT INTO Trips(tripId, location, locationDescription, host, status)
         VALUES(?, ?, ?, ?, ?)`,[tripData.tripId, tripData.location, tripData.locationDescription, tripData.host, tripData.status]
    );
    await storeRequestorInfo(requestorsSelected, tripData.requestors, tripData.tripId)
}

function storeRequestorInfo(pickedRequestors, requestors, tripId){
    if(pickedRequestors.length > 0){
        pickedRequestors.forEach(async requestor => {
            requestor.itemDescription = "None"
            await pool.query(
                `INSERT INTO Requested_Items(requestor, tripId, itemName, itemDescription)
                 VALUES(?,?,?,?)`, [requestor.phoneNumber, tripId, requestor.itemName, requestor.itemDescription]
            )
        });
    }//store the requestors that can request for items within a trip
    else{
        requestors.forEach(async requestor => {
            if(requestor.itemsRequested.length > 0){
                requestor.itemsRequested.forEach(async item => {
                    await pool.query(
                        `INSERT INTO Requested_Items(itemName, itemDescription, requestor, tripId)
                        VALUES(?,?,?,?)`, [item.itemName, item.itemDescription, requestor.phoneNumber, tripId]
                    )
                })
            }
            else{
                await pool.query(
                    `INSERT INTO Requested_Items(requestor, tripId, itemName, itemDescription)
                    VALUES(?,?,?,?)`, [requestor.phoneNumber, tripId, requestor.itemName, requestor.itemDescription]
                )
            }
        });
    }//store the items a requestor has requested within a trip
}
