const express = require("express");
require("dotenv").config();
const dbConnect = require("./config/dbconnect");
const router = require("./routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["PUT", "GET", "DELETE", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
const port = process.env.PORT || 8888;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dbConnect();

router(app);

app.listen(port, () => {
  console.log("Example app listening on port " + port);
});
