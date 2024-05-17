// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/inventoryController")
const Util = require("../utilities/index")

// Route to build inventory by classification view
router.get("/type/:classificationId", Util.handleErrors(invController.buildByClassificationId));
// Route to build inventory by inventory view
router.get("/detail/:inventoryId", Util.handleErrors(invController.buildByInventoryId));

module.exports = router;