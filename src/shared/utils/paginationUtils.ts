interface GetPageGroupParams {
  totalCount: number;
  pageSize: number;
  groupSize: number;
  currentPageGroupNumber: number;
}

interface GetPageGroupResult {
  pageGroup: number[];
  lastGroupNumber: number;
}

interface GetCurrentPageGroupNumberParams {
  totalCount: number;
  pageSize: number;
  groupSize: number;
  currentPage: number;
}

/**
 * 페이지 그룹 정보를 계산합니다.
 * @param params - 페이지 그룹 계산에 필요한 파라미터
 * @returns 페이지 그룹 배열과 마지막 그룹 번호
 */
export const getPageGroup = (params: GetPageGroupParams): GetPageGroupResult => {
  const { totalCount, pageSize, groupSize, currentPageGroupNumber } = params;
  
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const lastGroupNumber = Math.ceil(totalPages / groupSize) || 1;
  
  const startPage = (currentPageGroupNumber - 1) * groupSize + 1;
  const endPage = Math.min(currentPageGroupNumber * groupSize, totalPages);
  
  const pageGroup: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pageGroup.push(i);
  }
  
  return {
    pageGroup,
    lastGroupNumber,
  };
};

/**
 * 현재 페이지가 속한 그룹 번호를 계산합니다.
 * @param params - 그룹 번호 계산에 필요한 파라미터
 * @returns 현재 페이지가 속한 그룹 번호
 */
export const getCurrentPageGroupNumber = (params: GetCurrentPageGroupNumberParams): number => {
  const { totalCount, pageSize, groupSize, currentPage } = params;
  
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const lastGroupNumber = Math.ceil(totalPages / groupSize) || 1;
  
  const currentGroupNumber = Math.ceil(currentPage / groupSize) || 1;
  
  return Math.min(currentGroupNumber, lastGroupNumber);
};
