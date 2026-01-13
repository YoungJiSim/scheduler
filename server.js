const express = require("express");
const app = express();
const PORT = 3000;

const sqlite3 = require("sqlite3").verbose();

app.use(express.static("public"));
app.use(express.json());

main().catch((error) => console.log(error));

async function main() {
  app.listen(PORT, () => {
    console.log(`Server is running`);
  });

  // open database
  const db = new sqlite3.Database("./db/scheduler.db", (error) => {
    if (error) console.error(error.message);
    console.log("Connected to the scheduler database.");
  });

  app.get("/schedules", (req, res) => {
    const sql = "SELECT * FROM Schedules";

    db.all(sql, (error, rows) => {
      if (error) console.log(error.message);
      res.send(rows);
    });
  });

  app.get("/schedule/:id", (req, res) => {
    const scheduleId = req.params.id;
    const sql = `SELECT * FROM Schedules WHERE scheduleId == ${scheduleId}`;

    db.get(sql, (error, row) => {
      if (error) console.log(error.message);
      res.send(row);
    });
  });

  app.post("/schedule", (req, res) => {
    const schedule = req.body;

    const title = schedule.title;
    const priority = schedule.priority ? schedule.priority : "NULL";
    const recurrenceRule = schedule.recurrenceRule
      ? schedule.recurrenceRule
      : "NULL";
    const startDate = schedule.startDate ? schedule.startDate : "NULL";
    const startTime = schedule.startTime ? schedule.startTime : "NULL";
    const endDate = schedule.endDate ? schedule.endDate : "NULL";
    const endTime = schedule.endTime ? schedule.endTime : "NULL";
    const description = schedule.description ? schedule.description : "NULL";

    const sql = `INSERT INTO Schedules(title, description, priority, startDate, startTime, endDate, endTime, recurrenceRule) VALUES("${title}", "${description}", "${priority}","${startDate}", "${startTime}", "${endDate}", "${endTime}", "${recurrenceRule}")`;

    db.run(sql, function (error) {
      if (error) {
        console.log(error.message);
        res.status(400).send(error.message);
      }
      const scheduleId = this.lastID;
      console.log(
        `A row has been inserted to Schedules with rowid ${scheduleId}`
      );
    });
    res.status(201).send("sucessfully added");
  });

  app.put("/schedule/:id", (req, res) => {
    const scheduleId = req.params.id;
    const schedule = req.body;

    const title = schedule.title;
    const priority = schedule.priority ? schedule.priority : "NULL";
    const recurrenceRule = schedule.recurrenceRule
      ? schedule.recurrenceRule
      : "NULL";
    const startDate = schedule.startDate ? schedule.startDate : "NULL";
    const startTime = schedule.startTime ? schedule.startTime : "NULL";
    const endDate = schedule.endDate ? schedule.endDate : "NULL";
    const endTime = schedule.endTime ? schedule.endTime : "NULL";
    const description = schedule.description ? schedule.description : "NULL";

    const sql = `UPDATE Schedules SET title = "${title}", priority = "${priority}", recurrenceRule = "${recurrenceRule}", startDate = "${startDate}", startTime = "${startTime}", endDate = "${endDate}", endTime = "${endTime}", description = "${description}" WHERE scheduleId = ${scheduleId}`;

    db.run(sql, function (error) {
      if (error) {
        console.log(error.message);
        res.status(400).send(error.message);
      }
      console.log(`A row updated: ${this.changes}`);
    });
    res.status(200).send("sucessfully updated");
  });

  app.delete("/schedule/:id", (req, res) => {
    const scheduleId = req.params.id;
    const sql = `DELETE FROM Schedules WHERE scheduleId = ${scheduleId}`;

    db.run(sql, function (error) {
      if (error) {
        console.log(error.message);
        res.status(400).send(error.message);
      }
      console.log(`A row deleted: ${this.changes}`);
    });
    res.status(200).send("sucessfully deleted");
  });

  process.on("SIGINT", () => {
    // close the database connection
    db.close((error) => {
      if (error) return console.error(error.message);
      console.log("Close the database connection.");
      process.exit(error ? 1 : 0);
    });
  });
}
