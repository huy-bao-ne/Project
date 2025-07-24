const express = require("express");
const router = express.Router();
const { getOne } = require("../controllers/account-controller");

// Route for user login
// This route handles both login and registration based on the request body
// It checks if the user exists and either logs them in or registers a new user.
router.get("/api/v1/auth/accounts", getOne);

module.exports = router;
