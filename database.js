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

export async function storeTripInfo(tripData, requestors, requestedItems){
    await pool.query(
        `INSERT INTO Trips
         `
    )
}

export async function storeRequestedItems(requestedItems, TripId){

}

//export async function storeRequestedItems()

export async function createTripRequest(){

}
