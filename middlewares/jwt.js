const jwt = require("jsonwebtoken");

const generateAccessToken = (userid, role) => {
    return jwt.sign({ _id: userid, role: role }, process.env.JWT_SECRET, { expiresIn: '1d' })
}
const generateRefreshToken = (userid) => {
    return jwt.sign({ _id: userid }, process.env.JWT_SECRET, { expiresIn: '15m' })
}
module.exports = { generateAccessToken ,generateRefreshToken}