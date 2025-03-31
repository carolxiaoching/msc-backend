const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "My Secret Cookbook API",
    description: "我的秘密食譜 API",
  },
  host:
    process.env.NODE_ENV === "production"
      ? "msc-backend.onrender.com"
      : "localhost:3000",
  schemes: ["http", "https"],
  securityDefinitions: {
    Bearer: {
      type: "apiKey",
      in: "headers",
      name: "authorization",
      description: "請加上 JWT Token",
    },
  },
  consumes: ["application/json"],
  "@definitions": {
    Category: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "分類名稱",
          example: "日韓料理",
        },
        categoryImgUrl: {
          type: "string",
          description: "分類圖片",
          example: "https://123.png",
        },
      },
      required: ["title", "categoryImgUrl"],
    },
    Image: {
      type: "object",
      properties: {
        imageUrl: {
          type: "string",
          description: "圖片網址",
          example: "https://123.png",
        },
        imagePath: {
          type: "string",
          description: "圖片路徑",
          example:
            "images/66ad12712a4c0826b5b65f3e/2c531f86-bd6d-4c9c-a7fa-be00b929c137.png",
        },
        type: {
          type: "string",
          description: "圖片類型",
          enum: ["avatar", "photo", "icon"],
          example: "avatar",
          default: "photo",
        },
        user: {
          $ref: "#/definitions/User",
          description: "擁有者",
          example: "66ad12712a4c0826b5b65f3e",
        },
      },
      required: ["type", "user", "imageUrl"],
    },
    User: {
      properties: {
        nickName: {
          type: "string",
          description: "暱稱",
          minLength: 2,
          example: "小花",
        },
        gender: {
          type: "string",
          description: "性別",
          enum: ["secret", "male", "female"],
          example: "secret",
          default: "secret",
        },
        avatarImgUrl: {
          type: "string",
          description: "頭像圖片網址",
          default: "",
          example: "https://123.png",
        },
        description: {
          type: "string",
          description: "自我介紹",
          default: "",
          example: "ˊ這是我的自我介紹",
        },
        email: {
          type: "string",
          format: "email",
          description: "電子郵件",
          example: "flower@mail.com",
        },
        password: {
          type: "password",
          description: "密碼",
        },
        role: {
          type: "string",
          description: "權限",
          enum: ["member", "admin"],
          example: "member",
          default: "member",
        },
        collects: {
          type: "array",
          items: {
            type: "object",
            items: {
              $ref: "#/definitions/Recipe",
              description: "食譜ID",
              example: "66ad17220c1f2d5e934ba5d5",
            },
            default: [],
          },
        },
        recipeCount: {
          type: "number",
          description: "擁有食譜數量",
          minimum: 0,
          default: 0,
        },
        collectCount: {
          type: "number",
          description: "收藏食譜數量",
          minimum: 0,
          default: 0,
        },
      },
      required: ["nickName", "email", "password"],
    },
    Recipe: {
      properties: {
        title: {
          type: "string",
          description: "食譜標題",
          example: "辣炒年糕",
        },
        coverImgUrl: {
          type: "string",
          description: "封面圖片網址",
          example: "https://123.png",
        },
        isPublic: {
          type: "boolean",
          description: "公開狀態",
          default: true,
        },
        category: {
          $ref: "#/definitions/Category",
          description: "分類",
          example: "66ad12712a4c0826b5b65f3e",
        },
        user: {
          $ref: "#/definitions/User",
          description: "建立人",
          example: "66ad12712a4c0826b5b65f3e",
        },
        cookingTime: {
          type: "string",
          description: "烹飪時間",
          enum: ["0-15 分鐘", "15-30 分鐘", "30 分鐘以上", "60 分鐘以上"],
          default: "0-15 分鐘",
          example: "member",
        },
        description: {
          type: "string",
          description: "食譜描述",
          example: "辣炒年糕是一個簡單下飯又好做的食譜",
        },
        servings: {
          type: "number",
          description: "食譜份量",
          minimum: 1,
          default: 1,
        },
        ingredients: {
          type: "array",
          items: {
            type: "object",
            properties: {
              ingredientName: {
                type: "string",
                description: "食材名稱",
                example: "韓式年糕",
              },
              ingredientQty: {
                type: "string",
                description: "食材份量",
                example: "500 克",
              },
            },
          },
        },
        nutritionFacts: {
          type: "object",
          properties: {
            calories: {
              type: "number",
              description: "總卡路里",
              default: 0,
            },
            protein: {
              type: "number",
              description: "蛋白質",
              default: 0,
            },
            totalFat: {
              type: "number",
              description: "總脂肪",
              default: 0,
            },
            totalCarb: {
              type: "number",
              description: "總碳水化合物",
              default: 0,
            },
            sodium: {
              type: "number",
              description: "鈉",
              default: 0,
            },
            sugar: {
              type: "number",
              description: "糖",
              default: 0,
            },
          },
        },
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              stepOrder: {
                type: "number",
                description: "步驟順序",
                example: 1,
              },
              stepContent: {
                type: "string",
                description: "步驟內容",
                example: "鍋子放入辣炒年糕醬",
              },
            },
          },
        },
        note: {
          type: "string",
          description: "小撇步",
          default: "",
        },
        collectsCount: {
          type: "number",
          description: "被收藏次數",
          minimum: 0,
          default: 0,
        },
        isRecommended: {
          type: "boolean",
          description: "編輯推薦",
          default: false,
        },
        tags: {
          type: "array",
          items: {
            $ref: "#/definitions/Tag",
            description: "標籤ID",
            example: "66ad17220c1f2d5e934ba5d5",
          },
          default: [],
        },
      },
      required: [
        "title",
        "coverImgUrl",
        "isPublic",
        "category",
        "user",
        "cookingTime",
        "description",
        "servings",
        "ingredients",
        "nutritionFacts",
        "steps",
      ],
    },
    Tag: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "標籤名稱",
          example: "減肥料理",
        },
      },
      required: ["title"],
    },
  },
};

const outputFile = "./swagger-output.json";

const endpointsFiles = ["./app.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
