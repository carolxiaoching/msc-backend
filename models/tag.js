const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "請輸入標籤名稱"],
    },
  },
  {
    // 不顯示預設在 document 中加上的 __v: 0
    versionKey: false,
    // 自動建立 createdAt、updatedAt
    timestamps: true,
  }
);

const Tag = new mongoose.model("tag", tagSchema);

module.exports = Tag;
