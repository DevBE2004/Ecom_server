const User = require("../models/User");
const { users } = require("../utils/contant");
const asyncHandler = require("express-async-handler");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/jwt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendMail");
const crypto = require("crypto");
const makeToke = require("uniqid");

// const register = asyncHandler(async (req, res) => {
//   const { email, password, firstname, lastname } = req.body;
//   if (!email || !password || !firstname || !lastname) {
//     return res.status(400).json({
//       success: false,
//       message: "vui lòng nhập đầy đủ thông tin",
//     });
//   }
//   const user = await User.findOne({ email });
//   if (user) {
//     throw new Error(`User đã tồn tại`)
//   }
//   else {
//     const newUser = await User.create(req.body)
//     return res.status(200).json({
//       success: newUser ? 'tạo tài khoản thành công!' : 'tạo tài khoản thất bại'
//     })
//   }
// });

const register = asyncHandler(async (req, res) => {
  const { email, firstname, lastname, password, mobile } = req.body;
  if (!email || !password || !firstname || !lastname || !mobile)
    return res
      .status(400)
      .json({ success: false, message: "vui lòng nhập đầy đủ thông tin" });
  const token = makeToke();
  res.cookie(
    "dataregister",
    { ...req.body, token },
    { maxAge: 15 * 60 * 1000, httpOnly: true }
  );
  const user = await User.findOne({ email });
  const emailEdited = btoa(email) + "@" + token;
  if (user) {
    throw new Error(`User đã tồn tại`);
  } else {
    const newUser = await User.create({
      email: emailEdited,
      password,
      firstname,
      lastname,
      mobile,
    });
    if (newUser) {
      const html = `<h2>Mã đăng kí</h2><br/><blockquote>${token}</blockquote>`;
      await sendEmail({ email, html, subject: "Xác nhận đăng kí tài khoản!" });
    }
    setTimeout(async () => {
      await User.deleteOne({ email: emailEdited });
    }, [5 * 60 * 1000]);
    return res.status(200).json({
      success: newUser ? true : false,
      message: newUser
        ? "kiểm tra email của bạn"
        : "Đã xảy ra một lỗi trong quá trình tạo tài khoản, vui lòng thử lại",
    });
  }
});
const finalregister = asyncHandler(async (req, res) => {
  // const cookie = req.cookies;
  const { token } = req.params;
  const notActiveEmail = await User?.findOne({
    email: new RegExp(`${token}$`),
  });
  if (notActiveEmail) {
    notActiveEmail.email = atob(notActiveEmail?.email?.split("@")[0]);
    notActiveEmail.save();
  }
  return res.status(200).json({
    success: notActiveEmail ? true : false,
    message: notActiveEmail
      ? "tạo tài khoản thành công"
      : "xảy ra 1 lỗi trong quá trình thực hiện",
  });
  // const newUser = await User.create({
  //   email: cookie?.dataregister?.email,
  //   password: cookie?.dataregister?.password,
  //   mobile: cookie?.dataregister?.mobile,
  //   firstname: cookie?.dataregister?.firstname,
  //   lastname: cookie?.dataregister?.lastname,
  // });
  // res.clearCookie("dataregister");
  // if (newUser) res.redirect(`${process.env.CLIENT_URL}/finalregister/success`);
  // else return res.redirect(`${process.env.CLIENT_URL}/finalregister/failed`);
});

//rftoken => cấp mới 1 accesstoken
//accessToken => xác thực người dùng,phân quyền người dùng
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "tài khoản hoặc mật khẩu sai!",
    });
  }
  //plain object
  const response = await User.findOne({ email });
  if (response && (await response.isCorrectPassword(password))) {
    // tách passwords và role ra khỏi response
    const { password, role, refreshToken, ...userData } = response.toObject();
    // tạo accesstoken
    const accessToken = generateAccessToken(response._id, role);
    // tạo refreshToken
    const newrefreshToken = generateRefreshToken(response._id);
    // lưu refreshToken vào db
    await User.findByIdAndUpdate(
      response._id,
      { refreshToken: newrefreshToken },
      { new: true }
    );
    //lưu rftoken vào cookie
    res.cookie("refreshToken", newrefreshToken, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    });
    return res.status(200).json({
      success: true,
      message: "đăng nhập thành công",
      accessToken,
      userData,
    });
  } else {
    throw new Error("tài khoản hoặc mật khẩu sai!");
  }
});
const getCurrent = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const user = await User.findById(_id)
    .select("-refreshToken -password")
    .populate({
      path: "cart",
      populate: {
        path: "product",
        select: "title thumb price",
      },
    }).populate('wishlist',"title thumb price color");
  return res.status(200).json({
    success: user ? true : false,
    rs: user ? user : "không có người dùng",
  });
});

