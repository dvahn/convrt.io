const path = require("path");
const mongo = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const port = process.env.PORT || 3000;

const express = require("express");
const exec = require("child_process").exec;
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded());
app.use(express.json());
app.use(cors());

const mongoClient = mongo.MongoClient;
const url = "mongodb://127.0.0.1:27017/convrt";
const defaultLabels = ["All Messages", "Job", "Family", "Hobby"];

// CREATE A NEW USER
app.post("/signup", (req, res, next) => {
  const newUser = {
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, 10),
    li_mail: req.body.li_mail,
    li_password: req.body.li_password,
    labels: defaultLabels,
    conversations: req.body.conversations,
  };
  // save new user to db
  mongoClient.connect(url, (err, db) => {
    if (err) throw err;
    let dbo = db.db("convrt_database");
    dbo.collection("users").insertOne(newUser, function (err, response) {
      if (err) {
        res.send(400, { message: "Username already in use!", error: err });
      }
      db.close();
      res.send(200, { message: "Signup succeeded" });
    });
  });
});
// LOGIN
app.post("/login", (req, res, next) => {
  mongoClient.connect(url, (err, db) => {
    if (err) throw err;
    let query = { username: req.body.username };
    let dbo = db.db("convrt_database");
    dbo
      .collection("users")
      .find(query)
      .toArray(function (err, result) {
        if (err) {
          res.send(400, { message: "server error", error: err });
        }
        if (!result[0]) {
          res.send(401, { message: "user not found", error: "invalid credentials" });
        }
        // check for invalid password
        if (result[0]) {
          if (!bcrypt.compareSync(req.body.password, result[0].password)) {
            res.status(401).send({ message: "login failed", error: "invalid credentials" });
          }
          let token = jwt.sign({ userId: result[0]._id }, "secretkey");
          res.status(200).send({ message: "login succeeded", token: token, user: req.body.username });
        }
        db.close();
      });
  });
});
// SEND A MESSAGE
app.post("/sendMessage", async function (req, res) {
  let newMessage = {
    sender: req.body.sender,
    time: req.body.time,
    content: req.body.content,
  };
  let conversations = await loadConversations();
  await conversations.find({ ID: req.body.receiver_id }, {}).toArray(async function (err, result) {
    if (err) throw er;
    let message_feed = result[0].message_feed;
    for (let i = message_feed.length; i > 0; i--) {
      message_feed[i] = message_feed[i - 1];
    }
    message_feed[0] = newMessage;
    let new_message = { $set: { message_feed: message_feed } };
    await conversations.updateOne({ ID: req.body.receiver_id }, new_message, function (err, result) {
      if (err) throw err;
      res.status(200).send({ message: "Send message" });
    });
  });
});

// ADD LABEL TO A CONVERSATION
app.post("/addLabel", async function (req, res) {
  let conversations = await loadConversations();
  await conversations.find({ ID: req.body.contact }, {}).toArray(async function (err, result) {
    if (err) throw err;
    let labels = result[0].labels;
    labels[labels.length] = req.body.label;
    let newLabels = { $set: { labels: labels } };
    await conversations.updateOne({ ID: req.body.contact }, newLabels, function (err, result) {
      if (err) throw err;
      res.status(200).send({ message: "Added label." });
    });
  });
});

// CREATE NEW LABEL FOR A SPECIFIC USER
app.post("/createLabel", async function (req, res) {
  let user = req.body.user;
  let newLabel = req.body.name;
  let users = await loadUsers();
  users.find({ username: user }, {}).toArray(async function (err, result) {
    if (err) throw er;
    let labels = result[0].labels;
    labels[labels.length] = newLabel;
    let newLabels = { $set: { labels: labels } };
    users.updateOne({ username: user }, newLabels, function (err, result) {
      if (err) throw err;
      res.status(200).send({ message: "Creating new label" });
    });
  });
});
// CRAWL AND INSERT NEW MESSAGES TO LINKEDIN
app.post("/refresh", function (req, res) {
  // mehrfach Ausführung abfangen
  let user = req.body.username;
  let syncScript = exec("bash synchronize.sh " + user, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    }
  });
});
// HELPER FUNCTIONS THAT RETURN MONGODB COLLECTIONS
async function loadUsers() {
  let client = await mongoClient.connect(url);
  return client.db("convrt_database").collection("users");
}
async function loadConversations() {
  let client = await mongoClient.connect(url);
  return client.db("convrt_database").collection("conversations");
}
// LOAD ALL CONVERSATIONS OF ALL USERS
app.get("/api/conversations", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/json");
  let conversations = await loadConversations();
  res.send(
    JSON.stringify(
      await conversations
        .find({}, { projection: { _id: 0, ID: 1, name: 1, image: 1, show: 1, labels: 1, message_feed: 1 } })
        .toArray()
    )
  );
});
// GET CONVERSATIONS FOR SPECIFIC USER
app.get("/api/:user/conversations", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/json");
  let user = req.params.user;
  let conversations = await loadConversations();
  res.send(
    JSON.stringify(
      await conversations
        .find(
          { associated_user: user },
          { projection: { _id: 0, ID: 1, name: 1, image: 1, show: 1, labels: 1, message_feed: 1 } }
        )
        .toArray()
    )
  );
});
// GET LABELS OF A USER
app.get("/api/:user/labels", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/json");
  let user = req.params.user;
  let users = await loadUsers();
  res.send(
    JSON.stringify(
      await users
        .find(
          { username: user },
          { projection: { _id: 0, username: 0, password: 0, li_mail: 0, li_password: 0, conversations: 0 } }
        )
        .toArray()
    )
  );
});

app.listen(port);
