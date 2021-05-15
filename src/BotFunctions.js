const TS = require("./utils/timestamp");

class BotFunctions {
  constructor(Discord, DB) {
    this.Discord = Discord;
    this.DB = DB;
  }

  async help() {
    const msg = new this.Discord.MessageEmbed();

    msg
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
          name: "get [username]",
          value: "Displays all information for a given username"
        },
        {
          name: "showall",
          value: "Return a table with all users information"
        },
        {
          name: "update [username] [field type] [value]",
          value:
            "Update the value of a certain attribute for a user.\nAvailable field types:\n  - level\n-  token\n\n**Each value is updated one at a time**\n**Example: -dnd update Neo level 140**"
        },
        {
          name: "delete [username]",
          value: "Deletes a certain user from the database"
        },
        {
          name: "Credits",
          value: "Developed by Neo and Vaxeon"
        }
      );

    return Promise.resolve(msg);
  }

  async checkIfUserExists(username) {
    const querySnapshot = await this.DB.collection("users")
      .where("username", "==", username)
      .get();

    console.info(
      `[${TS()}][info] Checking if user: ${username} exists, result: ${!querySnapshot.empty}`
    );

    return Promise.resolve(!querySnapshot.empty);
  }

  async getUserId(username) {
    const userId = (await this.getUser(username)).id;

    console.info(
      `[${TS()}][info] Fetching the Id for user: ${username}, result: ${userId}`
    );

    return Promise.resolve(userId);
  }

  async addUser(username) {
    const docRef = await this.DB.collection("users").doc();

    const info = {
      username: username,
      level: 1,
      token: 0
    };

    await docRef.set(info);
    await docRef.set({ id: docRef.id }, { merge: true });

    console.info(`[${TS()}][info] Adding user: ${username}`);

    return Promise.resolve(docRef);
  }

  async getUser(username) {
    const querySnapshot = await this.DB.collection("users")
      .where("username", "==", username)
      .get();

    const docs = querySnapshot.docs;

    const docSnapshot = docs[0];
    const docData = docSnapshot.data();

    console.info(
      `[${TS()}][info] Fetching information for user: ${username}, result:\n${JSON.stringify(
        docData
      )}\n-----------------`
    );

    return Promise.resolve(docData);
  }

  async getAllUsers() {
    const query = await this.DB.collection("users")
      .orderBy("username", "asc")
      .get();

    const users = [];
    query.docs.forEach((doc) => users.push(doc.data()));

    console.info(`[${TS()}][info] Fetching all users`);

    return Promise.resolve(users);
  }

  async updateUser(username, field, fieldValue, increment) {
    const querySnapshot = await this.DB.collection("users")
      .where("username", "==", username)
      .get();

    const docSnapShot = querySnapshot.docs[0];
    const docRef = docSnapShot.ref;
    const docData = docSnapShot.data();

    if (field === "level") {
      await docRef.update({ level: fieldValue });
    } else {
      if (!increment) {
        await docRef.update({ token: fieldValue });
      } else {
        await docRef.update({ token: docData.token + 1 });
      }
    }

    console.info(
      `[${TS()}][info] Updating field: ${field} for user: ${username}, from: ${
        field === "level" ? docData.level : docData.token
      }, to: ${increment ? docData.token + 1 : fieldValue}`
    );

    return Promise.resolve(docRef);
  }

  async incrementToken(username) {
    const docRef = await this.updateUser(username, "token", null, true);
    const docData = (await docRef.get()).data();

    let level = docData.level;
    const tokens = docData.token;

    let leveledUp = false;

    if ((8 <= level && 8 <= tokens) || (level < 8 && level <= tokens)) {
      await docRef.update({ level: level + 1, token: 0 });

      leveledUp = true;
      level = level + 1;

      console.info(
        `[${TS()}][info] User: ${username}, has leveled up from ${level} to ${
          level + 1
        }`
      );
    }

    return Promise.resolve({ docRef, leveledUp, level });
  }

  async deleteUser(username) {
    const querySnapshot = await this.DB.collection("users")
      .where("username", "==", username)
      .get();

    const docSnapShot = querySnapshot.docs[0];
    const docData = docSnapShot.data();
    const docRef = docSnapShot.ref;

    await docRef.delete();

    console.info(
      `[${TS()}][info] Deleting user: ${username}, information:\n${JSON.stringify(
        docData
      )}\n-----------`
    );

    return Promise.resolve(docData);
  }
}

module.exports = BotFunctions;
