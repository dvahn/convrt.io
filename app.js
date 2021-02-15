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

let loggedIn = false;

app.get("/", (req, res) => {
  res.sendFile("public/login.html", { root: __dirname });
});

app.post("/", (req, res) => {
  let user = req.body.username;
  let password = req.body.password;

  res.redirect("/chat");
});

// CREATE A NEW USER
app.post("/signup", (req, res, next) => {
  const newUser = {
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, 10),
    li_mail: req.body.li_mail,
    li_password: req.body.li_password,
    labels: req.body.labels,
    conversations: req.body.conversations,
  };
  // SAVE NEW USER TO DB
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
            res.send(401, { message: "login failed", error: "invalid credentials" });
          }
          let token = jwt.sign({ userId: result[0]._id }, "secretkey");
          res.send(200, { message: "login succeeded", token: token, user: req.body.username });
        }
        db.close();
      });
  });
});

app.post("/sendMessage", function (req, res) {
  console.log("message", req.body.message.sender, req.body.message.time, req.body.message.content, req.body.message.id);
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
});

app.post("/addLabel", function (req, res) {
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
});

app.post("/createLabel", function (req, res) {
  mongoClient.connect(url, (err, db) => {
    if (err) throw err;
    let dbo = db.db("convrt_database");
    let newLabel = { name: req.body.message.name, tags: req.body.message.tags };
    dbo.collection("labels").insertOne(newLabel, function (err, res) {
      if (err) throw err;
      db.close();
    });
  });
});

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

// API
async function loadConversations() {
  let client = await mongoClient.connect(url);
  return client.db("convrt_database").collection("conversations");
}
app.get("/api/conversations", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/json");
  let conversations = await loadConversations();
  res.send(
    JSON.stringify(
      await conversations
        .find({}, { projection: { _id: 0, name: 1, ID: 1, image: 1, label: 1, messageFeed: 1 } })
        .toArray()
    )
  );
});

async function loadLabels() {
  let client = await mongoClient.connect(url);
  return client.db("convrt_database").collection("labels");
}
app.get("/api/labels", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/json");
  let labels = await loadLabels();
  res.send(JSON.stringify(await labels.find({}, { projection: { _id: 0, name: 1, tags: 1 } }).toArray()));
});

app.listen(port);
