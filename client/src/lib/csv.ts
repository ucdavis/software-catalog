type CsvValue = string | number | boolean | null | undefined;

interface CsvOptions {
  includeBom?: boolean;
  lineEnding?: '\n' | '\r\n';
}

export type CsvFormat = 'currency' | 'date';

export interface CsvColumn<T> {
  format?: CsvFormat;
  header: string;
  key: keyof T;
}

function escapeCsvValue(
  value: CsvValue,
  isString = typeof value === 'string'
): string {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value);
  const stringValue = isString && /^[\t\n\r+=@-]/.test(text) ? `'${text}` : text;

  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

function formatDateValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const stringValue = String(value);
  const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(stringValue);

  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return `${month}/${day}/${year}`;
  }

  const date = new Date(stringValue);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatCurrencyValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return String(value);
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(numberValue);
}

function formatValue(value: unknown, format?: CsvFormat): string {
  if (format === 'date') {
    return formatDateValue(value);
  }

  if (format === 'currency') {
    return formatCurrencyValue(value);
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

export function toCsv<T>(
  rows: T[],
  columns: CsvColumn<T>[],
  options?: CsvOptions
): string {
  const lineEnding = options?.lineEnding ?? '\n';
  const headers = columns
    .map((column) => escapeCsvValue(column.header))
    .join(',');
  const dataRows = rows.map((row) =>
    columns
      .map((column) =>
        escapeCsvValue(
          formatValue(row[column.key], column.format),
          typeof row[column.key] === 'string'
        )
      )
      .join(',')
  );
  const csv = [headers, ...dataRows].join(lineEnding);

  return options?.includeBom ? `\ufeff${csv}` : csv;
}

export function toExcelCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  return toCsv(rows, columns, { includeBom: true, lineEnding: '\r\n' });
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  // Let the browser start the download before releasing its object URL.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadExcelCsv(content: string, filename: string): void {
  downloadCsv(content, filename);
}
