"use strict";

const fs = require("fs");
const CloudConvert = require("cloudconvert");
const parse = require("json2csv").parse;

const cloudConvert = new CloudConvert(process.env.CONVERT_CLOUD_API);

module.exports = async DB => {
  const exportUsersToCSV = async () => {
    const query = await DB.collection("users")
      .orderBy("username", "asc")
      .get();

    let users = [];
    const fields = ["_id", "username", "level", "token"];
    const opts = { fields };

    query.forEach(user => users.push(user.data()));

    let csv = null;
    try {
      csv = parse(users, opts);
    } catch (e) {
      console.error(e);
    }

    fs.writeFileSync("./users.csv", csv, { encoding: "utf8", flag: "w" });
  };

  const generateTable = async () => {
    let job = await cloudConvert.jobs.create({
      tasks: {
        "import-csv": {
          operation: "import/base64",
          file: fs.readFileSync("./users.csv", {
            encoding: "base64",
            flag: "r"
          }),
          filename: "users.csv"
        },
        "convert-csv-to-html": {
          operation: "convert",
          input_format: "csv",
          output_format: "html",
          engine: "libreoffice",
          input: ["import-csv"],
          embed_images: false
        },
        "export-html": {
          operation: "export/url",
          input: ["convert-csv-to-html"],
          inline: false,
          archive_multiple_files: false
        }
      }
    });

    job = await cloudConvert.jobs.wait(job.id);

    const exportTask = job.tasks.filter(
      task => task.operation === "export/url" && task.status === "finished"
    )[0];

    const file = exportTask.result.files[0];

    return Promise.resolve(file.url);
  };

  await exportUsersToCSV();
  
  return Promise.resolve(await generateTable());
};