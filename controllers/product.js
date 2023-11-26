const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const createProduct = asyncHandler(async (req, res) => {
  const { title, price, descreiption, brand, category, color } = req.body;

  const thumb = req?.files?.thumb[0]?.path;
  const images = req?.files?.images?.map((el) => el.path);
  if (!title && !price && !descreiption && !brand && !category && !color)
    throw new Error("thiếu thông tin nhập vào");
  req.body.slug = slugify(title);
  if (thumb) req.body.thumb = thumb;
  if (images) req.body.images = images;
  const newProduct = await Product.create({
    ...req.body,
    color: color.toUpperCase(),
  });
  return res.status(200).json({
    success: newProduct ? true : false,
    createdProduct: newProduct
      ? "Đã tạo thành công!"
      : "xảy ra lỗi trong quá trình tạo!",
  });
});
const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const product = await Product.findById(pid).populate({
    path: "ratings",
    populate: {
      path: "postBy",
      select: "firstname lastname avatar",
    },
  });
  return res.status(200).json({
    success: product ? true : false,
    productData: product ? product : "đã xảy ra một lỗi!",
  });
});
const getProducts = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((element) => delete queries[element]);
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (matchedElement) => `$${matchedElement}`
  );
  const formattedQueries = JSON.parse(queryString);
  let colorQueryObject = {};
  if (queries?.title) {
    formattedQueries.title = {
      $regex: queries.title,
      $options: "i", // Không phân biệt hoa thường
    };
  }
  if (queries?.category) {
    formattedQueries.category = {
      $regex: queries.category,
      $options: "i", // Không phân biệt hoa thường
    };
  }
  if (queries?.color) {
    {
      delete formattedQueries.color;
      const colorArr = queries?.color?.split(",");
      const colorQuery = colorArr.map((el) => ({
        color: { $regex: el, $options: "i" },
      }));
      colorQueryObject = { $or: colorQuery };
    }
  }
  let queryObject = {};
  if (queries?.q) {
    delete formattedQueries.q;
    queryObject = {
      $or: [
        { category: { $regex: queries?.q, $options: "i" } },
        { title: { $regex: queries?.q, $options: "i" } },
        { color: { $regex: queries?.q, $options: "i" } },
        { brand: { $regex: queries?.q, $options: "i" } },
        // { description: { $regex: queries?.q, $options: "i" } },
      ],
    };
  }

  const qr = { ...colorQueryObject, ...formattedQueries, ...queryObject };
  let query = Product.find(qr);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  }
  //field limiting
  if (req.query.fields) {
    const fileds = req.query.fields.split(",").join(" ");
    query = query.select(fileds);
  }
  //pagination
  const page = +req.query.page || 1; //só trang
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS; //số lượng bài trong trang
  const skip = (page - 1) * limit;
  query.skip(skip).limit(limit);
  // Execute query
  const productDatas = await query.exec();
  const counts = await Product.countDocuments(qr);

  return res.status(200).json({
    success: productDatas ? true : false,
    counts,
    productDatas: productDatas ? productDatas : "Đã xảy ra một lỗi!",
  });
});
const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const files = req?.files;
  if (files?.thumb) req.body.thumb = files?.thumb[0]?.path;
  if (files?.images) req.body.images = files?.images?.map((el) => el?.path);
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  const updatedproduct = await Product.findByIdAndUpdate(pid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: updatedproduct ? true : false,
    updatedproduct: updatedproduct ? "Updated" : "Đã xảy ra lỗi!",
  });
});
const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  const product = await Product.findByIdAndDelete(pid);
  return res.status(200).json({
    success: product ? true : false,
    message: product
      ? `Đã xóa sản phẩm ${product.title}`
      : "xảy ra lõi trong quá trình xóa",
  });
});
const addVariants = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const { title, price, color } = req.body;
  const thumb = req?.files?.thumb[0]?.path;
  const images = req?.files?.images?.map((el) => el.path);
  if (!title || !price || !color) throw Error("Missing input");
  const response = await Product.findByIdAndUpdate(
    pid,

    { $push: { variants: { color, price, title, thumb, images } } },
    { new: true }
  );
  return res.status(200).json({
    success: response ? true : false,
    message: response ? "Thành công!" : "Thất bại!",
  });
});
const ratings = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, comment, pid, updatedAt } = req.body;
  if (!star || !pid) throw new Error("thiếu dữ liệu");
  let ratingProduct = await Product.findById(pid);
  const alreadyRating = ratingProduct?.ratings?.find(
    (el) => el.postBy.toString() === _id
  );
  if (alreadyRating) {
    // Cập nhật lại rating
    await Product.updateOne(
      { ratings: { $elemMatch: alreadyRating } },
      {
        $set: {
          "ratings.$.star": star,
          "ratings.$.comment": comment,
          "ratings.$.updatedAt": updatedAt,
        },
      },
      { new: true }
    );
  } else {
    // Thêm rating mới
    await Product.findByIdAndUpdate(
      pid,
      { $push: { ratings: { star, comment, postBy: _id, updatedAt } } },
      { new: true }
    );
  }
  //sum rating
  const updatedProduct = await Product.findById(pid);
  const ratingCount = updatedProduct.ratings.length;
  const sumRatings = updatedProduct.ratings.reduce(
    (sum, elm) => sum + elm.star,
    0
  );
  updatedProduct.totalRatings =
    Math.round((sumRatings * 10) / ratingCount) / 10;
  await updatedProduct.save();
  return res.status(200).json({
    status: true,
    updatedProduct,
  });
});
const uploadImageProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  if (!req.files) throw new Error("thiếu thông tin");
  const response = await Product.findByIdAndUpdate(
    pid,
    { $push: { images: { $each: req.files.map((el) => el.path) } } },
    { new: true }
  );
  return res.json({
    success: response ? true : false,
    upload: response ? response : "thất bại",
  });
});
module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  ratings,
  uploadImageProduct,
  addVariants,
};
