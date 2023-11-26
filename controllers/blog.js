const asyncHandler = require("express-async-handler")
const Blog = require("../models/blog");

const createBlog = asyncHandler(async (req, res) => {
    const { title, description, category } = req.body
    if (!title || !description || !category) {
        throw new Error("thiếu thông tin,vui lòng nhập đầy đủ thông tin!")
    } else {
        const response = await Blog.create(req.body);
        return res.status(200).json({
            success: response ? true : false,
            data: response ? response : "Tạo thất bại!",
        })
    }
})
const updatedBlog = asyncHandler(async (req, res) => {
    const { bid } = req.params
    if (Object.keys(req.body).length === 0) throw new Error("thiếu thông tin,vui lòng nhập đầy đủ thông tin!")
    else {
        const response = await Blog.findByIdAndUpdate(bid, req.body, { new: true });
        return res.status(200).json({
            success: response ? true : false,
            data: response ? response : "Sửa thất bại!",
        })
    }
})
const getBlogs = asyncHandler(async (req, res) => {
    const response = await Blog.find()
    return res.status(200).json({
        success: response ? true : false,
        data: response ? response : "xảy ra một lỗi!",
    })
})
//like
const likeBlog = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { bid } = req.params
    const blog = await Blog.findById(bid)
    const alreadyDisliked = blog?.dislikes?.find(el => el.toString() === _id)
    if (alreadyDisliked) {
        const response = await Blog.findByIdAndUpdate(bid, { $pull: { dislikes: _id } }, { new: true })
        return res.status(200).json({
            success: response ? true : false,
            data: response
        })
    }
    const isLiked = blog?.likes?.find(el => el.toString() === _id)
    if (isLiked) {
        const response = await Blog.findByIdAndUpdate(bid, { $pull: { likes: _id } }, { new: true })
        return res.status(200).json({
            success: response ? true : false,
            data: response
        })
    } else {
        const response = await Blog.findByIdAndUpdate(bid, { $push: { likes: _id } }, { new: true })
        return res.status(200).json({
            success: response ? true : false,
            data: response
        })
    }
})
//dislike
const disLikeBlog = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { bid } = req.params
    if (!bid) throw new Error("không có bài viết nào!")
    const blog = await Blog.findById(bid)
    const alreadyLiked = blog?.likes?.find(el => el.toString() === _id)
    if (alreadyLiked) {
        const response = await Blog.findByIdAndUpdate(bid, { $pull: { likes: _id } }, { new: true })
        return res.status(200).json({
            success: response ? true : false,
            data: response
        })
    }
    const isDisliked = blog?.dislikes?.find(el => el.toString() === _id)
    if (isDisliked) {
        const response = await Blog.findByIdAndUpdate(bid, { $pull: { dislikes: _id } }, { new: true })
        return res.status(200).json({
            success: response ? true : false,
            data: response
        })
    } else {
        const response = await Blog.findByIdAndUpdate(bid, { $push: { dislikes: _id } }, { new: true })
        return res.status(200).json({
            success: response ? true : false,
            data: response
        })
    }
})
const getBlog = asyncHandler(async (req, res) => {
    const { bid } = req.params
    const blog = await Blog.findByIdAndUpdate(bid, { $inc: { numberViews: 1 } }, { new: true })
        .populate('likes', "firstname lastname")
        .populate('dislikes', "firstname lastname")
    return res.status(200).json({
        success: blog ? true : false,
        data: blog
    })
})
const deleteBlog = asyncHandler(async (req, res) => {
    const { bid } = req.params
    const response = await Blog.findByIdAndDelete(bid)
    return res.status(200).json({
        success: response ? true : false,
        data: response ? `đã xóa ${response.title}` : "xảy ra lỗi trong quá trình xóa"
    })
})
const uploadImageBlog = asyncHandler(async (req, res) => {
    const { bid } = req.params
    if (!req.file) throw new Error("thiếu thông tin")
    const response = await Blog.findByIdAndUpdate(bid, { image: req.file.path }, { new: true })
    return res.json({
        status: response ? true : false,
        uploadBlog: response ? response : 'thất bại'
    })
})
module.exports = {
    createBlog,
    updatedBlog,
    getBlogs,
    likeBlog,
    disLikeBlog,
    getBlog,
    deleteBlog,
    uploadImageBlog,
}