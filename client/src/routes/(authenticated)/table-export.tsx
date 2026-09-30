import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { createFileRoute, Link } from '@tanstack/react-router';
import { type CsvColumn } from '@/lib/csv.ts';
import { HttpError } from '@/lib/api.ts';
import { weatherQueryOptions, type Forecast } from '@/queries/weather.ts';
import { useUser } from '@/shared/auth/UserContext.tsx';
import { DataTable } from '@/shared/dataTable.tsx';
import { ExportDataButton } from '@/shared/exportDataButton.tsx';

export const Route = createFileRoute('/(authenticated)/table-export')({
  component: TableExportExample,
});

const columns: ColumnDef<Forecast>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'temperatureC',
    header: 'Temp. (C)',
  },
  {
    accessorKey: 'temperatureF',
    header: 'Temp. (F)',
  },
  {
    accessorKey: 'summary',
    header: 'Summary',
  },
];

const csvColumns: CsvColumn<Forecast>[] = [
  {
    format: 'date',
    header: 'Date',
    key: 'date',
  },
  {
    header: 'Temperature (C)',
    key: 'temperatureC',
  },
  {
    header: 'Temperature (F)',
    key: 'temperatureF',
  },
  {
    header: 'Summary',
    key: 'summary',
  },
];

function TableExportExample() {
  const user = useUser();
  const weatherQuery = useQuery(weatherQueryOptions(user.id));

  const contents = weatherQuery.isError ? (
    <div className="alert alert-error" role="alert">
      <span>
        {weatherQuery.error instanceof HttpError &&
        weatherQuery.error.status === 403
          ? 'Your account cannot access weather forecasts.'
          : 'Could not load weather forecasts. Please try again.'}
      </span>
      <button
        className="btn btn-sm"
        onClick={() => void weatherQuery.refetch()}
        type="button"
      >
        Try again
      </button>
    </div>
  ) : weatherQuery.isPending ? (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="text-gray-600 italic">
          Loading... Please refresh once the ASP.NET backend has started. See{' '}
          <a
            className="text-blue-600 underline hover:text-blue-800"
            href="https://aka.ms/jspsintegrationreact"
          >
            https://aka.ms/jspsintegrationreact
          </a>{' '}
          for more details.
        </p>
      </div>
    </div>
  ) : weatherQuery.data.length === 0 ? (
    <p>No weather forecasts are available.</p>
  ) : (
    <DataTable
      columns={columns}
      data={weatherQuery.data}
      globalFilter="left"
      initialState={{ pagination: { pageSize: 5 } }}
      tableActions={(table) => {
        const hasActiveFilter =
          String(table.getState().globalFilter ?? '').trim() !== '';
        const filteredRows = table
          .getFilteredRowModel()
          .rows.map((row) => row.original);

        return (
          <div className="flex flex-wrap items-center gap-2">
            <ExportDataButton
              columns={csvColumns}
              data={weatherQuery.data}
              filename="weather-forecast.csv"
            />
            {hasActiveFilter ? (
              <ExportDataButton
                columns={csvColumns}
                data={filteredRows}
                filename="weather-forecast-filtered.csv"
                label="Export filtered"
              />
            ) : null}
          </div>
        );
      }}
    />
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 left-4 z-10">
        <Link className="btn btn-ghost btn-sm" to="/">
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 12l2-2m0 0 7-7 7 7M5 10v10a1 1 0 001 1h3m10-11 2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          Home
        </Link>
      </div>

      <div className="w-full max-w-5xl space-y-8">
        <div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Weather forecast with export
          </h1>
          <p className="mb-6 text-gray-600">
            This example keeps the existing fetch pattern, then adds a toolbar
            export button using separate CSV column definitions similar to
            Walter.
          </p>
          {contents}
        </div>
      </div>
    </div>
  );
}
