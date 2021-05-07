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
          name: "info",
          value:
            "Shows all the information for all current users available in the database"
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

  const addUser = async (msg, username) => {
    const docRef = DB.collection("users").doc();

    await docRef.set({
      username: `${username.toLowerCase()}`,
      level: 0,
      progress: 0.0
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
    const query = await DB.collection("users").where("username", "==", username.toLowerCase()).get();
    const docRef = query.docs[0];
    console.log(typeof docRef);
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
      case `info`:
        break;
      case `userid`:
        await getID(msg, msgSplit[2]);
        break;
      case `add`:
        if (!(await checkIfUserExists(msgSplit[2].toLowerCase()))) {
          msg.channel.send("User already exists");
        } else {
          await addUser(msg, msgSplit[2]);
        }

        break;
      case `getuser`:
        await getUser(msg, msgSplit[2]);
      case `update`:
        break;
      case `delete`:
        await deleteUser(msg, msgSplit[2]);
        break;
      case `help`:
        await showHelp(msg);
        break;
      default:
        msg.channel.send("In-correct command, please use a valid one!");
    }
  });
};
