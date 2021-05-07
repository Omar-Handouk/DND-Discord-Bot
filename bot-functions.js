"ues strict";

const BOT_PREFIX = "-dnd";

/**
 * Show Database
 * Modify in DB (Each user has a unique ID) (Username -ALPHANUMERIC, Character level -NUMBER, Progression -FLOAT)
 * Add a new user
 * Delete a user
 */

module.exports = (client, DB) => {
  client.on("ready", () => {
    console.info("Bot is online!");
  });
  
  
  client.on("message", async msg => {
    const msgSplit = msg.content.toLowerCase().split(" ");

    if (msgSplit[0] !== BOT_PREFIX) {
      return;
    }

    switch (msgSplit[1]) {
      case `db`:
        break;
      case `add`:
        const docRef = DB.collection("users").doc();

        const a = await docRef.set({
          username: `${msgSplit[2]}`
        });

        msg.channel.send(docRef.id);

        break;
      case `update`:
        break;
      case `delete`:
        break;
      default:
        break;
    }
  });
};
