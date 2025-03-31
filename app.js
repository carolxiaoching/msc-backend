const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");

const notFound = require("./services/notFound");
const { resErrorAll } = require("./services/errorHandler");

// 前台
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/member/users");
const categoriesRouter = require("./routes/member/categories");
const recipesRouter = require("./routes/member/recipes");
const tagsRouter = require("./routes/member/tags");
const imagesRouter = require("./routes/member/images");
const forgetRouter = require("./routes/member/forget");

// 後台
const memberManageRouter = require("./routes/admin/memberManage");
const imageManageRouter = require("./routes/admin/imageManage");
const categoryManageRouter = require("./routes/admin/categoryManage");
const recipeManageRouter = require("./routes/admin/recipeManage");
const tagManageRouter = require("./routes/admin/tagManage");

const app = express();

// 資料庫連線
require("./connections");

// 補捉程式錯誤
process.on("uncaughtException", (err) => {
  // 記錄錯誤，等服務處理完，停掉該 process
  console.error("Uncaught Exception");
  console.error("錯誤名稱: ", err.name); // 錯誤名稱
  console.error("錯誤訊息: ", err.message); // 錯誤訊息
  console.error("原因:", err.stack); // Node.js 專有
  // 跳出，系統離開
  process.exit(1);
});

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 前台
app.use("/", indexRouter);
app.use("/api", usersRouter);
app.use("/api", imagesRouter);
app.use("/api", categoriesRouter);
app.use("/api", recipesRouter);
app.use("/api", tagsRouter);
app.use("/api", forgetRouter);

// 後台
app.use("/admin", memberManageRouter);
app.use("/admin", imageManageRouter);
app.use("/admin", categoryManageRouter);
app.use("/admin", recipeManageRouter);
app.use("/admin", tagManageRouter);
app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(swaggerFile));

// 404 錯誤
app.use(notFound);

// 錯誤處理
app.use(resErrorAll);

// 補捉未處理的 catch
process.on("unhandledRejection", (err, promise) => {
  console.error("未捕捉到的 Rejection", promise);
  console.error("原因: ", err);
});

module.exports = app;
