import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination controls component
 */
export const Pagination = ({ total, page, pageSize, onPageChange }) => {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return null;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        let start = Math.max(1, page - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-2">
            <p className="text-sm text-gray-500 font-medium">
                Showing <span className="text-gray-900 font-bold">{(page - 1) * pageSize + 1}</span> to <span className="text-gray-900 font-bold">{Math.min(page * pageSize, total)}</span> of <span className="text-gray-900 font-bold">{total}</span> records
            </p>

            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft size={18} />
                </button>

                {getPageNumbers().map(p => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`
                            min-w-[40px] h-10 px-3 rounded-lg text-sm font-bold transition-all
                            ${page === p
                                ? 'bg-green-600 text-white shadow-lg shadow-green-100 cursor-default'
                                : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'}
                        `}
                    >
                        {p}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
