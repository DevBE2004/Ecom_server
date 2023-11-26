const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
// xác minh mã thông báo
const verifyAccessToken = asyncHandler(async (req, res, next) => {
  // Kiểm tra xem header Authorization có bắt đầu bằng 'Bearer '
  // bearer token
  //headers : { 'Authorization': 'Bearer '
  if (req?.headers?.authorization?.startsWith("Bearer ")) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "token không hợp lệ",
        });
      }
      req.user = decode;
      next();
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "không tìm thấy token",
    });
  }
});
const isAdmin = asyncHandler(async (req, res, next) => {
  const { role } = req.user;
  if (+role !== 1) {
    return res.status(401).json({
      success: false,
      message: "yêu cầu vai trò quản trị viên",
    });
  }
  next();
});

module.exports = {
  verifyAccessToken,
  isAdmin,
};
