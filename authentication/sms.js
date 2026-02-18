import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

const client = twilio(accountSid, authToken);

export async function sendOtp(phoneNumber){
    const otpCreation = await client.verify.v2.
        services(serviceSid)
        .verifications.create({
            channel: "sms",
            to: phoneNumber
        });
    return otpCreation.status;
}

export async function verifyOtp(phoneNumber, otp){
    const otpCheck = await client.verify.v2.
        services(serviceSid)
        .verificationChecks.create({
            code: otp,
            to: phoneNumber
        });
    return otpCheck.status;
}

