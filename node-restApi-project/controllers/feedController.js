exports.getPosts = (req, res, next) => {
  return res.status(200).json({ message: "welcome to node rest api project" });
};

exports.createPost = (req, res, next) => {
  return res.json(req.body);
  const title = req.body.title;
  const content = req.body.content;
  res.status(200).json({
    message: "post created successfully",
    posts: [{ title: title, content: content }],
  });
};
