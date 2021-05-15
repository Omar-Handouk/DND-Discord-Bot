require("dotenv").config();

const BOT_PREFIX = "-dnd";

const admin = require("firebase-admin");
const Discord = require("discord.js");
const TS = require("./utils/timestamp");
const BotFunctions = require("./BotFunctions");
const generateTable = require("./generateTable");

const firebaseCreds = JSON.parse(process.env.FIREBASE_CREDS);
admin.initializeApp({
  credential: admin.credential.cert(firebaseCreds)
});

const client = new Discord.Client();
const DB = admin.firestore();

const botFunctions = new BotFunctions(Discord, DB);

client.on("ready", () =>
  console.info(`[${TS()}][info]  Dungeons and Dragons bot is now online!`)
);

client.on("message", async (msg) => {
  const content = msg.content.trim().toLowerCase().split(" ");

  const command = content[1]; // Must not be null
  const username = content[2]; // Must not be null in most cases
  let usernameExists = null;
  const field = content[3]; // Can be null
  const fieldValue = content[4]; // Can be null

  if (content[0] !== BOT_PREFIX) {
    return;
  }

  if (!command) {
    msg.channel.send("Please enter a valid bot command!");
    return;
  }

  if (command !== "help" && command !== "showall" && !username) {
    msg.channel.send("You must pass a username!");
    return;
  }

  if (command !== "help" && command !== "showall" && command !== "add") {
    usernameExists = await botFunctions.checkIfUserExists(username);

    if (!usernameExists) {
      msg.channel.send("Username does not exist!");
      return;
    }
  }

  switch (command) {
    case "help":
      msg.channel.send(await botFunctions.help());
      break;
    case "add":
      if (usernameExists) {
        msg.channel.send("Username already exists");
      } else {
        await botFunctions.addUser(username);
        msg.channel.send("User has been added successfully!");
      }
      break;
    case "addtoken":
      const res = await botFunctions.incrementToken(username);
      msg.channel.send(`Added a token for user: ${username}`);

      if (res.leveledUp) {
        msg.channel.send(`${username} has leveled to ${res.level}`);
      }
      break;
    case "get":
      const data = await botFunctions.getUser(username);
      const msgEmbd = new Discord.MessageEmbed();

      msgEmbd
        .setColor("#0099ff")
        .setTitle(`User Information: ${username}`)
        .addFields(
          { name: "ID", value: data.id },
          {
            name: "Username",
            value: username
          },
          {
            name: "Level",
            value: data.level
          },
          {
            name: "Token",
            value: data.token
          }
        );

      msg.channel.send(msgEmbd);

      break;
    case "showall":
      const users = await botFunctions.getAllUsers();

      if (users.length === 0) {
        msg.channel.send("No users found in the database");
      } else {
        msg.channel.send(
          "Please wait for a few moments while we generate the table link"
        );

        const tableLink = await generateTable(users);

        msg.channel.send(`Users table: ${tableLink}`);
      }
      break;
    case "update":
      if (field !== "level" && field !== "token") {
        msg.channel.send("Invalid field type!");
        return;
      }

      if (fieldValue < 0) {
        msg.channel.send("Please supply a value greater than 0!");
        return;
      }

      await botFunctions.updateUser(username, field, fieldValue, false);

      msg.channel.send(
        `Successfully updated ${field} for ${username} to ${fieldValue}`
      );

      break;
    case "delete":
      await botFunctions.deleteUser(username);

      msg.channel.send(`Successfully deleted ${username}`);

      break;
    default:
      msg.channel.send("Unknown command, please supply a valid one!");

      break;
  }
});

client.login(process.env.DISCORD_TOKEN);
