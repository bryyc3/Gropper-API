import apn from 'apn';
import dotenv from 'dotenv';

dotenv.config();

const apnProvider = new apn.Provider({
  token: {
    key: Buffer.from(process.env.APNS_KEY, 'base64'),
    keyId: process.env.APNS_KEY_ID,
    teamId: process.env.APPLE_TEAM_ID
  },
  production: true 
});

export async function sendPush(deviceTokens, notiTitle, notiBody) {
    const notification = new apn.Notification();
  
    notification.topic = process.env.BUNDLE_ID;
    notification.pushType = "alert";
    notification.alert = {
      title: notiTitle,
      body: notiBody
    };
    notification.sound = "default";
  
    for(const userToken of deviceTokens){
      const result = await apnProvider.send(notification, userToken.token);
    }
  }
  //sendPush("6218e5feae8be36d4c30948da79cdab0b0dfddc3339437961ca8625e05b92c78", "title", "body")