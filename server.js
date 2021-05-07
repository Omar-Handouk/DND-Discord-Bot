const Discord = require("discord.js");
const admin = require("firebase-admin");

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

client.on("message", msg => {
  const msgSplit = msg.content.toLowerCase().split(" ");
  
  if (msgSplit[0] !== BOT_PREFIX) {
    return;
  }
  
  switch (msgSplit[1]) {
    case `db`:
      break;
    case `add`:
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