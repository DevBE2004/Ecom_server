const ProductController = require("../controllers/product");
const router = require("express").Router();
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const uploader = require("../config/cloudinary.config");

router.delete(
  "/delete/:pid",
  [verifyAccessToken, isAdmin],
  ProductController.deleteProduct
);
router.put(
  "/variants/:pid",
  [verifyAccessToken, isAdmin],uploader.fields([
    { name: "thumb", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  ProductController.addVariants
);
router.put(
  "/update/:pid",
  [verifyAccessToken, isAdmin],
  uploader.fields([
    { name: "thumb", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  ProductController.updateProduct
);
router.put("/ratings", [verifyAccessToken], ProductController.ratings);
router.post(
  "/create",
  [verifyAccessToken, isAdmin],
  uploader.fields([
    { name: "thumb", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  ProductController.createProduct
);
router.get("/:pid", ProductController.getProduct);
router.put(
  "/uploadimage/:pid",
  [verifyAccessToken, isAdmin],
  uploader.array("image", 10),
  ProductController.uploadImageProduct
);
router.get("/", ProductController.getProducts);

module.exports = router;
