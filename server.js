"use strict";

var methodOverride = require('method-override')
var express = require("express");
var app = express();
app.set("view engine", "ejs");
var PORT = process.env.PORT || 8080; // default port 8080

const Mongo       = require("mongodb")
const MongoClient = Mongo.MongoClient;
const MONGODB_URI = "mongodb://127.0.0.1:27017/url_shortener";

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


let dbInstance;

MongoClient.connect(MONGODB_URI, (err, db) => {
  if (err) {
    throw err;
  }
  console.log(`Successfully connected to DB: ${MONGODB_URI}`);
  dbInstance = db;
});


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true}));
app.use(methodOverride('_method'))


app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  dbInstance.collection("urls").find().toArray((err, results) => {
    let templateVars = {urls: results}
    res.render("urls_index", templateVars);
  })
});


app.post("/urls", (req, res) => {

function generateRandomString() {
  let randomString = "";
  let charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 6; i++ ) {
        randomString += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return randomString;
};

  var inputURL = req.body.URL;
  var rCode = generateRandomString();
  dbInstance.collection("urls").insertOne({shortURL: rCode, longURL: inputURL})
  res.redirect("/urls")
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.delete("/urls/:id", (req, res) => {
  dbInstance.collection("urls").deleteOne({shortURL:req.params.id}, (err, result) => {
  res.redirect("/urls");
  })
});


app.get("/urls/:id/edit", (req, res) => {
  dbInstance.collection("urls").findOne({shortURL:req.params.id}, (err, result) => {
    res.render("urls_edit", result);
  })
});



app.put("/urls/:id/edit", (req, res) => {
  dbInstance.collection("urls").updateOne({shortURL:req.params.id},
                                          {$set: {longURL: req.body.newURL}},
                                          (err, result) => {

    res.redirect("/urls");
  })
});



app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  dbInstance.collection("urls").findOne({shortURL:req.params.id }, (err, result) => {
    // let templateVars = { urls: result }
    res.render("urls_show", result);
  });
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



// app.get("/u/:shortURL", (req, res) => {
//   let shortURL = {rCode : req.params.shortURL};
//   let longURL = urlDatabase[shortURL];
//   res.redirect(longURL);
// });

