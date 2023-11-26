const asyncHandler = require("express-async-handler")
const Brand = require("../models/brand");

const createBrand = asyncHandler(async (req, res) => {
    const response = await Brand.create(req.body);
    return res.status(200).json({
        success: response ? true : false,
        data: response ? response : "Tạo thất bại!",
    });
});
const getBrand = asyncHandler(async (req, res) => {
    const response = await Brand.find()
    return res.status(200).json({
        success: response ? true : false,
        Brand: response ? response : "không có dữ liệu"
    })
})

const updatedBrand = asyncHandler(async (req, res) => {
    const { brid } = req.params;
    const response = await Brand.findByIdAndUpdate(brid, req.body, { new: true })
    return res.status(200).json({
        success: response ? true : false,
        Brand: response ? response : "Xảy ra lỗi trong quá trình cập nhật",
    })
})
const deleteBrand = asyncHandler(async (req, res) => {
    const { brid } = req.params;
    const response = await Brand.findByIdAndDelete(brid)
    return res.status(200).json({
        success: response ? true : false,
        message: response ? `Xóa thành công ${response.brand}` : "Xảy ra lỗi trong quá trình xóa!",
    })
})

module.exports = {
    createBrand,
    deleteBrand,
    getBrand,
    updatedBrand,
}