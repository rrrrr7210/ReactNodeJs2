const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = validateRegisterInput = data => {
  let errors = {};

  if (!validator.isEmail(data.email)) {
    errors.email = "Invalid Email!";
  }
  if (!validator.isLength(data.name, { min: 5, max: 140 })) {
    errors.name = "Name must be between 5 and 140 characters!";
  }
  if (!validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be between 6 and 30 characters!";
  }
  if (!validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords don't matches";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
