import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  InitialTableState,
  useReactTable,
} from '@tanstack/react-table';

interface DataTableProps<TData extends object> {
  data: TData[];
  columns: ColumnDef<TData>[];
  initialState?: InitialTableState; // Optional initial state for the table, use for stuff like setting page size or sorting
  // ...any other props, initial state?, export? pages? filter? sorting?
}

export const DataTable = <TData extends object>({
  data,
  columns,
  initialState,
}: DataTableProps<TData>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(), // basic rendering
    getSortedRowModel: getSortedRowModel(), // enable sorting feature
    getFilteredRowModel: getFilteredRowModel(), // enable filtering feature
    getPaginationRowModel: getPaginationRowModel(), // enable pagination calculations
    initialState: {
      ...initialState,
    },
  });

  return (
    <div className='space-y-4'>
      {/* Global filter input */}
      <div className='flex items-center space-x-2'>
        <div className='relative flex-1 max-w-sm'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <svg
              className='h-5 w-5 text-gray-400'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <input
            type='text'
            placeholder='Search all columns...'
            value={table.getState().globalFilter ?? ''}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className='input input-bordered w-full pl-10 pr-4 py-2 text-sm'
          />
          {table.getState().globalFilter && (
            <button
              onClick={() => table.setGlobalFilter('')}
              className='absolute inset-y-0 right-0 pr-3 flex items-center'
            >
              <svg
                className='h-4 w-4 text-gray-400 hover:text-gray-600'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className='overflow-x-auto'>
        {' '}
        {/* enables horizontal scroll on small screens */}
        <table className='table table-zebra w-full'>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler?.()}
                    className='cursor-pointer'
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {/* Add sort indicator if column is sorted */}
                    {header.column.getIsSorted() === 'asc'
                      ? ' 🔼'
                      : header.column.getIsSorted() === 'desc'
                        ? ' 🔽'
                        : ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {/* (Optional) Pagination controls */}
        <div className='flex justify-end space-x-2 py-2'>
          <button
            className='btn btn-xs'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            className='btn btn-xs'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
