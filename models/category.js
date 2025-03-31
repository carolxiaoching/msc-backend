const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "請輸入分類名稱"],
    },
    categoryImgUrl: {
      type: String,
      default: "",
      required: [true, "請輸入分類圖片網址"],
    },
  },
  {
    // 不顯示預設在 document 中加上的 __v: 0
    versionKey: false,
    // 自動建立 createdAt、updatedAt
    timestamps: true,
  }
);

const Category = new mongoose.model("category", categorySchema);

module.exports = Category;
