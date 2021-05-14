"use strict";
const BOT_PREFIX = "-dnd";

module.exports = async (Discord, client, DB) => {
  const showHelp = async msg => {
    const help = new Discord.MessageEmbed();

    help
      .setColor("#0099ff")
      .setTitle("Dungeons And Dragons Bot Help")
      .setDescription('To use the bot please prefix the commands with "-DND"')
      .addFields(
        { name: "help", value: "Used to show the bots available commands" },
        {
          name: "add [username]",
          value: "Adds a new user to the database"
        },
        {
          name: "addtoken [username]",
          value: "Add tokens to user and levels up if enough tokens are gatherd"
        },
        {
          name: "update [username] [field type] [value]",
          value:
            "Update the value of a certain attribute for a user.\nAvailable field types:\n  - level\n-  token\n\n**Each value is updated one at a time**\n**Example: -dnd update Neo level 140**"
        },
        {
          name: "getuser [username]",
          value: "Displays all information for a given username"
        },

        {
          name: "delete [username]",
          value: "Deletes a certain user from the database"
        },
        {
          name: "Credits",
          value: "Made by Neo and Vaxeon"
        }
      );

    msg.channel.send(help);
  };

  // Check is user does not exist in the database
  const checkIfUserExists = async username => {
    let query = DB.collection("users").where(
      "username",
      "==",
      username.toLowerCase()
    );

    let snapshot = await query.get();

    return snapshot.empty;
  };

  const getID = async (msg, username) => {
    const doc = await getUser(msg, username.toLowerCase());

    if (!doc.found) {
      msg.channel.send("Username not found!");

      return Promise.resolve({ found: false });
    } else {
      msg.channel.send(`The ID of username ${username}: ${doc._id}`);

      return Promise.resolve(doc._id);
    }
  };

  const getTimeStamp = () => {
    const isoDate = new Date(Date.now());

    return isoDate.toISOString();
  };

  //------------------------ CRUD Operation ------------------------

  const addUser = async (msg, userInfo) => {
    const docRef = DB.collection("users").doc();

    const usrname = userInfo[0].toLowerCase();

    await docRef.set({
      username: `${usrname}`,
      level: 1,
      token: 0
    });

    await docRef.set(
      {
        _id: docRef.id
      },
      { merge: true }
    );

    msg.channel.send(`User has been added successfully, User ID: ${docRef.id}`);
  };

  const getUser = async (msg, username) => {
    const collectionRef = DB.collection("users");

    const query = await collectionRef
      .where("username", "==", username.toLowerCase())
      .get();

    if (query.empty) {
      msg.channel.send("Username not found!");
      return Promise.resolve({ found: false });
    } else {
      const profile = query.docs[0].data();
      const usrID = profile._id;
      const usrname = profile.username;
      const usrLevel = profile.level;
      const usrToken = profile.token;

      const information = new Discord.MessageEmbed();

      information
        .setColor("#0099ff")
        .setTitle(`User Information: ${usrname}`)
        .addFields(
          { name: "ID", value: usrID },
          {
            name: "Username",
            value: usrname
          },
          {
            name: "Level",
            value: usrLevel
          },
          {
            name: "Token",
            value: usrToken
          }
        );

      msg.channel.send(information);

      profile.found = true;

      return Promise.resolve(profile);
    }
  };

  const updateUser = async (msg, username, field, fieldVal) => {
    const collectionRef = DB.collection("users");

    const query = await collectionRef
      .where("username", "==", username.toLowerCase())
      .get();

    if (query.empty) {
      msg.channel.send("Username not found!");
      return Promise.resolve({ found: false });
    } else {
      const parsedFieldValue = parseInt(fieldVal);

      const docRef = DB.collection("users").doc(query.docs[0].data()._id);

      if (field.toLowerCase() === "level") {
        await docRef.set({ level: parsedFieldValue }, { merge: true });
        msg.channel.send(
          `Successfully updated level to ${parsedFieldValue} for user ${username.toLowerCase()}`
        );

        console.info(
          `[${getTimeStamp()}] Update the level to ${parsedFieldValue} to user ${username.toLowerCase()}`
        );
      } else {
        await docRef.set({ token: parsedFieldValue }, { merge: true });
        msg.channel.send(
          `Successfully updated tokens to ${parsedFieldValue} for user ${username.toLowerCase()}`
        );

        console.info(
          `[${getTimeStamp()}] Updated token to ${parsedFieldValue} to user ${username.toLowerCase()}`
        );
      }
    }
  };

  const updateTokens = async (msg, username) => {
    const query = await DB.collection("users").where("username", "==", username).get();
    const userId = query.docs[0].data()._id

    const docRef = await DB.collection("users").doc(userId);
    const doc = (await docRef.get()).data();

    let usrLevel = parseInt(doc.level);
    let tokens = parseInt(doc.token) + 1;

    if (
      (8 <= usrLevel && 8 <= tokens) ||
      (usrLevel < 8 && usrLevel <= tokens)
    ) {
      usrLevel += 1;
      tokens = 0;
    }

    await docRef.set({ level: usrLevel, token: tokens }, { merge: true });

    msg.channel.send(
      `User is currently level: ${usrLevel}, and has ${tokens} tokens`
    );
  };

  const deleteUser = async (msg, username) => {
    const query = await DB.collection("users")
      .where("username", "==", username.toLowerCase())
      .get();

    const docRef = await DB.collection("users").doc(query.docs[0].data()._id);

    await docRef.delete();

    msg.channel.send(`User: ${username} deleted successfully!`);

    console.info(`[${getTimeStamp()}] Deleted user ${username.toLowerCase()}`);
  };

  //------------------------ Client Events ------------------------
  client.on("ready", async () =>
    console.info(`[${getTimeStamp()}] Dungeons and Dragons bot is now online!`)
  );

  client.on("message", async msg => {
    const msgSplit = msg.content.toLowerCase().split(" ");
    
    if (msgSplit[0] !== BOT_PREFIX) {
      return;
    }

    switch (msgSplit[1]) {
      case `add`:
        if (!msgSplit[2]) {
          msg.channel.send("You must pass a username!");
        } else if (!(await checkIfUserExists(msgSplit[2].toLowerCase()))) {
          msg.channel.send("User already exists");
        } else {
          await addUser(msg, msgSplit.slice(2));
        }
        break;
      case `getuser`:
        if (!msgSplit[2]) {
          msg.channel.send("You must pass a username!");
        } else {
          await getUser(msg, msgSplit[2]);
        }
        break;
      case `update`:
        if (!msgSplit[2]) {
          msg.channel.send("You must pass a username!");
        } else if (await checkIfUserExists(msgSplit[2].toLowerCase())) {
          msg.channel.send("User does not exist");
        }

        if (
          msgSplit[3].toLowerCase() !== "level" &&
          msgSplit[3].toLowerCase() !== "token"
        ) {
          msg.channel.send("Invalid field type");
        } else if (
          (msgSplit[3].toLowerCase() === "level" &&
            isNaN(parseInt(msgSplit[4]))) ||
          (msgSplit[3].toLowerCase() === "level" &&
            parseInt(msgSplit[4]) < 0) ||
          (msgSplit[3].toLowerCase() === "token" &&
            isNaN(parseInt(msgSplit[4]))) ||
          (msgSplit[3].toLowerCase() === "progress" &&
            (parseInt(msgSplit[4]) < 0))
        ) {
          msg.channel.send(
            "Please enter a valid numerical value!, level: 0-infinity, token: 0-infinity"
          );
        } else {
          await updateUser(msg, msgSplit[2], msgSplit[3], msgSplit[4]);
        }
        break;
      case `addtoken`:
        if (!msgSplit[2]) {
          msg.channel.send("You must pass a username!");
        } else if (await checkIfUserExists(msgSplit[2].toLowerCase())) {
          msg.channel.send("User does not exist");
        } else {
          await updateTokens(msg, msgSplit[2]);
        }
        break;
      case `delete`:
        if (!msgSplit[2]) {
          msg.channel.send("You must pass a username!");
        } else if (await checkIfUserExists(msgSplit[2].toLowerCase())) {
          msg.channel.send("User does not exist");
        } else {
          await deleteUser(msg, msgSplit[2]);
        }
        break;
      case `help`:
        await showHelp(msg);
        break;
      default:
        msg.channel.send("In-correct command, please use a valid one!");
    }
  });
};
