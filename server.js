"use strict";

var methodOverride = require('method-override')
var express = require("express");
var app = express();
app.set("view engine", "ejs");
var PORT = process.env.PORT || 8080; // default port 8080

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
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

  var inputURL = req.body.longURL;
  var rCode = generateRandomString();
  urlDatabase[rCode]=inputURL;
  console.log(urlDatabase);
  // res.send("Ok here's your code: " + "/u/" + rCode);
       // Respond with 'Ok' (we will replace this)
  res.redirect("/urls")
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urls: urlDatabase };
  res.render("urls_show", templateVars);
});


app.delete("/urls/:id", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



// app.get("/u/:shortURL", (req, res) => {
//   let shortURL = {rCode : req.params.shortURL};
//   let longURL = urlDatabase[shortURL];
//   res.redirect(longURL);
// });

