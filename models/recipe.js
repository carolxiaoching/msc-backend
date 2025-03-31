const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "請輸入食譜標題"],
    },
    coverImgUrl: {
      type: String,
      default: "",
      required: [true, "請輸入封面圖片網址"],
    },
    isPublic: {
      type: Boolean,
      default: false,
      required: [true, "請選擇是否公開"],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "category",
      required: [true, "請輸入食譜分類"],
    },
    tags: {
      type: [mongoose.Schema.ObjectId],
      ref: "tag",
      default: [],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "請輸入食譜建立人"],
    },
    cookingTime: {
      type: String,
      enum: {
        values: ["0-15 分鐘", "15-30 分鐘", "30 分鐘以上", "60 分鐘以上"],
        message: "請輸入指定時間",
      },
      default: "0-15 分鐘",
      required: [true, "請輸入烹飪時間"],
    },
    description: {
      type: String,
      dafault: "",
      required: [true, "請輸入食譜描述"],
    },
    servings: {
      type: Number,
      dafault: 1,
      min: [1, "份量最少為 1 人份"],
      required: [true, "請輸入食譜份量"],
    },
    ingredients: [
      {
        ingredientName: {
          type: String,
          required: [true, "請輸入食材名稱"],
        },
        ingredientQty: {
          type: String,
          required: [true, "請輸入食材份量"],
        },
      },
    ],
    nutritionFacts: {
      calories: {
        type: Number,
        default: 0,
      },
      protein: {
        type: Number,
        default: 0,
      },
      totalFat: {
        type: Number,
        default: 0,
      },
      totalCarb: {
        type: Number,
        default: 0,
      },
      sodium: {
        type: Number,
        default: 0,
      },
      sugar: {
        type: Number,
        default: 0,
      },
    },
    steps: [
      {
        stepOrder: {
          type: Number,
          required: [true, "請輸入步驟順序"],
        },
        stepContent: {
          type: String,
          required: [true, "請輸入步驟內容"],
        },
      },
    ],
    note: {
      type: String,
      default: "",
    },
    collectsCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },
  },
  {
    // 不顯示預設在 document 中加上的 __v: 0
    versionKey: false,
    // 自動建立 createdAt、updatedAt
    timestamps: true,
  }
);

// 當使用 find 開頭的功能時自動加入 user、category 的資訊
recipeSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "nickName avatarImgUrl",
  });
  next();
});

const Recipe = new mongoose.model("recipe", recipeSchema);

module.exports = Recipe;
