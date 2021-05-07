const Discord = require("discord.js");

const client = new Discord.Client();

const BOT_PREFIX = "-DND";

client.on("ready", () => {
  console.info("Bot is online!");
});

client.on("message", msg => {
  if (msg.content === `$(BOT_PREFIX) DB`) {
    msg.channel.send("show db");
  }
});

client.login(process.env.DISCORD_TOKEN);