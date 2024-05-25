const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  }

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
  
    // Hash the password before storing
    let hashedPassword
    try {
      // regular password and cost (salt is generated automatically)
      hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
      req.flash("notice", 'Sorry, there was an error processing the registration.')
      res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }
  
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }
  }

// Render the account management view
async function buildAccount(req, res) {
  let nav = await utilities.getNav();
  let accountData = res.locals.loggedInUser; // Use the data from middleware
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    accountData,
    errors: null,
  });
}

// Render the update account information view
async function buildUpdateAccount(req, res) {
  let nav = await utilities.getNav();
  let accountData = await accountModel.getAccountById(req.params.id);
  res.render("account/update-account", {
    title: "Update Account Information",
    nav,
    accountData,
    errors: null,
  });
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }

/* ****************************************
*  Logout and clear session
* *************************************** */
async function logout(req, res, next) {
  res.clearCookie('jwt')
  req.session.destroy(() => {
    res.redirect('/')
  })
}

// Handle account information update
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email } = req.body;
  const accountId = req.params.id;

  try {
    await accountModel.updateAccount(accountId, account_firstname, account_lastname, account_email);
    req.flash("message", "Account information updated successfully.");
    res.redirect(`/account/update/${accountId}`);
  } catch (error) {
    req.flash("errors", [{ msg: 'Failed to update account information. Please try again.' }]);
    res.redirect(`/account/update/${accountId}`);
  }
}

// Handle password change
async function changePassword(req, res) {
  let nav = await utilities.getNav();
  const { current_password, new_password, confirm_password } = req.body;
  const accountId = req.params.id;

  if (new_password !== confirm_password) {
    req.flash("errors", [{ msg: 'New passwords do not match. Please try again.' }]);
    return res.redirect(`/account/update/${accountId}`);
  }

  try {
    let accountData = await accountModel.getAccountById(accountId);
    const passwordMatch = await bcrypt.compare(current_password, accountData.account_password);

    if (!passwordMatch) {
      req.flash("errors", [{ msg: 'Current password is incorrect. Please try again.' }]);
      return res.redirect(`/account/update/${accountId}`);
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await accountModel.updatePassword(accountId, hashedPassword);

    req.flash("message", "Password changed successfully.");
    res.redirect(`/account/update/${accountId}`);
  } catch (error) {
    req.flash("errors", [{ msg: 'Failed to change password. Please try again.' }]);
    res.redirect(`/account/update/${accountId}`);
  }
}

async function postUpdateAccount(req, res) {
  // Validate input data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return data to the update view for correction if errors are found
    return res.render('updateAccount', { errors: errors.array() });
  }

  // Update account information in the database
  try {
    await accountModel.updateAccount(req.body);
    // Query the account data from the database after the update is done
    const updatedAccount = await accountModel.getAccountById(req.body.account_id);
    // Deliver the management view with updated account information
    res.render('managementView', { account: updatedAccount, message: 'Account information updated successfully' });
  } catch (err) {
    console.error('Error updating account:', err);
    res.render('updateAccount', { error: 'An error occurred while updating account information' });
  }
}

async function postChangePassword(req, res) {
  // Validate input data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return to the update view for fixing errors
    return res.render('updateAccount', { errors: errors.array() });
  }

  // Handle password change process
  try {
    const { accountId, currentPassword, newPassword } = req.body;
    const isValidPassword = await accountModel.verifyPassword(accountId, currentPassword);
    if (!isValidPassword) {
      return res.render('updateAccount', { error: 'Incorrect current password' });
    }

    // Update password in the database
    await accountModel.updatePassword(accountId, newPassword);
    res.render('managementView', { message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.render('updateAccount', { error: 'An error occurred while changing password' });
  }
}


  
module.exports = { buildLogin, 
                   buildRegister, 
                   registerAccount, 
                   accountLogin, 
                   buildAccount, 
                   logout, 
                   buildUpdateAccount, 
                   updateAccount, 
                   changePassword,
                   postUpdateAccount,
                   postChangePassword
                  }