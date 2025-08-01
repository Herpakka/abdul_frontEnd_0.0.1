export default function SearchAndPagination({
  searchTerm,
  setSearchTerm,
  paginatedItemsCount,
  filteredItemsCount,
}) {
  return (
    <div className="mb-4 flex justify-between items-center">
      <input
        type="search"
        className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search knowledge base..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
        }}
        aria-label="Search knowledge"
      />

      <p className="ml-4 text-gray-700">
        Showing{' '}
        <span className="font-semibold">{paginatedItemsCount}</span> of{' '}
        <span className="font-semibold">{filteredItemsCount}</span> items
      </p>
    </div>
  );
}
