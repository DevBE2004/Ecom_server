const asyncHandler = require("express-async-handler")
const Coupon = require("../models/coupon")

const createCoupon = asyncHandler(async (req, res) => {
    const { name, discount, expiry } = req.body
    if (!name || !discount || !expiry) {
        throw new Error("thiếu thông tin ")

    }
    const response = await Coupon.create({ ...req.body, expiry: Date.now() + expiry * 24 * 60 * 60 * 1000 });
    return res.status(200).json({
        success: response ? true : false,
        data: response ? response : "Tạo thất bại!",
    })


});
const getCoupon = asyncHandler(async (req, res) => {
    const response = await Coupon.find().select('-updatedAt -createdAt')
    return res.status(200).json({
        success: response ? true : false,
        Coupon: response ? response : "không có dữ liệu"
    })
})

const updatedCoupon = asyncHandler(async (req, res) => {
    const { cpid } = req.params;
    if (Object.keys(req.body).length === 0) throw new Error("thiếu thông tin!")
    const response = await Coupon.findByIdAndUpdate(cpid, req.body, { new: true })
    return res.status(200).json({
        success: response ? true : false,
        Coupon: response ? response : "Xảy ra lỗi trong quá trình cập nhật",
    })
})
const deleteCoupon = asyncHandler(async (req, res) => {
    const { cpid } = req.params;
    const response = await Coupon.findByIdAndDelete(cpid)
    return res.status(200).json({
        success: response ? true : false,
        message: response ? `Xóa thành công ${response.title}` : "Xảy ra lỗi trong quá trình xóa!",
    })
})

module.exports = {
    createCoupon,
    deleteCoupon,
    getCoupon,
    updatedCoupon,
}