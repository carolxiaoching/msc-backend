const express = require("express");
const router = express.Router();
const forgetControllers = require("../../controllers/member/forget");
const errorAsyncHandler = require("../../services/errorAsyncHandler");

// 忘記密碼 - 寄送重設密碼信件
router.post(
  "/forget-password",
  /**
    * #swagger.tags = ["Forget 忘記密碼"]
    * #swagger.summary = "忘記密碼 - 寄送重設密碼信件"
    * #swagger.description = "忘記密碼 - 寄送重設密碼信件"
    * #swagger.parameters["body"] = {
      in: "body",
      type: "object",
      required: true,
      description: "資料格式",
      schema: {
        "$email": "carol@mail.com",
      }
    }
    * #swagger.responses[200] = {
      description: "回傳成功",
      schema: {
        "status": "success",
        "data": "密碼重設 Email 已發送"
      }
    }
  */
  errorAsyncHandler(forgetControllers.forgetPassword)
);

// 忘記密碼 - 重設密碼
router.post(
  "/reset-password",
  /**
    * #swagger.tags = ["Forget 忘記密碼"]
    * #swagger.summary = "忘記密碼 - 重設密碼"
    * #swagger.description = "忘記密碼 - 重設密碼"
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
  errorAsyncHandler(forgetControllers.resetPassword)
);

module.exports = router;
