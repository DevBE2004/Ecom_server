const asyncHandler = require("express-async-handler");
const Order = require("../models/order");
const User = require("../models/User");
const Coupon = require("../models/coupon");
const { response } = require("express");

const createOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { products, total, address, status } = req.body;
  if (address) {
    await User.findByIdAndUpdate(_id, { address, cart: [] });
  }
  const data = { products, total, orderBy: _id };
  if (status) data.status = status;
  const rs = await Order.create(data)
  return res.status(200).json({
    success: rs ? true : false,
    data: rs ? rs : "Tạo thất bại!",
  });
});
const updateStatus = asyncHandler(async (req, res) => {
  const { oid } = req.params;
  const { status } = req.body;
  if (!status) throw new Error("không có dữ liệu");
  const response = await Order.findByIdAndUpdate(
    oid,
    { status },
    { new: true }
  );
  return res.status(200).json({
    success: response ? true : false,
    data: response ? response : "xảy ra một lỗi!",
  });
});

const getUserOrder = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  const { _id } = req.user;
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((element) => delete queries[element]);
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (matchedElement) => `$${matchedElement}`
  );
  const formattedQueries = JSON.parse(queryString);
  // let colorQueryObject = {};
  // if (queries?.title) {
  //   formattedQueries.title = {
  //     $regex: queries.title,
  //     $options: "i", // Không phân biệt hoa thường
  //   };
  // }
  // if (queries?.category) {
  //   formattedQueries.category = {
  //     $regex: queries.category,
  //     $options: "i",
  //   };
  // }
  // if (queries?.color) {
  //   {
  //     delete formattedQueries.color;
  //     const colorArr = queries?.color?.split(",");
  //     const colorQuery = colorArr.map((el) => ({
  //       color: { $regex: el, $options: "i" },
  //     }));
  //     colorQueryObject = { $or: colorQuery };
  //   }
  // }
  // let queryObject = {};
  // if (queries?.q) {
  //   delete formattedQueries.q;
  //   queryObject = {
  //     $or: [
  //       { category: { $regex: queries?.q, $options: "i" } },
  //       { title: { $regex: queries?.q, $options: "i" } },
  //       { color: { $regex: queries?.q, $options: "i" } },
  //       { brand: { $regex: queries?.q, $options: "i" } },
  //       // { description: { $regex: queries?.q, $options: "i" } },
  //     ],
  //   };
  // }
  const qr = { ...formattedQueries, orderBy: _id };
  let query = Order.find(qr);
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  }
  if (req.query.fields) {
    const fileds = req.query.fields.split(",").join(" ");
    query = query.select(fileds);
  }
  const page = +req.query.page || 1;
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
  const skip = (page - 1) * limit;
  query.skip(skip).limit(limit);
  const order = await query.exec();
  const counts = await Order.countDocuments(qr);

  return res.status(200).json({
    success: order ? true : false,
    counts,
    order: order ? order : "Đã xảy ra một lỗi!",
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((element) => delete queries[element]);
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (matchedElement) => `$${matchedElement}`
  );
  const formattedQueries = JSON.parse(queryString);
  // let colorQueryObject = {};
  // if (queries?.title) {
  //   formattedQueries.title = {
  //     $regex: queries.title,
  //     $options: "i", // Không phân biệt hoa thường
  //   };
  // }
  // if (queries?.category) {
  //   formattedQueries.category = {
  //     $regex: queries.category,
  //     $options: "i",
  //   };
  // }
  // if (queries?.color) {
  //   {
  //     delete formattedQueries.color;
  //     const colorArr = queries?.color?.split(",");
  //     const colorQuery = colorArr.map((el) => ({
  //       color: { $regex: el, $options: "i" },
  //     }));
  //     colorQueryObject = { $or: colorQuery };
  //   }
  // }
  // let queryObject = {};
  // if (queries?.q) {
  //   delete formattedQueries.q;
  //   queryObject = {
  //     $or: [
  //       { category: { $regex: queries?.q, $options: "i" } },
  //       { title: { $regex: queries?.q, $options: "i" } },
  //       { color: { $regex: queries?.q, $options: "i" } },
  //       { brand: { $regex: queries?.q, $options: "i" } },
  //       // { description: { $regex: queries?.q, $options: "i" } },
  //     ],
  //   };
  // }

  const qr = { ...formattedQueries };
  let query = Order.find(qr);
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  }
  if (req.query.fields) {
    const fileds = req.query.fields.split(",").join(" ");
    query = query.select(fileds);
  }
  const page = +req.query.page || 1;
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
  const skip = (page - 1) * limit;
  query.skip(skip).limit(limit);
  const order = await query.exec();
  const counts = await Order.countDocuments(qr);

  return res.status(200).json({
    success: order ? true : false,
    counts,
    order: order ? order : "Đã xảy ra một lỗi!",
  });
});
module.exports = {
  createOrder,
  updateStatus,
  getUserOrder,
  getOrders,
};
