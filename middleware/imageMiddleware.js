const path = require("path");
const multer = require("multer");

// 上傳圖片 middleware
const imageMiddleware = multer({
  limits: {
    // 大小限制: 1MB
    fileSize: 1 * 1024 * 1024,
  },
  // 篩選資料
  fileFilter(req, file, cb) {
    // 利用 path 取得檔案副檔名，並轉成小寫
    const ext = path.extname(file.originalname).toLowerCase();
    // 僅限 jpg、png、jpeg、webp 格式
    if (ext != ".jpg" && ext != ".png" && ext != ".jpeg" && ext != ".webp") {
      cb(new Error("檔案格式僅限為 .jpg、.png、.jpeg、.webp"));
    }
    cb(null, true);
  },
  // 可傳多個圖檔
}).any();

module.exports = imageMiddleware;
