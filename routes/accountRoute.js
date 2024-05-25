// Needed Resources 
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/index");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation');

router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));
// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  );
// Process the login attempt
router.post(
  "/login",
  regValidate.registationRules(),
  // regValidate.checkRegData,
  utilities.handleErrors(accountController.accountLogin)
);
router.get("/", utilities.handleErrors(accountController.buildAccount));
router.get("/logout", accountController.logout);
router.get("/update/:id", utilities.checkLoginStatus, utilities.handleErrors(accountController.buildUpdateAccount));
router.post("/update/:id", utilities.handleErrors(accountController.updateAccount));
router.post("/change-password/:id", utilities.handleErrors(accountController.changePassword));
// Get account update view
router.get('/update', accountController.updateAccount);

// Post account update
router.post('/update', accountController.postUpdateAccount);

// Post password change
router.post('/update/password', accountController.postChangePassword);

module.exports = router;