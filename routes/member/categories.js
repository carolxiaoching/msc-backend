const express = require("express");
const router = express.Router();
const CategoryControllers = require("../../controllers/member/categories");
const errorAsyncHandler = require("../../services/errorAsyncHandler");

// 取得全部分類
router.get(
  "/categories",
  /**
    * #swagger.tags = ["Category 分類"]
    * #swagger.path = "/api/categories"
    * #swagger.method = "get"
    * #swagger.summary = "取得全部分類"
    * #swagger.description = "取得全部分類"
    * #swagger.parameters["categoryId"] = {
      in: "path",
      type: "string",
      required: true,
      description: "分類 ID",
    }
    * #swagger.parameters["query"] = [
      {
        in: "query",
        name: "sort",
        type: "string",
        description: "依更新日期排序 asc 舊到新，desc 新到舊，預設為 desc"
      }
    ]
    * #swagger.responses[200] = {
      description: "回傳成功",
      schema: {
        "status": "success",
        "data": [
          {
            "title": "日韓料理",
            "_id": "66b62acd7d1468039fc925e8",
            "categoryImgUrl": "https://123.jpg",
          },
        ]
      }
    }
  */
  errorAsyncHandler(CategoryControllers.getAllCategories)
);

// 取得指定分類
router.get(
  "/category/:categoryId",
  /**
    * #swagger.tags = ["Category 分類"]
    * #swagger.summary = "取得指定分類"
    * #swagger.description = "取得指定分類"
    * #swagger.parameters["categoryId"] = {
      in: "path",
      type: "string",
      required: true,
      description: "分類 ID",
    }
    * #swagger.responses[200] = {
      description: "回傳成功",
      schema: {
        "status": "success",
        "data": {
          "title": "日韓料理",
          "_id": "66b62acd7d1468039fc925e8",
          "categoryImgUrl": "https://123.jpg",
        }
      }
    }
  */
  errorAsyncHandler(CategoryControllers.getCategory)
);

module.exports = router;
