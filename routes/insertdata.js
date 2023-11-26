const insertController = require("../controllers/insertData")
const router = require("express").Router()

router.post('/', insertController.insertProducts)
router.post('/brand', insertController.insertBrands)

module.exports = router