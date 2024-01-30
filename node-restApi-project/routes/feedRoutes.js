const express = require("express");
const feedController = require("../controllers/feedController");

const router = express.Router();

router.get("/posts", feedController.getPosts);
router.post("/post", feedController.createPost);
module.exports = router;
