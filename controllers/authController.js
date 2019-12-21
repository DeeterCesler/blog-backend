const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const withAuth = require("../middleware/authToken");
const secret = "secret $tash";


router.post('/verify', withAuth, async (req, res) => {
    const token = req.headers["authorization"];
    testObj = {message: "test"}
    jwt.verify(token, secret, function(err, decoded) {
        if (err) {
          res.status(401).send('Unauthorized: Invalid token');
        } else {
          req.email = decoded.email;
          res.send({
            status: 200,
            email: decoded
          })
      }
    })
});

router.post('/register', async (req, res) => {
    try{
        const password = req.body.password;
        const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(12));
        // Create an object to put into our database into the User Model
        const userEntry = {};
        userEntry.password = passwordHash;
        userEntry.email = req.body.email.toLowerCase();
        userEntry.name = req.body.name;
        const user = await User.create(userEntry);
        user.save();
        res.send({
            status: 200,
            data: userEntry   
        });
        console.log("done registered");
    } catch(err) {
        console.log(err);
    }
});
  
  
router.post('/login', async (req, res) => {
    const {email, password } = req.body
    //first query the database to see if the user exists
    try {
        const foundUser = await User.findOne({email: req.body.email.toLowerCase()});
        if(foundUser){
            if(bcrypt.compareSync(req.body.password, foundUser.password)){
                const payload = foundUser.email;
                const token = jwt.sign(payload, "secret $tash");
                console.log("here's the user: ", foundUser.email);
                res.send({
                    status: 200,
                    data: foundUser,
                    token: token
                })
                console.log("done logged in")
            } else {
                req.session.message = 'Username or Password is Wrong';
            }
        } else {
                req.session.message = 'Username or Password is Wrong';
        }
    } catch(err) {
        console.log(err);
        res.send(err);
    }
});
  
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err){
            res.send(err);
        } else {
            res.redirect('/')
        }
    });
});
  
  
module.exports = router;