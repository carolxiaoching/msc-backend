// 分頁工具
const paginationUtils = async ({
  model,
  query = {}, // 查詢條件
  sort = {}, // 排序
  displayFields = {}, // 欄位
  select = "", // 顯示隱藏欄位
  page = 1, // 現在頁數
  perPage = 10, // 每頁幾筆
}) => {
  // 每頁幾筆
  const limit = Math.max(Number(perPage), 1);

  // 取得資料總數
  const totalResult = await model.countDocuments(query);

  // 總共有幾頁
  const totalPage = Math.ceil(totalResult / perPage);

  // 現在頁數
  let currentPage = Math.max(Number(page), 1);
  // 如果 currentPage 大於 totalPage，則設為 totalPage
  currentPage = currentPage > totalPage ? totalPage : currentPage;

  // 跳過幾筆
  const skip = Math.max(currentPage - 1, 0) * perPage;

  // 取得此頁的資料
  let results = await model
    .find(query, displayFields)
    .select(select)
    .skip(skip)
    .limit(limit)
    .sort(sort);

  return {
    results,
    pagination: {
      totalPage,
      currentPage,
      hasPrev: currentPage > 1,
      hasNext: currentPage < totalPage,
    },
  };
};

module.exports = paginationUtils;
