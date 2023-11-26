const brandController = require("../controllers/brand")
const router = require("express").Router()
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/create', [verifyAccessToken, isAdmin], brandController.createBrand)
router.delete('/delete/:brid', [verifyAccessToken, isAdmin], brandController.deleteBrand)
router.put('/updated/:brid', [verifyAccessToken, isAdmin], brandController.updatedBrand)
router.get('/', brandController.getBrand)

module.exports = router