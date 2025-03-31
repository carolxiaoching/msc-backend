const express = require("express");
const router = express.Router();
const MemberControllers = require("../../controllers/admin/memberManage");
const errorAsyncHandler = require("../../services/errorAsyncHandler");
const {
  checkTokenAndSetAuth,
  getUserFromAuthId,
  isAdmin,
} = require("../../middleware/authMiddleware");

// 管理員登入
router.post(
  "/member/signIn",
  /**
   * #swagger.tags = ["管理員 - User 會員"]
   * #swagger.summary = "管理員登入"
   * #swagger.description = "管理員登入"
   * #swagger.parameters["body"] = {
      in: "body",
      type: "object",
      required: true,
      description: "資料格式",
      schema: {
        "$email": "admin@gmail.com",
        "$password": "admin123"
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
            "nickName": "",
            "avatarImgUrl": "",
            "description": "",
            "gender": "secret"
          }
        }
      }
    }
  */
  errorAsyncHandler(MemberControllers.signIn)
);

// 確認管理員登入狀態
router.get(
  "/member/checkLoginStatus",
  /**
   * #swagger.tags = ["管理員 - User 會員"]
   * #swagger.summary = "確認管理員登入狀態"
   * #swagger.description = "確認管理員登入狀態"
   * #swagger.security = [{
      "Bearer": []
    }]
   * #swagger.responses[200] = {
      description: "回傳成功",
      schema: {
        "status": "success",
        "data": {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYTVhYTI0YWYxOGIyNzI5NmQ0MmE4MiIsImlhdCI6MTY1NTAyNDE2NCwiZXhwIjoxNjU1NjI4OTY0fQ.ylNUe_TfC7rqykZuJZdhOrp_oa4fKXwxniSrNk-SbhI",
          "user": {
            "_id": "62a5aa24af18b27296d42a82",
            "nickName": "",
            "email": "admin@gmail.com",
            "avatarImgUrl": "",
            "description": "",
            "gender": "secret"
          }
        }
      }
    }
  */
  checkTokenAndSetAuth,
  getUserFromAuthId,
  isAdmin,
  errorAsyncHandler(MemberControllers.checkLoginStatus)
);

// 取得所有會員
router.get(
  "/members",
  /**
    * #swagger.tags = ["管理員 - User 會員"]
    * #swagger.summary = "取得所有會員"
    * #swagger.description = "取得所有會員"
    * #swagger.security = [{
      "Bearer": []
    }]
    * #swagger.parameters["sort"] = {
      in: "query",
      name: "sort",
      schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
      description: "依更新日期排序 asc 舊到新，desc 新到舊，預設為 desc"
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
    * #swagger.parameters["noPagination"] = {
      in: "query",
      name: "noPagination",
      schema: { type: "boolean", default: false },
      description: "是否不分頁，預設為 false"
    }
    * #swagger.responses[200] = {
      description: "回傳成功",
      schema: {
        "status": "success",
        "data": {
          "result": [
            {
              "_id": "66ad12532a4c0826b5b65f3b",
              "nickName": "Carol",
              "gender": "secret",
              "avatarImgUrl": "https://123.png",
              "description": "",
              "email": "carol@mail.com",
              "role": "member",
              "collects": [],
              "createdAt": "2025-01-02T17:07:31.743Z",
              "updatedAt": "2025-01-07T17:02:49.701Z"
            }
          ],
          "pagination": {
            "totalPage": 1,
            "currentPage": 1,
            "hasPrev": false,
            "hasNext": false,
          }
        }
      }
    }
  */
  checkTokenAndSetAuth,
  getUserFromAuthId,
  isAdmin,
  errorAsyncHandler(MemberControllers.getAllMembers)
);

// 取得指定會員
router.get(
  "/member/:memberId",
  /**
   * #swagger.tags = ["管理員 - User 會員"]
   * #swagger.summary = "取得指定會員"
   * #swagger.description = "取得指定會員"
   * #swagger.security = [{
      "Bearer": []
    }]
   * #swagger.parameters["memberId"] = {
      in: "path",
      type: "string",
      required: true,
      description: "會員 ID"
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
            "role": "admin",
            "createdAt": "2025-01-02T17:08:01.747Z",
            "updatedAt": "2025-03-24T05:25:50.590Z",
            "collects": ["66eb7243c9d1a16bd4fc3ac5"],
            "description": "hi",
            "recipeCount": 6,
            "collectCount": 7
          }
        }
      }
  */
  checkTokenAndSetAuth,
  getUserFromAuthId,
  isAdmin,
  errorAsyncHandler(MemberControllers.getMember)
);

// 更新指定會員
router.patch(
  "/member/:memberId",
  /**
   * #swagger.tags = ["管理員 - User 會員"]
   * #swagger.summary = "更新指定會員"
   * #swagger.description = "更新指定會員"
   * #swagger.security = [{
        "Bearer": []
      }]
   * #swagger.parameters["memberId"] = {
        in: "path",
        type: "string",
        required: true,
        description: "會員 ID"
      }
   * #swagger.parameters["body"] = {
        in: "body",
        type: "object",
        required: true,
        description: "資料格式",
        schema: {
          "gender": "female"
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
            "role": "admin",
            "createdAt": "2025-01-02T17:08:01.747Z",
            "updatedAt": "2025-03-24T05:25:50.590Z",
            "collects": ["66eb7243c9d1a16bd4fc3ac5"],
            "description": "hi",
            "recipeCount": 6,
            "collectCount": 7
          }
        }
      }
  */
  checkTokenAndSetAuth,
  getUserFromAuthId,
  isAdmin,
  errorAsyncHandler(MemberControllers.updateMember)
);

// 刪除指定會員
router.delete(
  "/member/:memberId",
  /**
   * #swagger.tags = ["管理員 - User 會員"]
   * #swagger.summary = "刪除指定會員"
   * #swagger.description = "刪除指定會員"
   * #swagger.security = [{
        "Bearer": []
      }]
   * #swagger.parameters["memberId"] = {
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
            "_id": "66ad12532a4c0826b5b65f3b",
            "nickName": "Carol",
            "gender": "secret",
            "avatarImgUrl": "https://123.png",
            "description": "",
            "collects": [],
            "createdAt": "2025-01-02T17:07:31.743Z",
            "updatedAt": "2025-01-07T17:02:49.701Z"
          }
        }
      }
  */
  checkTokenAndSetAuth,
  getUserFromAuthId,
  isAdmin,
  errorAsyncHandler(MemberControllers.delMember)
);

// 刪除全部會員
router.delete(
  "/members",
  /**
   * #swagger.tags = ["管理員 - User 會員"]
   * #swagger.summary = "刪除全部會員"
   * #swagger.description = "刪除全部會員"
   * #swagger.security = [{
        "Bearer": []
      }]
   * #swagger.responses[200] = {
        description: "回傳成功",
        schema: {
          "status": "success",
          "data": []
        }
      }
  */
  checkTokenAndSetAuth,
  getUserFromAuthId,
  isAdmin,
  errorAsyncHandler(MemberControllers.delAllMembers)
);

module.exports = router;
