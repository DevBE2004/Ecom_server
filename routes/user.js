const UserController = require("../controllers/user")
const router = require("express").Router()
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require("../config/cloudinary.config");

router.post("/login", UserController.login)
router.post("/register", UserController.register)
router.post("/finalregister/:token", UserController.finalregister)
router.get('/current', verifyAccessToken, UserController.getCurrent)
router.post('/forgotpassword', UserController.forgotPassword)
router.post('/refreshtoken', UserController.refreshTokenAccessToken)
router.get('/logout', UserController.logout)
router.delete('/remove-cart/:pid/:color',verifyAccessToken,UserController.removeProductInCart)
router.get('/forgot-password', UserController.forgotPassword)
router.put('/resetpassword', UserController.resetPassword)
router.put('/updateuser', verifyAccessToken, uploader.single('avatar'),UserController.updateUser)
router.put('/address', [verifyAccessToken], UserController.updateAddressUser)
router.put('/cart', [verifyAccessToken], UserController.updateCart)
router.delete('/deleteuser/:userid', [verifyAccessToken, isAdmin], UserController.deleteUser)
router.get('/', [verifyAccessToken, isAdmin], UserController.getUsers)
router.post('/createuser',[verifyAccessToken, isAdmin],UserController.createUserByAdmin)
router.put('/wishlist/:pid',[verifyAccessToken],UserController.updateWishList)
router.put('/:userid',[verifyAccessToken, isAdmin],UserController.updateUserByAdmin)
router.put('/admin/:userid', [verifyAccessToken, isAdmin], UserController.updateUserByAdmin)


module.exports = router