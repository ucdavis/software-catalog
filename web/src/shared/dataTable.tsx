import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

interface DataTableProps<TData extends object> {
  data: TData[];
  columns: ColumnDef<TData>[];
  // ...any other props, initial state?, export? pages? filter? sorting?
}

export const DataTable = <TData extends object>({
  data,
  columns,
}: DataTableProps<TData>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(), // basic rendering
    getSortedRowModel: getSortedRowModel(), // enable sorting feature
    getFilteredRowModel: getFilteredRowModel(), // enable filtering feature
    getPaginationRowModel: getPaginationRowModel(), // enable pagination calculations
  });

  return (
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
  );
};
