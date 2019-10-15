const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const contactController = require("./controllers/contactsController");
const userController = require("./controllers/usersController");
const authController = require("./controllers/authController")
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const requireLogin = require("./middleware/requireLogin");
const checkForToken = require("./middleware/authToken");
require('./db/db');
require("dotenv").config();
// simply requiring it apparently runs the scheduler
require("./scheduler");

const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'mySessions'
});

store.on('connected', function() {
    store.client; // The underlying MongoClient object from the MongoDB driver
});
   
  // Catch errors
store.on('error', function(error) {
    console.log(error);
});

const corsOptions = {
    origin: "*",
    // origin: "http://localhost:3001",
    credentials: true,
    optionsSuccessStatus: 200 
  }
  
// Middleware
app.use(cors(corsOptions));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret $tash',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    // Boilerplate options, see:
    // * https://www.npmjs.com/package/express-session#resave
    // * https://www.npmjs.com/package/express-session#saveuninitialized
    resave: true,
    saveUninitialized: true
}));
app.use(async (req, res, next) => {
    res.locals.user = req.session.userId || {};
    next();
})

// app.get("/", async (req, res) => {
//     if(req.session.logged){
//         if(bcrypt.compareSync(req.body.password, foundUser.password)){
//             req.session.logged = true;
//             req.session.email = foundUser.email;
//             req.session.name = foundUser.name;
//             req.session.userId = foundUser._id;
//             console.log("here's the user: ", req.session.email);
//             res.send({
//                 status: 200,
//                 data: foundUser   
//             })
//             console.log("done logged in")
//         }
//     } else {
//         res.send({
//             status: 404,
//             message: "No cookie found"
//         })
//     }
// })


// Routing
app.use("/contact", contactController);
app.use("/auth", authController);
app.use("/user", requireLogin, userController);


const port = process.env.PORT || "3000"
app.listen(port, () => {
    console.log(`LIVE @ ${port}`);
})