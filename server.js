"use strict";

const methodOverride = require('method-override');
const express = require("express");
const Mongo = require("mongodb");
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 8080;

const MongoClient = Mongo.MongoClient;
const MONGODB_URI = "mongodb://127.0.0.1:27017/url_shortener";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");

function generateRandomString() {
  let randomString = "";
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  for(let i = 0; i < 6; i++) {
    randomString += charset.charAt(Math.floor(Math.random() * charset.length));
  };
  return randomString;
};

let dbInstance;
MongoClient.connect(MONGODB_URI, (err, db) => {
  if (err) { throw err; };
  console.log(`Successfully connected to DB: ${MONGODB_URI}`);
  dbInstance = db;
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  dbInstance.collection("urls").find().toArray((err, results) => {
    res.render("urls_index", {urls: results});
  });
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  dbInstance.collection("urls").insertOne({shortURL: generateRandomString(),
                                           longURL: req.body.URL});
  // TODO: should be in a callback:
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  dbInstance.collection("urls").findOne({shortURL: req.params.id }, (err, result) => {
    res.render("urls_show", result);
  });
});

app.get("/urls/:id/edit", (req, res) => {
  dbInstance.collection("urls").findOne({shortURL: req.params.id}, (err, result) => {
    res.render("urls_edit", result);
  });
});

app.put("/urls/:id", (req, res) => {
  dbInstance.collection("urls").updateOne({shortURL: req.params.id},
                                          {$set: {longURL: req.body.newURL}},
                                          (err, result) => {
                                            res.redirect("/urls");
                                          });
});

app.delete("/urls/:id", (req, res) => {
  dbInstance
    .collection("urls")
    .deleteOne({shortURL: req.params.id},
               (err, result) => {
                res.redirect("/urls");
               });
});

app.get("/u/:id", (req, res) => {
  dbInstance.collection("urls").findOne({shortURL: req.params.id}, (err, result) => {
    res.redirect(result.longURL);
  });
});