const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  })
}

invCont.buildByInventoryId = async function (req, res, nex) {
  const inventory_id = req.params.inventoryId
  const data = await invModel.getInventoryByInventoryId(inventory_id)
  const grid = await utilities.buildVehicleGrid(data)
  let nav = await utilities.getNav()
  const vehicleName = "Test"
  res.render("./inventory/vehicle", {
    title: vehicleName,
    nav,
    grid,
    errors: null,
  })
}


module.exports = invCont