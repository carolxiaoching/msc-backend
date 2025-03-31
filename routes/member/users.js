const express = require("express");
const router = express.Router();
const UserControllers = require("../../controllers/member/users");
const errorAsyncHandler = require("../../services/errorAsyncHandler");
const {
  checkTokenAndSetAuth,
  getUserFromAuthId,
} = require("../../middleware/authMiddleware");

// 註冊
router.post(
  "/user/signUp",
  /**
   * #swagger.tags = ["User 會員"]
   * #swagger.summary = "註冊"
   * #swagger.description = "註冊"
   * #swagger.parameters["body"] = {
      in: "body",
      type: "object",
      required: true,
      description: "資料格式",
      schema: {
        "$nickName": "Carol",
        "$email": "carol@gmail.com",
        "$password": "carol123",
        "$confirmPassword": "carol123"
      }
    }
   * #swagger.responses[200] = {
      description: "回傳成功",
      schema: {
        "status": "success",
        "data": {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYTVhYTI0YWYxOGIyNzI5NmQ0MmE4MiIsImlhdCI6MTY1NTAyNDE2NCwiZXhwIjoxNjU1NjI4OTY0fQ.ylNUe_TfC7rqykZuJZdhOrp_oa4fKXwxniSrNk-SbhI",
          "user": {
            "_id": "62a5aa24af18b27296d42a82",
            "nickName": "Carol",
            "email": "carol@gmail.com",
            "avatarImgUrl": "",
            "description": "",
            "gender": "secret"
          }
        }
      }
    }
  */
  errorAsyncHandler(UserControllers.signUp)
);

// 登入
router.post(
  "/user/signIn",
  /**
   * #swagger.tags = ["User 會員"]
   * #swagger.summary = "登入"
   * #swagger.description = "登入"
   * #swagger.parameters["body"] = {
      in: "body",
      type: "object",
      required: true,
      description: "資料格式",
      schema: {
        "$email": "carol@gmail.com",
        "$password": "carol123",
      }
    }
   * #swagger.responses[200] = {
      description: "回傳成功",
      schema: {
        "status": "success",
        "data": {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYTVhYTI0YWYxOGIyNzI5NmQ0MmE4MiIsImlhdCI6MTY1NTAyNDE2NCwiZXhwIjoxNjU1NjI4OTY0fQ.ylNUe_TfC7rqykZuJZdhOrp_oa4fKXwxniSrNk-SbhI",
          "user": {
            "_id": "62a5aa24af18b27296d42a82",
            "nickName": "Carol",
            "avatarImgUrl": "",
            "description": "",
            "gender": "secret"
          }
        }
      }
    }
  */
  errorAsyncHandler(UserControllers.signIn)
);

// 取得指定會員公開資料
router.get(
  "/user/:userId/profile",
  /**
   * #swagger.tags = ["User 會員"]
   * #swagger.summary = "取得指定會員公開資料"
   * #swagger.description = "取得指定會員公開資料"
   * #swagger.parameters["userId"] = {
      in: "path",
      type: "string",
      required: true,
      description: "會員 ID",
    }
   * #swagger.responses[200] = {
      description: "回傳成功",
      schema: {
        "status": "success",
        "data": {
          "_id": "62a5aa24af18b27296d42a82",
          "nickName": "Carol",
          "avatarImgUrl": "",
          "gender": "secret",
          "description": "",
          "collects": [],
          "recipeCount": 1,
          "collectCount": 0,
          "createdAt": "2025-01-02T17:08:01.747Z",
          "updatedAt": "2025-01-02T17:08:01.747Z"
        }
      }
    }
  */
  errorAsyncHandler(UserControllers.getUserPublicProfile)
);

// 取得我的資料
router.get(
  "/user/profile",
  /**
   * #swagger.tags = ["User 會員"]
   * #swagger.summary = "取得我的資料"
   * #swagger.description = "取得我的資料"
   * #swagger.security = [{
      "Bearer": []
    }]
   * #swagger.responses[200] = {
      description: "回傳成功",
      schema: {
        "status": "success",
        "data": {
          "_id": "66ad12712a4c0826b5b65f55",
          "nickName": "carol",
          "gender": "female",
          "avatarImgUrl": "https://123.jpg",
          "email": "carol@mail.com",
          "createdAt": "2025-01-02T17:08:01.747Z",
          "updatedAt": "2025-03-24T05:25:50.590Z",
          "collects": [
            "66eb7243c9d1a16bd4fc3ac5"
          ],
          "description": "hi",
          "recipeCount": 6,
          "collectCount": 7
        }
      }
    }
  */
  checkTokenAndSetAuth,
  getUserFromAuthId,
  errorAsyncHandler(UserControllers.getMyProfile)
);

