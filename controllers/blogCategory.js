const asyncHandler = require("express-async-handler")
const blogCategory = require("../models/blogCategory");

const createCategory = asyncHandler(async (req, res) => {
    const response = await blogCategory.create(req.body);
    return res.status(200).json({
        success: response ? true : false,
        data: response ? response : "Tạo thất bại!",
    });
});
const getCategory = asyncHandler(async (req, res) => {
    const response = await blogCategory.find().select('title')
    return res.status(200).json({
        success: response ? true : false,
        category: response ? response : "không có dữ liệu"
    })
})

const updatedCategory = asyncHandler(async (req, res) => {
    const { pcid } = req.params;
    const response = await blogCategory.findByIdAndUpdate(pcid, req.body, { new: true })
    return res.status(200).json({
        success: response ? true : false,
        category: response ? response : "Xảy ra lỗi trong quá trình cập nhật",
    })
})
const deleteCategory = asyncHandler(async (req, res) => {
    const { pcid } = req.params;
    const response = await blogCategory.findByIdAndDelete(pcid)
    return res.status(200).json({
        success: response ? true : false,
        message: response ? `Xóa thành công ${response.title}` : "Xảy ra lỗi trong quá trình xóa!",
    })
})

module.exports = {
    createCategory,
    deleteCategory,
    getCategory,
    updatedCategory,
}