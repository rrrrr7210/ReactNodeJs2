const express = require("express"),
  router = express.Router(),
  User = require("../../models/User"),
  passport = require("passport"),
  Post = require("../../models/Post"),
  validator = require("validator");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const posts = await Post.find();
      if (posts) {
        return res.json(posts);
      } else {
        return res.json("There is no posts");
      }
    } catch (err) {
      console.log(err);
    }
  }
);

router.get(
  "/myposts/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { id } = req.params;
    Post.find({ user: id }, (err, posts) => {
      if (err) {
        console.log(err);
      } else {
        res.json(posts);
      }
    });
  }
);

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { title, body, userId } = req.body;
      if (
        !validator.isLength(title, { min: 3, max: 120 }) ||
        !validator.isLength(body, { min: 15, max: 2000 })
      ) {
        return res
          .status(401)
          .send(
            "Title must be between 3 and 120 characters and the body must be between 15 and 2000 characters!"
          );
      } else {
        const user = await User.findById(userId);

        const newPost = await new Post({
          title,
          body,
          user
        });
        await newPost.save();
        const message = "Post created successfully";
        const response = {
          message,
          newpost: newPost
        };
        res.send(response);

        user.posts.push(newPost);
        await user.save();
      }
    } catch (err) {
      console.log(err);
    }
  }
);

router.delete(
  "/delete/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;

      Post.findByIdAndRemove(id, (err, post) => {
        if (err) return res.status(500).send(err);

        const response = {
          post,
          message: "This post deleted successfully!"
        };

        return res.send(response);
      });
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = router;
