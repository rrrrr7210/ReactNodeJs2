const express = require("express"),
  mongoose = require("mongoose"),
  app = express(),
  db = require("./config/keys").mongoURI,
  port = process.env.PORT || 5000,
  path = require("path"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  // Routes
  homeRoute = require("./routes/home"),
  postsRoute = require("./routes/posts/posts"),
  usersRoute = require("./routes/users/users");

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport Config
require("./config/passport")(passport);

// Routes
app.use("/home", homeRoute);
app.use("/users", usersRoute);
app.use("/posts", postsRoute);

// Server
app.listen(port, () => console.log(`Server running on port ${port}`));
