const express = require("express");
const router = express.Router();
const blog = require("../models/blog");
const checkForToken = require("../middleware/authToken");
const jwt = require('jsonwebtoken');
const secret = "secret $tash";


withAuth = async (req, res) => {
  const token = req.headers["authorization"];
  if (!token || token === null) {
    res.status(401).send("Unauthorized: No token provided");
  } else {
    await jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token');
      } else {
        req.email = decoded;
      }
    });
  }
}

router.get("/:email", checkForToken, async (req, res) => {
  const allblogs = await blog.find({user: req.params.email});
  // console.log("blogs: ", allblogs);
  res.json({
      status: 200,
      message: "Incoming blogs",
      data: allblogs
  })
});

router.post("/new", checkForToken, async (req, res) => {
  var submittedblog = req.body;
  var today = new Date(); //Today's Date
  projectedDate = async (addedTime) => {
      return new Date(today.getFullYear(),today.getMonth(),today.getDate()+ addedTime);
  }
  submittedblog["stage"] = 1;
  submittedblog["firstReminder"] = await projectedDate(parseInt(submittedblog.firstReminder) * parseInt(submittedblog["firstReminderInterval"]));
  submittedblog["secondReminder"] = await projectedDate(parseInt(submittedblog.secondReminder) * parseInt(submittedblog["secondReminderInterval"]));
  if(submittedblog.thirdReminder){
      submittedblog["thirdReminder"] = await projectedDate(parseInt(submittedblog.thirdReminder) * parseInt(submittedblog["thirdReminderInterval"]));
  }
  if(submittedblog.fourthReminder){
      submittedblog["fourthReminder"] = await projectedDate(parseInt(submittedblog.fourthReminder) * parseInt(submittedblog["fourthReminderInterval"]));
  }
  submittedblog["repeatingReminderRhythm"] = await parseInt(submittedblog.repeatingReminder);
  submittedblog["repeatingReminder"] = await projectedDate(parseInt(submittedblog.repeatingReminder) * parseInt(submittedblog["repeatingReminderRhythm"]));
  const dog = await withAuth(req, res)
  submittedblog["user"] = req.email;
  const newblog = await blog.create(submittedblog);
  newblog.save();
  res.header(
      {"Access-Control-Allow-Origin": "*"}
  )
  res.json({
      status: 200,
      message: "post request successful",
      data: newblog
  });
})

router.put("/:id/edit", checkForToken, async (req, res) => {
  console.log(req.body)
  var submittedblog = req.body;
  var today = new Date(); //Today's Date
  projectedDate = async (addedTime) => {
      return new Date(today.getFullYear(),today.getMonth(),today.getDate()+ addedTime);
  }
  submittedblog["repeatingReminderRhythm"] = await parseInt(submittedblog.repeatingReminderRhythm);
  console.log(submittedblog.repeatingReminderRhythm, " and then ", submittedblog.repeatingReminder)
  submittedblog["repeatingReminder"] = await projectedDate(parseInt(submittedblog["repeatingReminderRhythm"]));
  const checkEmail = await withAuth(req, res)
  submittedblog["user"] = await req.email;
  console.log(await blog.findById(req.params.id), " compared to " , submittedblog);
  const updatedblog = await blog.findByIdAndUpdate(req.params.id,  submittedblog);
  updatedblog.save();
  console.log("updated blog: ", updatedblog);
  res.header(
      {"Access-Control-Allow-Origin": "*"}
  )
  res.json({
      status: 200,
      message: "post request successful",
      data: updatedblog
  });
})

router.delete("/:id", checkForToken, async (req, res) => {
  await blog.findByIdAndDelete(req.params.id);
  res.json({
      status: 200,
      message: "blog deleted"
  })
})

module.exports = router;