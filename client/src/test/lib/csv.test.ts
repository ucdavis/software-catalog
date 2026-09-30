import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadCsv, toCsv, toExcelCsv } from '@/lib/csv.ts';

describe('csv utilities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it.each(['=1+1', '+1', '-1', '@SUM(A1)', '\tformula', '\rformula', '\n=1+1'])(
    'neutralizes formula-like string values and headers: %j',
    (value) => {
      const escaped =
        value.includes('\r') || value.includes('\n') ? `"'${value}"` : `'${value}`;
      expect(toCsv([{ value }], [{ header: value, key: 'value' }])).toBe(
        `${escaped}\n${escaped}`
      );
    }
  );

  it('preserves numeric values while protecting formatted strings', () => {
    expect(
      toCsv(
        [{ amount: -1234, fallback: '=SUM(A1)', text: '-1234' }],
        [
          { header: 'Number', key: 'amount' },
          { format: 'currency', header: 'Currency', key: 'amount' },
          { format: 'currency', header: 'Text', key: 'text' },
          { format: 'date', header: 'Fallback', key: 'fallback' },
        ]
      )
    ).toBe(
      'Number,Currency,Text,Fallback\n-1234,"-1,234.00","\'-1,234.00",\'=SUM(A1)'
    );
  });

  it.each(['a\rb', 'a\nb', 'a\r\nb', 'a,b', 'a"b'])(
    'quotes CSV delimiters and doubles embedded quotes: %j',
    (value) => {
      expect(toCsv([{ value }], [{ header: 'Value', key: 'value' }])).toBe(
        `Value\n"${value.replaceAll('"', '""')}"`
      );
    }
  );

  it('keeps the download URL alive until a later task', () => {
    vi.useFakeTimers();
    const createObjectURL = vi.fn(() => 'blob:csv-download');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.href).toBe('blob:csv-download');
        expect(this.download).toBe('export.csv');
        expect(revokeObjectURL).not.toHaveBeenCalled();
      });

    downloadCsv('Value\nexample', 'export.csv');

    expect(click).toHaveBeenCalledOnce();
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(revokeObjectURL).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith(
      'blob:csv-download'
    );
  });

  it('formats excel-friendly csv output with escaping and a BOM', () => {
    const csv = toExcelCsv(
      [
        {
          amount: 1234.5,
          date: '2024-07-04',
          summary: 'Sunny, "bright"',
        },
      ],
      [
        { format: 'date', header: 'Date', key: 'date' },
        { format: 'currency', header: 'Amount', key: 'amount' },
        { header: 'Summary', key: 'summary' },
      ]
    );

    expect(csv.startsWith('\ufeffDate,Amount,Summary\r\n')).toBe(true);
    expect(csv).toContain('07/04/2024');
    expect(csv).toContain('"1,234.50"');
    expect(csv).toContain('"Sunny, ""bright"""');
  });
});
