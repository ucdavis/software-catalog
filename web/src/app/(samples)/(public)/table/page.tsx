'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/dataTable';

// Sample person data type
interface Person {
  id: string;
  name: string;
  lastSeen: Date;
  points: number;
  status: 'Active' | 'Inactive' | 'Pending';
}

// Sample data
const sampleData: Person[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    lastSeen: new Date('2025-07-24T10:30:00'),
    points: 1250,
    status: 'Active',
  },
  {
    id: '2',
    name: 'Bob Smith',
    lastSeen: new Date('2025-07-23T15:45:00'),
    points: 890,
    status: 'Active',
  },
  {
    id: '3',
    name: 'Carol Davis',
    lastSeen: new Date('2025-07-20T09:15:00'),
    points: 2100,
    status: 'Inactive',
  },
  {
    id: '4',
    name: 'David Wilson',
    lastSeen: new Date('2025-07-22T14:20:00'),
    points: 675,
    status: 'Pending',
  },
  {
    id: '5',
    name: 'Eva Martinez',
    lastSeen: new Date('2025-07-24T08:00:00'),
    points: 3450,
    status: 'Active',
  },
  {
    id: '6',
    name: 'Frank Thompson',
    lastSeen: new Date('2025-07-19T16:30:00'),
    points: 125,
    status: 'Inactive',
  },
];

// Column definitions
const columns: ColumnDef<Person>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'lastSeen',
    header: 'Last Seen',
    cell: ({ row }) => {
      const date = row.getValue('lastSeen') as Date;
      return (
        <div className='text-sm'>
          {date.toLocaleDateString()} at {date.toLocaleTimeString()}
        </div>
      );
    },
  },
  {
    accessorKey: 'points',
    header: 'Points',
    cell: ({ row }) => {
      const points = row.getValue('points') as number;
      return (
        <div className='text-right font-mono'>{points.toLocaleString()}</div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const badgeClass =
        {
          Active: 'badge-success',
          Inactive: 'badge-error',
          Pending: 'badge-warning',
        }[status] || 'badge-neutral';

      return <div className={`badge ${badgeClass}`}>{status}</div>;
    },
  },
];

/**
 * Table sample page demonstrating the DataTable component with various data types
 */
export default function TablePage() {
  return (
    <div className='min-h-screen bg-base-100'>
      <div className='container mx-auto px-4 py-16'>
        {/* Header Section */}
        <header className='text-center mb-16'>
          <h1 className='text-5xl font-bold mb-4'>Data Table Example</h1>
          <p className='text-xl max-w-2xl mx-auto text-base-content/70'>
            This page demonstrates the DataTable component with sample data. You
            can sort columns by clicking the headers and navigate through pages
            using the pagination controls.
          </p>
        </header>

        {/* Data Table Section */}
        <section className='mb-16'>
          <div className='card bg-base-100 shadow-xl'>
            <div className='card-body'>
              <h2 className='card-title text-2xl mb-6'>User Activity Table</h2>
              <p className='text-base-content/70 mb-6'>
                Below is a sample table showing user data with different data
                types: strings (Name), dates (Last Seen), numbers (Points), and
                enums (Status). Try clicking on the column headers to sort the
                data.
              </p>

              <DataTable data={sampleData} columns={columns} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className='mb-16'>
          <h2 className='text-3xl font-bold text-center mb-12'>
            DataTable Features
          </h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto'>
            <div className='card bg-base-100 shadow-md text-center'>
              <div className='card-body'>
                <div className='w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-6 h-6 text-primary'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                    />
                  </svg>
                </div>
                <h3 className='card-title justify-center mb-2'>Sortable</h3>
                <p className='text-base-content/70'>
                  Click column headers to sort data ascending or descending
                </p>
              </div>
            </div>

            <div className='card bg-base-100 shadow-md text-center'>
              <div className='card-body'>
                <div className='w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-6 h-6 text-success'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2'
                    />
                  </svg>
                </div>
                <h3 className='card-title justify-center mb-2'>Paginated</h3>
                <p className='text-base-content/70'>
                  Navigate through large datasets with pagination controls
                </p>
              </div>
            </div>

            <div className='card bg-base-100 shadow-md text-center'>
              <div className='card-body'>
                <div className='w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-6 h-6 text-secondary'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 6h16M4 10h16M4 14h16M4 18h16'
                    />
                  </svg>
                </div>
                <h3 className='card-title justify-center mb-2'>Responsive</h3>
                <p className='text-base-content/70'>
                  Horizontal scrolling on small screens for better mobile
                  experience
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
