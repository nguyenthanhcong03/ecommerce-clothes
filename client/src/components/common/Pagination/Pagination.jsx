import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, className = '' }) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage, endPage;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if totalPages <= maxVisiblePages
      startPage = 1;
      endPage = totalPages;
    } else {
      // Calculate start and end pages based on current page
      if (currentPage <= 3) {
        startPage = 1;
        endPage = 5;
      } else if (currentPage + 2 >= totalPages) {
        startPage = totalPages - 4;
        endPage = totalPages;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }

    // Add first page and ellipsis if necessary
    if (startPage > 1) {
      items.push(renderPageButton(1));
      if (startPage > 2) {
        items.push(renderEllipsis('start'));
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(renderPageButton(i));
    }

    // Add ellipsis and last page if necessary
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(renderEllipsis('end'));
      }
      items.push(renderPageButton(totalPages));
    }

    return items;
  };

  const renderPageButton = (pageNumber) => {
    const isActive = pageNumber === currentPage;
    return (
      <button
        key={pageNumber}
        onClick={() => onPageChange(pageNumber)}
        disabled={isActive}
        className={`rounded-md px-3 py-1 ${
          isActive ? 'bg-[#333] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        {pageNumber}
      </button>
    );
  };

  const renderEllipsis = (key) => {
    return (
      <span key={`ellipsis-${key}`} className='px-2 py-1'>
        &hellip;
      </span>
    );
  };

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`rounded-md p-1 ${
          currentPage === 1 ? 'cursor-not-allowed text-gray-300' : 'text-gray-700 hover:bg-gray-100'
        }`}
        aria-label='Previous page'
      >
        <ChevronLeft className='h-5 w-5' />
      </button>

      {renderPageNumbers()}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`rounded-md p-1 ${
          currentPage === totalPages ? 'cursor-not-allowed text-gray-300' : 'text-gray-700 hover:bg-gray-100'
        }`}
        aria-label='Next page'
      >
        <ChevronRight className='h-5 w-5' />
      </button>
    </div>
  );
};

export default Pagination;
