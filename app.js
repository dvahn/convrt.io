const path = require("path");
const mongo = require("mongodb");
const schedule = require("node-schedule");

const port = process.env.PORT || 3000;

const express = require("express");
const exec = require("child_process").exec;
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded());
app.use(express.json());

const mongoClient = mongo.MongoClient;
const url = "mongodb://127.0.0.1:27017/convrt";

let data = [];
let messageFeeds = [];
let labels = [];
let loggedIn = false;

function updateAPI() {
  mongoClient.connect(url, (err, db) => {
    let dbo = db.db("convrt_database");
    dbo
      .collection("conversations")
      .find({}, { projection: { _id: 0, name: 1, ID: 1, image: 1, label: 1 } })
      .toArray((err, result) => {
        data = result;
        console.log(data);
        for (let i = 0; i < data.length; i++) {
          console.log(data[i].ID);
          dbo
            .collection(data[i].ID)
            .find({}, { projection: { _id: 0, sender: 1, time: 1, content: 1 } })
            .toArray((err, result) => {
              let obj = {};
              obj[data[i].ID] = result;
              messageFeeds.push(obj);
            });
        }
      });
    console.log(messageFeeds);
    dbo
      .collection("labels")
      .find({}, { projection: { _id: 0, name: 1, tags: 1 } })
      .toArray((err, result) => {
        labels = result;
      });
    console.log(labels);
  });
}

app.get("/", (req, res) => {
  res.sendFile("public/login.html", { root: __dirname });
});

app.post("/", (req, res) => {
  let user = req.body.username;
  let password = req.body.password;

  let crawlScript = exec("bash crawl.sh " + user + " " + password, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
    } else {
      mongoClient.connect(url, (err, db) => {
        if (err) throw err;
        let dbo = db.db("convrt_database");
        let newUser = { email: user, password: password, loggedIn: true };
        dbo.collection("userData").insertOne(newUser, function (err, res) {
          if (err) throw err;
          db.close();
        });
      });
    }
  });
  crawlScript.on("close", () => {
    res.redirect("/chat");
  });
});

app.get("/chat", (req, res) => {
  // connect to DB, check if logged in
  // if loggedIn == true, show chat page
  // mongoClient.connect(url, (err, db) => {
  //   let dbo = db.db("convrt_database");
  //   dbo.collection("userData").findOne({}, function (err, result) {
  //     if (err) throw err;
  //     loggedIn = result.loggedIn;
  //   });
  // });
  res.sendFile("public/chat.html", { root: __dirname });
  updateAPI();
});

app.post("/chat", function (req, res) {
  let type = req.body.message.type;
  if (type === "message") {
    console.log(
      "message",
      req.body.message.sender,
      req.body.message.time,
      req.body.message.content,
      req.body.message.id
    );
    mongoClient.connect(url, (err, db) => {
      if (err) throw err;
      let dbo = db.db("convrt_database");
      let newMessage = {
        sender: req.body.message.sender,
        time: req.body.message.time,
        content: req.body.message.content,
      };
      dbo.collection(req.body.message.id).insertOne(newMessage, function (err, res) {
        if (err) throw err;
        db.close();
      });
    });
  } else if (type === "addedLabel") {
    mongoClient.connect(url, (err, db) => {
      if (err) throw err;
      let dbo = db.db("convrt_database");
      let query = { ID: req.body.message.id };
      let label = { $set: { label: req.body.message.label } };
      dbo.collection("conversations").updateOne(query, label, function (err, res) {
        if (err) throw err;
        db.close();
      });
    });
  } else if (type === "createdLabel") {
    mongoClient.connect(url, (err, db) => {
      if (err) throw err;
      let dbo = db.db("convrt_database");
      let newLabel = { name: req.body.message.name, tags: req.body.message.tags };
      dbo.collection("labels").insertOne(newLabel, function (err, res) {
        if (err) throw err;
        db.close();
      });
    });
  } else {
    console.log("Unknown type!");
  }
  updateAPI();
});

// CRAWLING SCRIPT RIGHT BEFORE THAT!
// Insert messages into LinkedIn every 5 minutes
schedule.scheduleJob("*/5 * * * *", () => {
  if (loggedIn) {
    let syncScript = exec("bash synchronize.sh", (err, stdout, stderr) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      }
    });
  }
});

// API

app.get("/api/conversations", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/json");
  res.send(JSON.stringify(data));
});

app.get("/api/messageFeeds", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/json");
  res.send(JSON.stringify(messageFeeds));
});

app.get("/api/labels", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/json");
  res.send(JSON.stringify(labels));
});

app.listen(port);

// next steps:

// readme schreiben
// python script vom Frontend callen
// labels
// syncronize on shutdown
