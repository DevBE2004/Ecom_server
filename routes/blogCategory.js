const blogCategoryController = require("../controllers/blogCategory")
const router = require("express").Router()
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/create', [verifyAccessToken, isAdmin], blogCategoryController.createCategory)
router.delete('/delete/:pcid', [verifyAccessToken, isAdmin], blogCategoryController.deleteCategory)
router.put('/updated/:pcid', [verifyAccessToken, isAdmin], blogCategoryController.updatedCategory)
router.get('/', blogCategoryController.getCategory)

module.exports = router