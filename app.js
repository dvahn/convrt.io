const http = require("http");
const path = require("path");
const fs = require("fs");
const mongo = require("mongodb");

const hostname = "127.0.0.1";
const port = process.env.PORT || 3000;

const express = require("express");
const { PythonShell } = require("python-shell");
const { connect } = require("http2");
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded());
app.use(express.json());

const mongoClient = mongo.MongoClient;
const url = "mongodb://mongo:27017/convrt";

let data = [];
let messageFeeds = [];
let labels = [];

function updateAPI() {
  mongoClient.connect(url, (err, db) => {
    console.log("Connected!");
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
  updateAPI();
  res.sendFile("public/chat.html", { root: __dirname });
});

app.get("/api/conversations", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/json");
  // TODO: CLEAR PAGE
  res.send(JSON.stringify(data));
});

app.get("/api/messageFeeds", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/json");
  // TODO: CLEAR PAGE
  res.send(JSON.stringify(messageFeeds));
});

app.get("/api/labels", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/json");
  // TODO: CLEAR PAGE
  res.send(JSON.stringify(labels));
});

app.post("/", function (req, res) {
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
  } else if (type === "refresh") {
    console.log("refresh");
    // call python scraping script
    let options = {
      pythonPath: "/usr/bin/python3",
      // make sure you use an absolute path for scriptPath
      scriptPath: "/Users/daniel/Documents/Master/ChatBot Projekt/convrt/Backend/",
    };

    PythonShell.run("crawl.py", options, function (err, results) {
      if (err) throw err;
      // results is an array consisting of messages collected during execution
      console.log("results: %j", results);
    });
  } else if (type === "addedLabel") {
    // console.log("New Label!", req.body.message.label, req.body.message.id);
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
    // TODO: add labels to DB
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

app.listen(port);

// next steps:

// readme schreiben
// python script vom Frontend callen
// labels
