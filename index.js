require("./utils.js");
require("dotenv").config();
const url = require("url");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
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

let { database } = include("databaseConnection");

const userCollection = database.db(mongodb_database).collection("users");
const petCollection = database.db(mongodb_database).collection("pets");

const stats = require(`./scripts/pet_status.js`); //Pet status script for api calls

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false })); //middle ware

var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}`,
  crypto: {
    secret: mongodb_session_secret,
  },
});

app.use(
  session({
    secret: node_session_secret,
    store: mongoStore, //default is memory store
    saveUninitialized: false,
    resave: true,
  })
);

app.get("/", (req, res) => {
  if (!req.session.authenticated) {
    res.render("index_noLogIn");
  } else {
    res.redirect("/main");
  }
});

app.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.get("/main", async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect("/");
        return;
    }
    const pet = await petCollection.findOne({ user_id: req.session.userId });
    res.render("main", { pet: pet });
});

app.get("/register_pet_type", (req, res) => {
    if (!req.session.authenticated) {
        res.redirect("/");
        return;
    }
    res.render("register_pet_type");
});

app.get("/register_pet_name", (req, res) => {
    const pet_type = req.query.pet_type;
    res.render("register_pet_name", {pet_type: pet_type});
});

app.get("/register_schedule", (req, res) => {
    res.render("register_schedule");
});

// test for modal
app.get("/modal", (req, res) => {
    res.render("modal");
});

app.post("/signupSubmit", async (req, res) => {
  // Logic for handling the signup-submit route and processing the signup form submission
  let password = req.body.passwordConfirmed;
  let email = req.body.email?.trim();

  if (req.session.authenticated) {
    res.redirect("/register_pet_type");
    return;
  }

  // check if the id already exists
  const emailCheck = await userCollection
    .find({ email: email })
    .project({ _id: 1 })
    .toArray();

  if (emailCheck.length > 0) {
    res.render("signup", {error: `This email already exists.\nPlease choose a different email.`});
    return;
  }

  // If inputs are valid, add the member
  let hashedPassword = await bcrypt.hash(password, saltRounds);

  await userCollection.insertOne({
    email: email,
    password: hashedPassword,
    last_time_logged_in: new Date(),
    registered_date: new Date(),
  });
  console.log("Inserted user");

  const result = await userCollection
    .find({ email: email })
    .project({
      _id: 1,
      password: 1,
    })
    .toArray();

  const uid = result[0]._id;

  // Create a session
  req.session.authenticated = true;
  req.session.email = email;
  req.session.cookie.maxAge = expireTime;
  req.session.userId = uid;

  // redirect the user to the / page.
  res.redirect("/register_pet_type");
});

app.post("/loginSubmit", async (req, res) => {
  // Logic for handling the login-submit route and processing the login form submission
  let email = req.body.email;
  let submittedPassword = req.body.password;

  try {
    const result = await userCollection
      .find({ email: email })
      .project({
        _id: 1,
        password: 1,
      })
      .toArray();

    // Check if user exists
    if (result.length === 0) {
      // No user found with the provided email
      console.log("Invalid email or user does not exist.");
      return res.render('login', { error: "Invalid email or password." });
    }

    // Verify password
    const match = await bcrypt.compare(submittedPassword, user.password);

    const uid = result[0]._id;
    if (match) {
      await userCollection.updateOne(
        { _id: new ObjectId(uid) },
        { $set: { last_time_logged_in: new Date() } }
      );
      console.log("Updated last_time_logged_in");
  
      req.session.authenticated = true;
      req.session.email = email;
      req.session.cookie.maxAge = expireTime;
      req.session.userId = uid;
  
      res.redirect("/main");
    } else {
      // Password does not match
      console.log("Invalid password.");
      // return res.redirect("/login"); // Redirect back to login page or handle appropriately
      return res.render('login', { error: "Invalid email or password." });
    }
    
  } catch (error) {
    console.error("Login error: ", error);
    // Handle errors appropriately
    return res.render('login', { error: "Invalid email or password." });
  }
});

app.post("/register_pet_type_submit", async (req, res) => {
    const pet_type = req.body.petType;

    res.redirect(`/register_pet_name?pet_type=${pet_type}`);
});

app.post("/register_pet_name_submit", async (req, res) => {
    const pet_name = req.body.petName;
    const pet_type = req.body.petType;
    const uid = req.session.userId;

    try {
        await petCollection.insertOne({
            user_id: uid,
            pet_type: pet_type,
            name: pet_name,
            energy: 75,
            hunger: 75,
            happiness: 100
        });
        console.log("Inserted pet");

        res.redirect(`/register_schedule`);
    } catch (error) {
        console.error("Error inserting pet: ", error);
        res.status(500).send("An error occurred");
    }

});

app.post("/register_schedule_submit", async (req, res) => {
    const sleepTime = req.body.sleepTime;
    const wakeTime = req.body.wakeTime;
    const uid = req.session.userId;

    try {
        await userCollection.updateOne(
            { _id: new ObjectId(uid) },
            { $set: { sleep_time: sleepTime, wake_time:wakeTime } }
        );
        console.log("Registered schedule");

        res.redirect(`/main`);
    } catch (error) {
        console.error("Error updating schedule: ", error);
        res.status(500).send("An error occurred");
    }
   
});

app.post("/update_schedule_submit", async (req, res) => {
    const sleepTime = req.body.sleepTime;
    const wakeTime = req.body.wakeTime;
    const uid = req.session.userId;

    try {
        await userCollection.updateOne(
            { _id: new ObjectId(uid) },
            { $set: { sleep_time: sleepTime, wake_time:wakeTime } }
        );
        console.log("Updated schedule");

        res.redirect(`/main`);
    } catch (error) {
        console.error("Error updating schedule: ", error);
        res.status(500).send("An error occurred");
    }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.use(express.static(__dirname + "/public"));
app.use(express.static("public"));
app.use('/scripts', express.static("public/scripts"));

app.get(`/api/stats`, async(req,res) => {
    const uid = req.session.userId;
    const pet = await petCollection.findOne({ user_id: uid });
    const user = await userCollection.findOne({ _id: new ObjectId(uid) });

    const results = stats.calculateStats(user.last_time_logged_in, pet.energy, pet.hunger, pet.happiness);
    await petCollection.updateOne({user_id: uid}, {$set: {hunger: results[0], energy: results[1], happiness: results[2]}});
    await userCollection.updateOne({_id: new ObjectId(uid)}, {$set: {last_time_logged_in: new Date()}});

    res.json(results);
});

app.get(`/api/eat`, async(req,res) => {
    const uid = req.session.userId;
    const pet = await petCollection.findOne({ user_id: uid });
    console.log("Old: " + pet.hunger);
    var newHunger = Math.min(100,pet.hunger + 50);

    console.log("New: " + newHunger);
    //Update Hunger in the database
    await petCollection.updateOne({user_id: pet.user_id}, {$set: {hunger: newHunger}})
    
    res.json({result: "fed"});
});

app.get(`/api/play`, async(req,res) => {
    const uid = req.session.userId;
    const pet = await petCollection.findOne({ user_id: uid });
    var newHappiness = Math.min(100,pet.happiness + 50);
    //Update Happiness in the database
    await petCollection.updateOne({user_id: pet.user_id}, {$set: {happiness: newHappiness}})

    res.json({result: "played"});
});

app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

app.listen(port, () => {
  console.log("Node application listening on port " + port);
});
