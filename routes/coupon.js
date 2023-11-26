const router = require('express').Router()
const couponController = require('../controllers/coupon')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post("/create", [verifyAccessToken, isAdmin], couponController.createCoupon)
router.delete("/delete/:cpid", [verifyAccessToken, isAdmin], couponController.deleteCoupon)
router.put("/update/:cpid", [verifyAccessToken, isAdmin], couponController.updatedCoupon)
router.get("/", couponController.getCoupon)


module.exports = router 