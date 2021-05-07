const Discord = require("discord.js");
const admin = require("firebase-admin");

const firebaseAuth = require("./dnd-discord-bot-67e23-firebase-adminsdk-k3ovz-aeffae9d74.json");

admin.initializeApp({
  credential: admin.credential.cert(firebaseAuth),
});


const DB = admin.firestore();



const client = new Discord.Client();

const BOT_PREFIX = "-dnd";

client.on("ready", () => {
  console.info("Bot is online!");
});

/**
* Show Database
* Modify in DB (Each user has a unique ID) (Username -ALPHANUMERIC, Character level -NUMBER, Progression -FLOAT)
* Add a new user
* Delete a user
*/

client.on("message", async msg => {
  const msgSplit = msg.content.toLowerCase().split(" ");
  
  console.log(msgSplit)
  if (msgSplit[0] !== BOT_PREFIX) {
    return;
  }
  
  switch (msgSplit[1]) {
    case `db`:
      break;
    case `add`:
      console.log('here')
      const docRef = DB.collection('users').doc();
      let a = await docRef.set({
        "username": `${msgSplit[2]}`
      })
      console.log(a)
      
      break;
    case `update`:
      break;
    case `delete`:
      break;
    default:
      break;
  }
  
  
});

client.login(process.env.DISCORD_TOKEN);