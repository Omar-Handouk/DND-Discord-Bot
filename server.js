const Discord = require("discord.js");

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
  
  switch (msg.content.toLowerCase()) {
    case `${BOT_PREFIX} db`:
      break;
    case `${BOT_PREFIX} Add `
  }
});

client.login(process.env.DISCORD_TOKEN);