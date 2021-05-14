"use strict";

const Discord = require("discord.js");
const admin = require("firebase-admin");
const botFunctions = require('./bot-functions-rework');

const firebaseAuth = require("./dnd-discord-bot-67e23-firebase-adminsdk-k3ovz-aeffae9d74.json");

admin.initializeApp({
  credential: admin.credential.cert(firebaseAuth)
});

const client = new Discord.Client();
const DB = admin.firestore();

botFunctions(Discord, client, DB);

client.login(process.env.DISCORD_TOKEN);
