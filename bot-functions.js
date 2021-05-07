"ues strict";

const BOT_PREFIX = "-dnd";

/**
 * Show Database
 * Modify in DB (Each user has a unique ID) (Username -ALPHANUMERIC, Character level -NUMBER, Progression -FLOAT)
 * Add a new user
 * Delete a user
 */

module.exports = async (Discord, client, DB) => {
  // -------------------------------------------------------------------
  const showHelp = async msg => {
    const help = new Discord.MessageEmbed();

    help
      .setColor("#0099ff")
      .setTitle("Dungeons And Dragons Bot Help")
      .setDescription('To use the bot pleaase prefix the commands with "-DND"')
      .addFields(
        { name: "help", value: "Used to show the bots available commands" },
        {
          name: "getuser [username]",
          value: "Displays all information for a given username"
        },
        {
          name: "userid [username]",
          value: "Retrieves the user id for a given username"
        },
        {
          name: "add [username]",
          value: "Adds a new user to the database"
        },
        {
          name: "update [username] [field type] [value]",
          value:
            "Update the value of a certain attribute for a user.\nAvailable field types:\n  - level\n-  progress"
        },
        {
          name: "delete [username]",
          value: "Deletes a certain user from the database"
        }
      );

    msg.channel.send(help);
  };

  const checkIfUserExists = async username => {
    let query = DB.collection("users").where("username", "==", username);

    let snapshot = await query.get();

    return snapshot.empty;
  };

  const getID = async (msg, username) => {
    const doc = await getUser(msg, username);

    if (!doc.found) {
      msg.channel.send("Username not found!");
      return Promise.resolve({ found: false });
    } else {
      msg.channel.send(`The ID of username ${username}: ${doc._id}`);

      return Promise.resolve(doc._id);
    }
  };

  const addUser = async (msg, userInfo) => {
    const docRef = DB.collection("users").doc();

    const usrname = userInfo[0].toLowerCase();
    const usrLevel = parseInt(userInfo[1]);
    const usrProgress = parseFloat(userInfo[2]);

    if (isNaN(usrLevel)) {
      msg.channel.send(
        "Undefined level value, please supply a numerical value!"
      );
      return;
    }

    if (usrLevel < 0) {
      msg.channel.send("Level is below zero, please supply a positive number");
      return;
    }

    if (isNaN(usrProgress)) {
      msg.channel.send(
        "Undefined progress value, please supply a numerical value between 0 and 1!"
      );
      return;
    }

    if (usrProgress < 0 || usrProgress > 1) {
      msg.channel.send(
        "Please supply a value between 0 and 1 for the progress"
      );
      return;
    }

    await docRef.set({
      username: `${usrname}`,
      level: userInfo[1] && !isNaN(usrLevel) ? usrLevel : 0,
      progress: userInfo[2] && !isNaN(usrProgress) ? usrProgress : 0.0
    });

    await docRef.set(
      {
        _id: docRef.id
      },
      { merge: true }
    );

    msg.channel.send(`User has been added successfully, User ID: ${docRef.id}`);
  };

  const getAllUser = async msg => {};

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
      const usrProgress = profile.progress;

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
            name: "Progress",
            value: usrProgress
          }
        );

      msg.channel.send(information);

      profile.found = true;

      return Promise.resolve(profile);
    }
  };

  const updateUser = async (msg, username) => {};

  const deleteUser = async (msg, username) => {
    const query = await DB.collection("users")
      .where("username", "==", username.toLowerCase())
      .get();
    const docRef = await DB.collection("users").doc(query.docs[0].data()._id);

    await docRef.delete();

    msg.channel.send(`User: ${username} deleted successfully!`);
  };
  // -------------------------------------------------------------------

  client.on("ready", () => {
    console.info("Bot is online!");
  });

  client.on("message", async msg => {
    const msgSplit = msg.content.toLowerCase().split(" ");

    if (msgSplit[0] !== BOT_PREFIX) {
      return;
    }

    switch (msgSplit[1]) {
      case `userid`:
        if (!msgSplit[2]) {
          msg.channel.send("You must pass a username!");
        } else {
          await getID(msg, msgSplit[2]);
        }
        break;
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
      case `update`:
        if (!msgSplit[2]) {
          msg.channel.send("You must pass a username!");
        } else if ((await checkIfUserExists(msgSplit[2].toLowerCase()))) {
          msg.channel.send("User does not exist");
        }
        
        if (msgSplit[3].toLowerCase() !== 'level' || msgSplit[3].toLowerCase() !== 'progress') {
          msg.channel.send("Invalid field type");
        } else if (msgSplit[3].toLowerCase() === 'level' && isNaN(msgSplit[4]) || msgSplit[3].toLowerCase() === 'progress' && isNaN(msgSplit[4])) {
          msg.channel.send("Please enter a valid numerical value!");
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
