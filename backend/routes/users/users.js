const express = require("express"),
  router = express.Router(),
  bcrypt = require("bcryptjs"),
  jwt = require("jsonwebtoken"),
  passport = require("passport"),
  isEmpty = require("../../helpers/is-empty"),
  keys = require("../../config/keys"),
  User = require("../../models/User"),
  Post = require("../../models/Post"),
  validateRegisterInput = require("../../helpers/validateRegister");

router.get("/", async (req, res) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch (err) {
    console.log(err);
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      return res.json(user);
    } else {
      return res.json("This User Not Found!");
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/register", async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check Validation
  if (!isValid) {
    return res.status(404).send(errors);
  }
  const { name, email, password, password2 } = req.body;
  try {
    const newUser = await new User({
      name,
      email,
      password,
      password2
    });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then(user =>
            res.json({ user: user, message: "Registration SuccessFully!" })
          )
          .catch(err => console.log(err));
      });
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send("User Not Found!");
    }
    const passMatch = await bcrypt.compare(password, user.password);
    if (passMatch) {
      // User Matched
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email
      };

      jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
        res.json({
          success: true,
          token: "Bearer " + token
        });
      });
    } else {
      return res.status(401).send("Email or password doesn't match!");
    }
  } catch (err) {
    console.log(err);
  }
});

router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (user) {
      if (!isEmpty(user.posts)) {
        console.log(user.posts);
        user.posts.forEach(post => {
          Post.findByIdAndRemove(post, (err, p) => {
            if (err) return res.status(500).send(err);
          });
        });

        User.findByIdAndRemove(id, (err, user) => {
          if (err) return res.status(500).send(err);

          const response = {
            message: "User successfully deleted",
            id: user._id
          };
          return res.status(200).send(response);
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
});

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
