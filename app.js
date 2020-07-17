const http = require("http");
const path = require("path");
const fs = require("fs");
const mongo = require("mongodb");

const hostname = "127.0.0.1";
const port = 3000;

const express = require("express");
const { PythonShell } = require("python-shell");
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded());
app.use(express.json());

const mongoClient = mongo.MongoClient;
const url = "mongodb://localhost:27017/convrt";

let data = [];
let messageFeeds = [];
mongoClient.connect(url, (err, db) => {
  dbo = db.db("convrt_database");
  dbo
    .collection("conversations")
    .find({}, { projection: { _id: 0, name: 1, ID: 1, image: 1 } })
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
});

app.get("/", (req, res) => {
  res.sendFile(
    "/Users/daniel/Documents/Master/ChatBot Projekt/convrt/public/chat.html"
  );
});

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

app.post("/", function (req, res) {
  let type = req.body.message.type;
  if (type === "message") {
    console.log("message");
    // TODO: save message to DB
  } else if (type === "refresh") {
    console.log("refresh");
    // call python scraping script
    let options = {
      pythonPath: "/usr/bin/python3",
      // make sure you use an absolute path for scriptPath
      scriptPath:
        "/Users/daniel/Documents/Master/ChatBot Projekt/convrt/Backend/",
    };

    PythonShell.run("crawl.py", options, function (err, results) {
      if (err) throw err;
      // results is an array consisting of messages collected during execution
      console.log("results: %j", results);
    });
  } else if (type === "addedLabel") {
    console.log("New Label!", req.body.message.label, req.body.message.id);
    // TODO: push to database
  } else {
    console.log("Unknown type!");
  }
});

app.listen(3000);

// next steps:

// readme schreiben
// python script vom Frontend callen
// labels
