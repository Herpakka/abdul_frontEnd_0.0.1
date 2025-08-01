export default function Pagination({ currentPage, pageCount, goToPage }) {
  return (
    <nav
      className="flex justify-center items-center space-x-2 mt-6 select-none"
      aria-label="Pagination"
    >
      <button
        className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        &laquo;
      </button>

      {[...Array(pageCount).keys()].map((num) => {
        const page = num + 1;
        return (
          <button
            key={page}
            className={`px-3 py-1 rounded-md border ${
              page === currentPage
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
            onClick={() => goToPage(page)}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      <button
        className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === pageCount || pageCount === 0}
        aria-label="Next page"
      >
        &raquo;
      </button>
    </nav>
  );
}
