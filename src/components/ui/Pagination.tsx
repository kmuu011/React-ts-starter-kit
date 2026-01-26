import React, { useEffect, useState } from "react";
import { getCurrentPageGroupNumber, getPageGroup } from "@/shared/utils/paginationUtils";

import leftArrow from "../../assets/button/pagination/arrow_left.svg";
import rightArrow from "../../assets/button/pagination/arrow_right.svg";
import firstPageArrow from "../../assets/button/pagination/arrow_first_page.svg";
import lastPageArrow from "../../assets/button/pagination/arrow_last_page.svg";

interface PaginationProps {
  dispatch?: any;
  currentPage: number;
  setCurrentPage: (page: number | { page: number }) => void;
  totalCount: number;
  pageSize: number;
  pageGroupSize?: number;
  includeEndButton?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  dispatch,
  currentPage,
  setCurrentPage,
  totalCount,
  pageSize,
  pageGroupSize = 10,
  includeEndButton = false,
}) => {
  const normalizedTotalCount = totalCount || 1;
  const normalizedPageGroupSize = pageGroupSize || 10;

  const [pageList, setPageList] = useState<number[]>([]);
  const [currentPageGroupNumber, setCurrentPageGroupNumber] = useState(1);
  const [lastPageGroupNumber, setLastPageGroupNumber] = useState(1);

  const pageGroupChangeTypeMapping: Record<number, number> = {
    0: 1,
    1: currentPageGroupNumber - 1,
    2: currentPageGroupNumber + 1,
    3: lastPageGroupNumber,
  };

  const pageListSetting = () => {
    const pageGroupResult = getPageGroup({
      totalCount: normalizedTotalCount,
      pageSize,
      groupSize: normalizedPageGroupSize,
      currentPageGroupNumber,
    });

    setPageList(pageGroupResult.pageGroup);
    setLastPageGroupNumber(pageGroupResult.lastGroupNumber);
  };

  const pageGroupChange = (type: number) => {
    const payload = {
      totalCount: normalizedTotalCount,
      pageSize,
      groupSize: normalizedPageGroupSize,
      currentPageGroupNumber: 1,
    };

    const newCurrentPageGroupNumber =
      pageGroupChangeTypeMapping[type] || currentPageGroupNumber;
    payload.currentPageGroupNumber = newCurrentPageGroupNumber;

    const pageGroupResult = getPageGroup(payload);

    setCurrentPageGroupNumber(newCurrentPageGroupNumber);
    changePage(
      type === 3
        ? pageGroupResult.pageGroup[pageGroupResult.pageGroup.length - 1]
        : type === 1
          ? pageGroupResult.pageGroup[pageGroupResult.pageGroup.length - 1]
          : pageGroupResult.pageGroup[0]
    );
  };

  const changePage = (page: number) => {
    if (dispatch) {
      return dispatch(setCurrentPage({ page }));
    }

    // setCurrentPage는 숫자 또는 객체를 받을 수 있음
    setCurrentPage(page);
  };

  useEffect(() => {
    pageListSetting();
  }, [currentPageGroupNumber, normalizedTotalCount]);

  useEffect(() => {
    const payload = {
      totalCount: normalizedTotalCount,
      pageSize,
      groupSize: normalizedPageGroupSize,
      currentPage,
    };

    const newCurrentPageGroupNumber = getCurrentPageGroupNumber(payload);

    setCurrentPageGroupNumber(newCurrentPageGroupNumber);
  }, [currentPage, normalizedTotalCount, pageSize, normalizedPageGroupSize]);

  return (
    <section className="mt-6 flex items-center justify-center gap-2">
      {includeEndButton && (
        <button
          className={`flex h-8 w-8 items-center justify-center rounded border border-neutral-300 bg-white transition-all hover:border-brand-3 hover:bg-brand-0 ${
            currentPageGroupNumber === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          onClick={() => {
            pageGroupChange(0);
          }}
          disabled={currentPageGroupNumber === 1}
        >
          <img src={firstPageArrow} alt="firstPageArrowImg" className="h-4 w-4" />
        </button>
      )}
      <button
        className={`flex h-8 w-8 items-center justify-center rounded border border-neutral-300 bg-white transition-all hover:border-brand-3 hover:bg-brand-0 ${
          currentPageGroupNumber === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
        onClick={() => {
          pageGroupChange(1);
        }}
        disabled={currentPageGroupNumber === 1}
      >
        <img src={leftArrow} alt="beforePageGroupArrowImg" className="h-4 w-4" />
      </button>

      {pageList.map((item, index) => (
        <div
          className={`flex h-8 min-w-8 cursor-pointer items-center justify-center rounded border px-2 text-sm transition-all ${
            item === parseInt(String(currentPage))
              ? "border-brand-3 bg-brand-3 font-semibold text-white"
              : "border-neutral-300 bg-white text-neutral-700 hover:border-brand-3 hover:bg-brand-0"
          }`}
          key={index}
          onClick={() => {
            changePage(item);
          }}
        >
          {item}
        </div>
      ))}

      <button
        className={`flex h-8 w-8 items-center justify-center rounded border border-neutral-300 bg-white transition-all hover:border-brand-3 hover:bg-brand-0 ${
          currentPageGroupNumber === lastPageGroupNumber ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
        onClick={() => {
          pageGroupChange(2);
        }}
        disabled={currentPageGroupNumber === lastPageGroupNumber}
      >
        <img src={rightArrow} alt="nextPageGroupArrowImg" className="h-4 w-4" />
      </button>

      {includeEndButton && (
        <button
          className={`flex h-8 w-8 items-center justify-center rounded border border-neutral-300 bg-white transition-all hover:border-brand-3 hover:bg-brand-0 ${
            currentPageGroupNumber === lastPageGroupNumber ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          onClick={() => {
            pageGroupChange(3);
          }}
          disabled={currentPageGroupNumber === lastPageGroupNumber}
        >
          <img src={lastPageArrow} alt="lastPageArrowImg" className="h-4 w-4" />
        </button>
      )}
    </section>
  );
};

export default Pagination;
