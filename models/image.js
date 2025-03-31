const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, "缺少圖片連結"],
    },
    imagePath: {
      type: String,
      required: [true, "缺少圖片路徑"],
    },
    type: {
      type: String,
      enum: {
        values: ["avatar", "photo", "icon"],
        message: "請輸入圖片類型",
      },
      default: "photo",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
  },
  {
    // 不顯示預設在 document 中加上的 __v: 0
    versionKey: false,
    // 自動建立 createdAt、updatedAt
    timestamps: true,
  }
);

// 當使用 find 開頭的功能時自動加入 user 的資訊
imageSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "nickName avatarImgUrl",
  });
  next();
});

const Image = new mongoose.model("image", imageSchema);

module.exports = Image;
