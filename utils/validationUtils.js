const mongoose = require("mongoose");
const validator = require("validator");
const appError = require("../services/appError");
const Tag = require("../models/tag");

const validationUtils = {
  // 驗證 ObjectId 格式
  isValidObjectId(id) {
    return mongoose.isObjectIdOrHexString(id);
  },

  // 驗證 Id 是否存在資料庫中
  async isIdExist(Model, id) {
    const isExist = await Model.findById(id).exec();
    return isExist;
  },

  // 驗證傳入的物件有值
  isObjectEmpty(object) {
    return Object.keys(object).length > 0;
  },

  // 驗證字串是否有效，最少 1 個字元，最多 300 字元
  isValidString(value, minLength = 1, maxLength = 300) {
    return (
      typeof value === "string" &&
      validator.isLength(value.trim(), { min: minLength, max: maxLength })
    );
  },

  // 驗證數字是否有效，最小值為 0, 最少 1 個字元，最多 10 字元
  isValidNumber(num, minValue = 0, maxValue = 999) {
    return typeof num === "number" && num >= minValue && num <= maxValue;
  },

  // 驗證網址是否有效
  isValidUrl(url) {
    return (
      this.isValidString(url, 1, 1000) &&
      validator.isURL(url, {
        protocols: ["http", "https"],
        require_protocol: true,
      })
    );
  },

  // 驗證密碼是否有效
  isValidPassword(password) {
    return (
      this.isValidString(password, 8, 30) &&
      validator.isStrongPassword(password, {
        minLength: 8, // 最小字元數
        minLowercase: 1, // 最少小寫字母數量
        minUppercase: 0, // 最少大寫字母數量
        minNumbers: 1, // 最少數字數量
        minSymbols: 0, // 標點符號數量
      })
    );
  },

  // 驗證電子信箱是否有效
  isValidEmail(email) {
    return this.isValidString(email) && validator.isEmail(email);
  },

  // 驗證標籤欄位是否正確
  async isValidTags(tags) {
    // 驗證標籤欄位是否為陣列，陣列長度不能超過 3
    if (!Array.isArray(tags) || tags.length > 3) {
      return false;
    }

    // 用來記錄已處理過的標籤，檢查是否有重複
    const seenTags = [];

    // 檢查標籤陣列裡面的值
    for (const tagItem of tags) {
      // 檢查標籤是否有重複，如果已經出現過該標籤，則返回 false
      if (seenTags.includes(tagItem)) {
        return false;
      }
      // 將當前標籤加入已處理過的標籤列表
      seenTags.push(tagItem);

      // 驗證標籤是否為字串與是否符合 ObjectId 格式
      if (!this.isValidString(tagItem) || !this.isValidObjectId(tagItem)) {
        return false;
      }

      // 確認標籤 ID 是否存在在 Tag 資料庫中
      const exists = await this.isIdExist(Tag, tagItem);
      if (exists === false) {
        return false;
      }
    }

    return true;
  },

  // 驗證營養資訊欄位是否正確
  isValidNutritionFacts(nutritionFacts) {
    const validFields = [
      "calories",
      "protein",
      "totalFat",
      "totalCarb",
      "sodium",
      "sugar",
    ];
    // 檢查營養資訊是否為物件，且不能為 null
    if (typeof nutritionFacts !== "object" || nutritionFacts === null) {
      return false;
    }

    // 驗證營養資訊每個屬性的值是否 >= 0
    for (const field of validFields) {
      if (!this.isValidNumber(nutritionFacts[field], 0)) {
        return false;
      }
    }
    return true;
  },

  // 驗證食材欄位是否正確
  isValidIngredients(ingredients) {
    // 檢查驗證食材欄位是否為陣列，陣列長度介於 1~12
    if (
      !Array.isArray(ingredients) ||
      ingredients.length === 0 ||
      ingredients.length > 12
    ) {
      return false;
    }

    // 檢查食材陣列裡面的值
    for (const { ingredientName, ingredientQty } of ingredients) {
      // 驗證食材是否為字串
      if (
        !this.isValidString(ingredientName, 1, 12) ||
        !this.isValidString(ingredientQty, 1, 8)
      ) {
        return false;
      }
    }
    return true;
  },

  // 驗證步驟欄位是否正確
  isValidSteps(steps) {
    // 檢查驗證步驟欄位是否為陣列，陣列長度介於 1~10
    if (!Array.isArray(steps) || steps.length === 0 || steps.length > 10) {
      return false;
    }

    // 檢查步驟陣列裡面的值
    for (const { stepOrder, stepContent } of steps) {
      // 驗證步驟是否 stepContent 為字串及 stepOrder 是否為數字
      if (
        !this.isValidNumber(stepOrder, 1) ||
        !this.isValidString(stepContent, 1, 100)
      ) {
        return false;
      }
    }
    return true;
  },

  // 使用驗證規則陣列逐一檢查資料，若任何一個規則的條件為 true，則立即回傳錯誤
  async checkValidation(validations) {
    for (const validation of validations) {
      if (validation.condition) {
        return validation.message;
      }
    }
  },
};

module.exports = validationUtils;
