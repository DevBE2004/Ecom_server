const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Brand = require("../models/brand");
const Category = require("../models/ProductCategory");
const categoryData = require("../../Data/category.json");
const slugify = require("slugify");
const productData = require("../../Data/Product.json");
const brandData = require("../../Data/brand.json");

const fn = async (product) => {
  await Product.create({
    title: product?.name,
    slug: slugify(product?.name) + Math.round(Math.random() * 100) + " ",
    description: product?.description,
    brand: product?.brand,
    thumb: product?.thumb,
    totalRatings: 0,
    price: Math.round(Number(product?.price?.match(/\d/g).join("") / 100)),
    category: product?.category[1],
    quantity: Math.round(Math.random() * 1000),
    sold: Math.round(Math.random() * 100),
    images: product?.images,
    color: product?.variants[1]?.variants[0] || "BLACK",
  });
};
const insertProducts = asyncHandler(async (req, res) => {
  const promise = [];
  for (let product of productData) promise.push(fn(product));
  await Promise.all(promise);
  return res.json("Done");
});
const fn2 = async (br) => {
  await Category.create({
    brand: br?.brand,
    title: br?.category,
    image: br?.image,
  });
};
const insertBrands = asyncHandler(async (req, res) => {
  const promise = [];
  for (let br of categoryData) promise.push(fn2(br));
  await Promise.all(promise);
  return res.json("Done");
});
module.exports = {
  insertProducts,
  insertBrands,
};
