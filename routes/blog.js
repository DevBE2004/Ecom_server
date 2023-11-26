const blogController = require("../controllers/blog")
const router = require("express").Router()
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require('../config/cloudinary.config')

router.post('/create', [verifyAccessToken, isAdmin], blogController.createBlog)
router.put('/updated/:bid', [verifyAccessToken, isAdmin], blogController.updatedBlog)
router.put('/like/:bid', verifyAccessToken, blogController.likeBlog)
router.put('/uploadimage/:bid',[ verifyAccessToken,isAdmin],uploader.single('image'), blogController.uploadImageBlog)
router.put('/dislike/:bid', verifyAccessToken, blogController.disLikeBlog)
router.get('/one/:bid', blogController.getBlog)
router.delete('/delete/:bid', blogController.deleteBlog)
router.get('/', blogController.getBlogs)

module.exports = router