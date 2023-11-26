const ProductController = require("../controllers/productCategory")
const router = require("express").Router()
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/create', [verifyAccessToken, isAdmin], ProductController.createCategory)
router.delete('/delete/:pcid', [verifyAccessToken, isAdmin], ProductController.deleteCategory)
router.put('/updated/:pcid', [verifyAccessToken, isAdmin], ProductController.updatedCategory)
router.get('/', ProductController.getCategory)

module.exports = router