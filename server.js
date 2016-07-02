"use strict";

const methodOverride = require('method-override');
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
app.set("view engine", "ejs");

const Mongo       = require("mongodb");
const MongoClient = Mongo.MongoClient;
const MONGODB_URI = "mongodb://127.0.0.1:27017/url_shortener";
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true}));
app.use(methodOverride('_method'));

let dbInstance;

MongoClient.connect(MONGODB_URI, (err, db) => {
  if (err) {
    throw err;
  };
  console.log(`Successfully connected to DB: ${MONGODB_URI}`);
  dbInstance = db;
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  dbInstance.collection("urls").find().toArray((err, results) => {
    let templateVars = {urls: results};
    res.render("urls_index", templateVars);
  });
});

app.post("/urls", (req, res) => {
  function generateRandomString() {
    let randomString = "";
    let charset = "abcdefghijklmnopqrstuvwxyz0123456789";
      for( let i=0; i < 6; i++ ) {
        randomString += charset.charAt(Math.floor(Math.random() * charset.length));
      };
    return randomString;
  };
  let inputURL = req.body.URL;
  let rCode = generateRandomString();
  dbInstance.collection("urls").insertOne({shortURL: rCode, longURL: inputURL});
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  dbInstance.collection("urls").findOne({shortURL:req.params.id }, (err, result) => {
    res.render("urls_show", result);
  });
});

app.delete("/urls/:id", (req, res) => {
  dbInstance.collection("urls").deleteOne({shortURL:req.params.id}, (err, result) => {
  res.redirect("/urls");
  });
});

app.get("/urls/:id/edit", (req, res) => {
  dbInstance.collection("urls").findOne({shortURL:req.params.id}, (err, result) => {
    res.render("urls_edit", result);
  });
});

app.put("/urls/:id/edit", (req, res) => {
  dbInstance.collection("urls").updateOne({shortURL:req.params.id},
                                          {$set: {longURL: req.body.newURL}},
                                          (err, result) => {
    res.redirect("/urls");
  });
});

app.get("/u/:id", (req, res) => {
  dbInstance.collection("urls").findOne({shortURL:req.params.id}, (err, result) => {
  res.redirect(result.longURL);
  });
});