// 更新我的資料
router.patch(
  "/user/profile",
  /**
   * #swagger.tags = ["User 會員"]
   * #swagger.summary = "更新我的資料"
   * #swagger.description = "更新我的資料"
   * #swagger.security = [{
      "Bearer": []
    }]
    * #swagger.parameters["body"] = {
      in: "body",
      type: "object",
      required: true,
      description: "資料格式",
      schema: {
        "nickName": "Carol",
      }
    }
   * #swagger.responses[200] = {
      description: "回傳成功",
      schema: {
        "status": "success",
        "data": {
          "_id": "66ad12712a4c0826b5b65f55",
          "nickName": "carol",
          "gender": "female",
          "avatarImgUrl": "https://123.jpg",
          "email": "carol@mail.com",
          "createdAt": "2025-01-02T17:08:01.747Z",
          "updatedAt": "2025-03-24T05:25:50.590Z",
          "collects": [
            "66eb7243c9d1a16bd4fc3ac5"
          ],
          "description": "hi",
          "recipeCount": 6,
          "collectCount": 7
        }
      }
    }
  */
  checkTokenAndSetAuth,
  getUserFromAuthId,
  errorAsyncHandler(UserControllers.updateMyProfile)
);

// 重設密碼
router.post(
  "/user/updatePassword",
  /**
   * #swagger.tags = ["User 會員"]
   * #swagger.summary = "重設密碼"
   * #swagger.description = "重設密碼"
   * #swagger.security = [{
      "Bearer": []
    }]
    * #swagger.parameters["body"] = {
      in: "body",
      type: "object",
      required: true,
      description: "資料格式",
      schema: {
        "$password": "carol123",
        "$confirmPassword": "carol123"
      }
    }
   * #swagger.responses[200] = {
      description: "回傳成功",
      schema: {
        "status": "success",
        "data": {
          "_id": "66ad12532a4c0826b5b65f3b",
          "nickName": "Carol",
          "gender": "secret",
          "avatarImgUrl": "https://123.png",
          "description": "",
          "email": "carol@mail.com",
        }
      }
    }
  */
  checkTokenAndSetAuth,
  getUserFromAuthId,
  errorAsyncHandler(UserControllers.updatePassword)
);

// 取得我的收藏列表
router.get(
  "/user/getCollectList",
  /**
   * #swagger.tags = ["User 會員"]
   * #swagger.summary = "取得我的收藏列表"
   * #swagger.description = "取得我的收藏列表"
   * #swagger.security = [{
      "Bearer": []
    }]
    * #swagger.parameters["sort"] = {
      in: "query",
      name: "sort",
      schema: { type: "string", enum: ["asc", "desc", "hot"], default: "desc" },
      description: "依更新日期、收藏排序，預設為 desc"
    }
    * #swagger.parameters["page"] = {
      in: "query",
      name: "page",
      schema: { type: "integer", default: 1 },
      description: "第幾頁，預設為 1"
    }
    * #swagger.parameters["perPage"] = {
      in: "query",
      name: "perPage",
      schema: { type: "integer", default: 10 },
      description: "每頁幾筆，預設為 10"
    }
    * #swagger.parameters["category"] = {
      in: "query",
      name: "category",
      schema: { type: "string" },
      description: "分類搜尋"
    }
    * #swagger.parameters["keyword"] = {
      in: "query",
      name: "keyword",
      schema: { type: "string" },
      description: "關鍵字搜尋"
    }
    * #swagger.parameters["tags"] = {
      in: "query",
      name: "tags",
      schema: { type: "string" },
      description: "標籤搜尋"
    }
   * #swagger.responses[200] = {
      description: "回傳成功",
      schema: {
        "status": "success",
        "data": {
          "results": [
            {
              "_id": "6789f201862fb3b01124e466",
              "title": "雞肉丼飯",
              "coverImgUrl": "https://123.jpg",
              "isPublic": true,
              "category": "6747ffe7bbe060fd3f49a366",
              "user": {
                "_id": "66ad12532a4c0826b5b65f66",
                "nickName": "admin",
                "avatarImgUrl": "https://123.jpg"
              },
              "cookingTime": "15-30 分鐘",
              "description": "日式風味的雞肉丼飯，簡單又快速，適合忙碌的工作日。",
              "servings": 2,
              "createdAt": "2025-01-17T11:05:00.000Z",
              "updatedAt": "2025-03-15T05:37:01.984Z",
              "tags": ["66ad17220c1f2d5e934ba5d5"],
              "collectsCount": 2,
              "isRecommended": true,
            }
          ],
          "pagination": {
            "totalPage": 1,
            "currentPage": 1,
            "hasPrev": false,
            "hasNext": false
          }
        }
      }
    }
  */
  checkTokenAndSetAuth,
  getUserFromAuthId,
  errorAsyncHandler(UserControllers.getCollectList)
);

module.exports = router;
