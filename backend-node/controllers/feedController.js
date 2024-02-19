const fs = require("fs");
const path = require("path");
const io = require("../socket");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const { validationResult } = require("express-validator");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(200).json({
      message: "posts fetched successfully",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.stausCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
// .catch((err) => next(err));

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "validation failed, entered data is incorrect",
      errors: errors.array(),
    });
  }
  if (!req.file) {
    const error = new Error("file is not provieded.");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: req.userId,
  });
  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      console.log(result);
      io.getIO().emit("posts", { action: "create", post: post });
      res.status(201).json({
        message: "post created successfully",
        post: post,
        creator: { _id: creator._id, name: creator.name },
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("could not find post.");
        error.statusCode = 404;
        throw error;
      }
      res
        .status(200)
        .json({ message: "post fetched successfully", post: post });
    })
    .catch((err) => {
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("file not picked");
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("could not find post.");
        error.statusCode = 404;
        throw error;
      }
      console.log(
        "post creator id: " + post.creator.toString() + "==" + req.userId
      );
      console.log(post.creator.toString() !== req.userId);
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not Authorized");
        error.statusCode = 403;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then((post) => {
      res.status(201).json({ message: "post updated succesfully", post: post });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("post not found");
        error.statusCode = 422;
        throw error;
      }

      //check weahter current user have delete privelge
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not Authorized");
        error.statusCode = 403;
        throw error;
      }
      clearImage(post.imageUrl);
      return Post.findByIdAndDelete(postId);
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "post deleted successfully" });
    })
    .catch((err) => next(err));
};

const clearImage = (filePath) => {
  const filePathToDelete = path.join(__dirname, "..", filePath);
  fs.unlink(filePathToDelete, (err) => console.log(err));
};
