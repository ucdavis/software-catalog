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
  globalFilter?: 'left' | 'right' | 'none'; // Controls the position of the search box
  // ...any other props, initial state?, export? pages? filter? sorting?
}

export const DataTable = <TData extends object>({
  data,
  columns,
  initialState,
  globalFilter = 'right',
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
      {globalFilter !== 'none' && (
        <div
          className={`flex items-center ${globalFilter === 'right' ? 'justify-end' : 'justify-start'}`}
        >
          <label className='input input-bordered flex items-center gap-2 w-full max-w-sm'>
            <svg
              className='h-[1em] opacity-50'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
            >
              <g
                strokeLinejoin='round'
                strokeLinecap='round'
                strokeWidth='2.5'
                fill='none'
                stroke='currentColor'
              >
                <circle cx='11' cy='11' r='8'></circle>
                <path d='m21 21-4.3-4.3'></path>
              </g>
            </svg>
            <input
              type='text'
              className='grow'
              placeholder='Search all columns...'
              value={table.getState().globalFilter ?? ''}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
            />
            {table.getState().globalFilter && (
              <button
                onClick={() => table.setGlobalFilter('')}
                className='btn btn-ghost btn-sm btn-circle'
                type='button'
              >
                <svg
                  className='h-4 w-4'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 16 16'
                  fill='currentColor'
                >
                  <path d='M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z' />
                </svg>
              </button>
            )}
          </label>
        </div>
      )}

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
