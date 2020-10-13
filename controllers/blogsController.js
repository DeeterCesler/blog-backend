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


router.get("/email", async (req, res) => {
  console.log("IT HIT HERE AT LEAST!")
  const allblogs = await blog.find({user: "deeter.cesler@gmail.com"});
  console.log("blogs: ", allblogs);
  res.json({
      status: 200,
      message: "Incoming blogs",
      data: allblogs
  })
});

router.post("/new", checkForToken, async (req, res) => {
  var submittedblog = req.body;
  const dog = await withAuth(req, res)
  submittedblog["user"] = req.email;
  if(submittedblog["blogPath"][0] === "/"){
    submittedblog["blogPath"] = submittedblog["blogPath"].slice(1);
  }
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

router.get("/:path", async (req, res) => {
  console.log("PATH GOT HIT")
  const foundBlog = await blog.findOne({blogPath: req.params.path});
  if(foundBlog === undefined) {
    console.log("IF GOT HIT")
    res.json({
      status: 404,
      message: "Blog doesn't exist",
      data: {
        blogName: "NA",
        blogSummary: "NA",
        body: "NA"
      }
    })
  } else {
    console.log("ELSE GOT HIT")
    res.header(
      {"Access-Control-Allow-Origin": "*"}
    )
    res.json({
        status: 200,
        message: "Found blog",
        data: foundBlog
    })
  }
});

router.put("/:id/edit", checkForToken, async (req, res) => {
  console.log(req.body)
  var submittedblog = req.body;
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

router.delete("/:name", async (req, res) => {
  const deletedItem = await blog.findOne({blogName: req.params.name});
  deletedItem.delete();
  res.json({
      status: 200,
      message: "blog deleted",
      data: deletedItem
  })
})

module.exports = router;