const refreshTokenAccessToken = asyncHandler(async (req, res) => {
  //lấy rftoken từ cookies
  const cookie = req.cookies;
  // check xem có token hay k
  if (!cookie && !cookie.refreshToken) {
    throw new Error("không có refreshtokn trong cookie");
  }
  // token có còn hạn không
  const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET);
  const responese = await User.findById({
    _id: rs._id,
    refreshToken: cookie.refreshToken,
  });
  return res.status(200).json({
    success: responese ? true : false,
    newAccessToken: responese
      ? generateAccessToken(responese._id, responese.role)
      : "refeshtoken không khớp với dữ liệu",
  });
});
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie || !cookie.refreshToken)
    throw new Error("không có refresh token");
  // Xóa rftoken ở Db
  await User.findOneAndUpdate(
    { refreshToken: cookie.refreshToken },
    { refreshToken: "" },
    { new: true }
  );
  // Xóa rftoken ở cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  return res.status(200).json({
    success: true,
    mes: "đã đăng xuất",
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new Error("không được để trống email");
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email không tồn tại");
  const resetToken = user.createPasswordChangeToken();
  await user.save();

  const html = `xin vui lòng nhấp vào đây để đổi mật khẩu của bạn.link sẽ hết hạn sau 15p <a href=${process.env.CLIENT_URL}/reset-password/${resetToken}>nhấp vào đây</>`;
  const data = {
    email: email,
    html,
    subject: "forgot password",
  };
  const rs = await sendEmail(data);
  return res.status(200).json({
    success: rs.response?.includes("OK") ? true : false,
    message: rs.response?.includes("OK")
      ? "Hãy checkmail của bạn."
      : "Gửi thất bại vui lòng kiểm tra lại",
  });
});
const resetPassword = asyncHandler(async (req, res) => {
  const { password, token } = req.body;
  if (!password || !token) {
    throw new Error("thiếu dữ liệu");
  }
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  }); //tìm password và tg lớn hơn tg hiện tại

  if (!user) {
    throw new Error("token reset không hợp lệ");
  }
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordChangedAt = Date.now();
  user.passwordResetExpires = undefined;
  user.save();
  return res.status(200).json({
    success: user ? true : false,
    message: user ? "đổi mật khẩu thành công!" : "Đã xảy ra sự cố",
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  // Tách các trường đặc biệt ra khỏi query
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((element) => delete queries[element]);
  // Format lại các operators cho đúng cú pháp của mongoose
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (matchedElement) => `$${matchedElement}`
  );
  const formattedQueries = JSON.parse(queryString);
  // Filtering
  if (queries?.name) {
    formattedQueries.name = {
      $regex: queries.name,
      $options: "i", // Không phân biệt hoa thường
    };
  }
  if (req?.query?.q) {
    delete formattedQueries.q;
    formattedQueries["$or"] = [
      { firstname: { $regex: req?.query?.q, $options: "i" } },
      { lastname: { $regex: req?.query?.q, $options: "i" } },
      { email: { $regex: req?.query?.q, $options: "i" } },
    ];
  }
  let query = User.find(formattedQueries);
  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  }
  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  }

  // Pagination
  const page = +req.query.page || 1; // Số trang
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS; // Số lượng bản ghi trong trang
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  // Execute query
  const userDatas = await query.exec();
  const counts = await User.countDocuments(formattedQueries);

  return res.status(200).json({
    success: userDatas.length > 0,
    counts,
    userDatas: userDatas.length > 0 ? userDatas : "Không tìm thấy người dùng!",
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userid } = req.params;
  const responese = await User.findByIdAndDelete(userid);
  return res.status(200).json({
    success: responese ? true : false,
    message: responese
      ? `Đã xóa người dùng có email là ${responese.email}!`
      : "xóa người dùng thất bại!",
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { firstname, lastname, email, mobile, address } = req.body;
  const data = { firstname, lastname, email, mobile, address };
  if (req.file) data.avatar = req.file.path;
  if (!_id || Object.keys(req.body).length === 0)
    throw new Error("người dùng không tồn tại!");
  const responese = await User.findByIdAndUpdate(_id, data, {
    new: true,
  }).select("-password -role -refeshToken");
  return res.status(200).json({
    success: responese ? true : false,
    message: responese ? "Thành công" : "sửa thông tin thất bại!",
  });
});
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { userid } = req.params;
  if (Object.keys(req.body).length === 0)
    throw new Error("người dùng không tồn tại!");
  const responese = await User.findByIdAndUpdate(userid, req.body, {
    new: true,
  }).select("-password -role -refeshToken");
  return res.status(200).json({
    success: responese ? true : false,
    message: responese ? "updated" : "sửa thông tin thất bại!",
  });
});
const updateAddressUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  if (!req.body.address) throw new Error("không thể thiếu địa chỉ!");
  const responese = await User.findByIdAndUpdate(
    _id,
    { $push: { address: req.body.address } },
    { new: true }
  ).select("-refreshToken -password -role");
  return res.status(200).json({
    success: responese ? true : false,
    data: responese ? responese : "thất bại !",
  });
});

const updateCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { pid, color, quantity = 1, price, thumbnail, title } = req.body;
  if (!pid || !color) throw new Error("Thiếu thông tin truyền vào!");
  const user = await User.findById(_id).select("cart");
  const alreadyProduct = user.cart.find(
    (el) => el.product.toString() === pid && el.color === color
  );
  if (alreadyProduct) {
    const response = await User.updateOne(
      { cart: { elemMath: alreadyProduct } },
      {
        $set: {
          "cart.$.quantity": quantity,
          "cart.$.color": color,
          "cart.$.price": price,
          "cart.$.thumbnail": thumbnail,
          "cart.$.title": title,
        },
      },
      { new: true }
    );
    return res.status(200).json({
      success: response ? true : false,
      message: response ? "thành công" : "Thất bại!",
    });
  } else {
    const response = await User.findByIdAndUpdate(
      _id,
      {
        $push: {
          cart: { product: pid, quantity, color, price, thumbnail, title },
        },
      },
      { new: true }
    );
    return res.status(200).json({
      success: response ? true : false,
      message: response ? "thành công" : "Thất bại!",
    });
  }
});
const removeProductInCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { pid, color } = req.params;
  if (!pid) {
    throw new Error("Thiếu thông tin truyền vào!");
  }
  const user = await User.findById(_id).select("cart");
  const alreadyProduct = user.cart.find(
    (el) => el.product.toString() === pid && el.color === color
  );
  if (!alreadyProduct) {
    return res.status(200).json({
      success: true,
      message: "xóa thành công",
    });
  }
  const response = await User.findByIdAndUpdate(
    _id,
    { $pull: { cart: { product: pid, color } } },
    { new: true }
  );
});
const createUserByAdmin = asyncHandler(async (req, res) => {
  const response = await User.create(users);
  return res.status(200).json({
    success: response ? true : false,
    message: response ? "Thành công" : "Thất bại!",
  });
});
const updateWishList = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const { _id } = req.user;
  const user = await User.findById(_id)
  const alreadyWishlist = user.wishlist?.find((el) => el.toString() === pid);
  if(alreadyWishlist){
    const response = await User.findByIdAndUpdate(_id, { $pull: { wishlist: pid } }, { new: true })
        return res.status(200).json({
            success: response ? true : false,
            message: response ? "updated your wishlist":"failed"
        })
  }else{
    const response = await User.findByIdAndUpdate(_id, { $push: { wishlist: pid } }, { new: true })
        return res.status(200).json({
            success: response ? true : false,
            message: response ? "updated your wishlist":"failed"
        })
  }
});

module.exports = {
  updateWishList,
  register,
  login,
  getCurrent,
  refreshTokenAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  getUsers,
  deleteUser,
  updateUser,
  updateUserByAdmin,
  updateAddressUser,
  updateCart,
  finalregister,
  createUserByAdmin,
  removeProductInCart,
};
