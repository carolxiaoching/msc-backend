const express = require("express");
const router = express.Router();
const ImageControllers = require("../../controllers/member/images");
const imageMiddleware = require("../../middleware/imageMiddleware");
const errorAsyncHandler = require("../../services/errorAsyncHandler");
const {
  checkTokenAndSetAuth,
  getUserFromAuthId,
} = require("../../middleware/authMiddleware");

// 上傳圖片
router.post(
  "/image",
  /**
    * #swagger.tags = ["Image 圖片"]
    * #swagger.summary = "上傳圖片"
    * #swagger.description = "上傳圖片"
    * #swagger.security = [{
      "Bearer": []
    }]
    * #swagger.consumes = ['multipart/form-data']
    * #swagger.parameters["query"] = {
      in: "query",
      name: "type",
      type: "string",
      required: false,
      description: "avatar、photo、icon，預設為 photo"
    }
    * #swagger.parameters["singleFile"] = {
      in: "formData",
      name:'img',
      type: "file",
      required: true,
      description: "圖片",
    }
    * #swagger.responses[200] = {
      description: "回傳成功",
      schema: {
        "status": "success",
        "data": {
          "imageUrl": "https://123.jpg",
          "type": "photo",
          "_id": "66b7a268fc467a804ba21c31",
        }
      }
    }
  */
  checkTokenAndSetAuth,
  getUserFromAuthId,
  imageMiddleware,
  errorAsyncHandler(ImageControllers.uploadImage)
);

// 刪除指定圖片
router.delete(
  "/image/:imageId",
  /**
    * #swagger.tags = ["Image 圖片"]
    * #swagger.summary = "刪除指定圖片"
    * #swagger.description = "刪除指定圖片"
    * #swagger.security = [{
      "Bearer": []
    }]
    * #swagger.parameters["imageId"] = {
      in: "path",
      name: "imageId",
      type: "string",
      description: "圖片 ID"
    }
    * #swagger.responses[200] = {
      description: "回傳成功",
        schema: {
          "status": "success",
          "data": {
            "_id": "66b7a268fc467a804ba21c31",
            "imageUrl": "https://123.jpg",
            "type": "photo",
          }
        }
    }
  */
  checkTokenAndSetAuth,
  errorAsyncHandler(ImageControllers.delImage)
);

module.exports = router;
