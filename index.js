require("./utils.js");
require('dotenv').config();
const url = require('url');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const {ObjectId} = require("mongodb");
const bcrypt = require('bcrypt');
const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();

const Joi = require("joi");

const expireTime = 1 * 60 * 60 * 1000; //expires after 1 hour  (hours * minutes * seconds * millis)

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;

/* END secret section */

let {database} = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false})); //middle ware

var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}`,
    crypto: {
      secret: mongodb_session_secret
    }
  });
  
  app.use(session({
      secret: node_session_secret,
      store: mongoStore, //default is memory store
      saveUninitialized: false,
      resave: true
    }
  ));

app.get('/', (req,res) => {
    if (!req.session.authenticated) {
        res.render("index_noLogIn");
    } else {
        res.render("index_loggedIn", {req: req});
    }
});

app.get('/signup', (req,res) => {
    res.render("signup");
});

app.get('/login', (req,res) => {
    res.render("login");
});

app.post('/signupSubmit', async (req, res) => {
    // Logic for handling the signup-submit route and processing the signup form submission
    let password = req.body.password;
    let email = req.body.email?.trim();

    if (req.session.authenticated) {
        res.redirect('/');
        return;
    }

    // check if the id already exists
    const emailCheck = await userCollection.find({email: email}).project({_id: 1}).toArray();

    if (emailCheck.length > 0) {
        res.render('signup-submit', {
        signupFail: true,
        errorMessage: `This email already exists. \n Please choose a different email.`
        });
        return;
    }

    // If inputs are valid, add the member
    let hashedPassword = await bcrypt.hash(password, saltRounds);

    await userCollection.insertOne({email: email, password: hashedPassword, last_time_logged_in: new Date()});
    console.log("Inserted user");

    // Create a session
    req.session.authenticated = true;
    req.session.email = email;
    req.session.cookie.maxAge = expireTime;

    // redirect the user to the / page.
    res.redirect('/');
});

app.post('/loginSubmit', async (req, res) => {
    // Logic for handling the login-submit route and processing the login form submission
    let email = req.body.email;

    const result = await userCollection.find({email: email}).project({
        _id: 1,
        password: 1
    }).toArray();

    let uid = result[0]._id;
    await userCollection.updateOne({_id: new ObjectId(uid)}, {$set: {last_time_logged_in: new Date()}});
    console.log("Updated last_time_logged_in");

    req.session.authenticated = true;
    req.session.email = email;
    req.session.cookie.maxAge = expireTime;

    res.redirect('/');
});


app.get('/logout', (req,res) => {
    req.session.destroy();
    res.redirect('/');
});
  
app.use(express.static(__dirname + "/public"));

app.get("*", (req,res) => {
	res.status(404);
	res.render("404");
})

app.listen(port, () => {
	console.log("Node application listening on port "+port);
}); 