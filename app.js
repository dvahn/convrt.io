const http = require("http");
const path = require("path");
const fs = require("fs");
const mongo = require("mongodb");

const hostname = "127.0.0.1";
const port = 3000;

const express = require("express");
const { nextTick } = require("process");
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
  console.log(req.body.message.content);
  // save message to DB
});

app.listen(3000);

// const server = http.createServer((req, res) => {
//   // File path
//   let filePath = path.join(
//     __dirname,
//     "public",
//     req.url === "/" ? "chat.html" : req.url
//   );

//   //Extension of file
//   let extname = path.extname(filePath);
//   let contentType = "text/html";
//   switch (extname) {
//     case ".js":
//       contentType = "text/javascript";
//       break;
//     case ".css":
//       contentType = "text/css";
//       break;
//     case ".json":
//       contentType = "application/json";
//       break;
//     case ".png":
//       contentType = "image/png";
//       break;
//     case ".jpg":
//       contentType = "image/jpg";
//       break;
//     case ".svg":
//       contentType = "image/svg+xml";
//   }
//   //   // Read file
//   fs.readFile(filePath, (err, content) => {
//     if (err) {
//       if (err.code == "ENOENT") {
//         // Page not found
//         fs.readFile(
//           path.join(__dirname, "public", "404.html"),
//           (err, content) => {
//             res.writeHead(200, { "Content-Type": "text/html" });
//             res.end(content, "utf8");
//           }
//         );
//       } else {
//         // Server error
//         res.writeHead(500);
//         res.end(`Server Error: ${err.code}`);
//       }
//     } else {
//       // Success
//       res.writeHead(200, { "Content-Type": contentType });
//       res.end(content, "utf8");
//     }
//   });
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });
