const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = '<ul>'
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
  }

  Util.buildVehicleGrid = async function(data) {
    let grid = ''
    if(data.length > 0) {
      grid += '<ul id="vehicle-display">'
      data.forEach(vehicle => {
        grid += '<li>'
        grid += '<div class="vehicle-info">'
        grid += '<h2>' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h2>'
        grid += '<p><strong>Mileage:</strong> ' + vehicle.inv_miles + '</p>'
        grid += '<p><strong>Price:</strong> $' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</p>'
        grid += '<p><strong>Description:</strong> ' + vehicle.inv_description + '</p>'
        grid += '<p><strong>Color:</strong> ' + vehicle.inv_color + '</p>'
        grid += '</div>'
        grid += '<div class="vehicle-image">'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
        grid += '<img src="' + vehicle.inv_image + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' on CSE Motors" />'
        grid += '</a>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else {
      grid += '<p class="notice">Sorry, vehicle could not be found</p>'
    }
    return grid
  }
  

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
* Middleware to check token validity
**************************************** */
/* Middleware to check token validity and set login status */
Util.checkLoginStatus = (req, res, next) => {
  if (req.cookies && req.cookies.jwt) {
    jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT verification error:", err);
        res.locals.loggedInUser = null;
        res.clearCookie("jwt");
        req.flash("Please log in");
        return res.redirect("/account/login");
      } else {
        res.locals.loggedInUser = decoded;
        res.locals.loggedin = true;
        next();
      }
    });
  } else {
    res.locals.loggedInUser = null;
    res.locals.loggedin = false;
    next();
  }
};

/* Middleware to check if user is Employee or Admin */
Util.checkAdminOrEmployee = (req, res, next) => {
  if (req.cookies && req.cookies.jwt) {
    jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err || (decoded.account_type !== 'Employee' && decoded.account_type !== 'Admin')) {
        res.locals.loggedInUser = null;
        res.clearCookie("jwt");
        req.flash("notice", "You do not have permission to access this resource.");
        return res.redirect("/account/login");
      } else {
        res.locals.loggedInUser = decoded;
        res.locals.loggedin = true;
        next();
      }
    });
  } else {
    res.locals.loggedInUser = null;
    res.locals.loggedin = false;
    req.flash("notice", "This must NOT be used when delivering the classification or detail views as they are meant for site visitors who may not be logged in.");
    return res.redirect("/account/login");
  }
};

module.exports = Util