require("./utils.js");
require('dotenv').config();
const url = require('url');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
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

  await userCollection.insertOne({email: email, password: hashedPassword});
  console.log("Inserted user");

  // Create a session
  req.session.authenticated = true;
  req.session.email = email;
  req.session.cookie.maxAge = expireTime;

  // redirect the user to the / page.
  res.redirect('/');
});

// app.post('/loginSubmit', async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         // Query the database for a user with the provided username
//         const [rows] = await database.execute(
//             'SELECT * FROM user WHERE username = ?',
//             [username]
//         );

//         // If no user found, render the invalid login view
//         if (rows.length === 0) {
//             return res.render("invalidLogin");
//         }

//         // User found, check the password
//         const user = rows[0];
//         const passwordMatches = await bcrypt.compare(password, user.password);

//         if (passwordMatches) {
//             // Password matches, set up the session
//             req.session.authenticated = true;
//             req.session.name = user.username;
//             req.session.userId = user.user_id;
//             req.session.cookie.maxAge = expireTime;

//             return res.redirect('/chats');
//         } else {
//             // Password does not match
//             return res.render("invalidLogin");
//         }
//     } catch (error) {
//         console.error('Login error:', error);
//         return res.status(500).render("error", {errorMessage: "Internal server error"});
//     }
// });


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