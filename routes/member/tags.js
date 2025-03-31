const express = require("express");
const router = express.Router();
const TagControllers = require("../../controllers/member/tags");
const errorAsyncHandler = require("../../services/errorAsyncHandler");

// 取得全部標籤
router.get(
  "/tags",
  /**
    * #swagger.tags = ["Tag 標籤"]
    * #swagger.summary = "取得全部標籤"
    * #swagger.description = "取得全部標籤"
    * #swagger.parameters["tagId"] = {
      in: "path",
      type: "string",
      required: true,
      description: "標籤 ID",
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
            "title": "素食",
            "_id": "66b62acd7d1468039fc925e8",
          },
        ]
      }
    }
  */
  errorAsyncHandler(TagControllers.getAllTags)
);

// 取得指定標籤
router.get(
  "/tag/:tagId",
  /**
    * #swagger.tags = ["Tag 標籤"]
    * #swagger.summary = "取得指定標籤"
    * #swagger.description = "取得指定標籤"
    * #swagger.parameters["tagId"] = {
      in: "path",
      type: "string",
      required: true,
      description: "標籤 ID",
    }
    * #swagger.responses[200] = {
      description: "回傳成功",
      schema: {
        "status": "success",
        "data": {
          "title": "素食",
          "_id": "66b62acd7d1468039fc925e8",
        }
      }
    }
  */
  errorAsyncHandler(TagControllers.getTag)
);

module.exports = router;
