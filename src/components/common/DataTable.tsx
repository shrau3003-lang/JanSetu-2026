import React from 'react';
import { cn } from '../../lib/utils';
import { Card } from './Card';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  title?: string;
  subtitle?: string;
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  headerActions?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<T>({
  title,
  subtitle,
  columns,
  data,
  keyExtractor,
  headerActions,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display right now.',
  className
}: DataTableProps<T>) {
  return (
    <Card className={cn('p-0 border-slate-200/80 overflow-hidden', className)}>
      {(title || headerActions) && (
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}

      {data.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} className="border-none my-0 rounded-none py-12" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/60 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {columns.map((col, idx) => (
                  <th key={idx} className={cn('py-3.5 px-4', col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {data.map((item) => (
                <tr key={keyExtractor(item)} className="hover:bg-slate-50/80 transition-colors">
                  {columns.map((col, idx) => (
                    <td key={idx} className={cn('py-3.5 px-4 text-slate-700', col.className)}>
                      {col.cell
                        ? col.cell(item)
                        : col.accessorKey
                        ? String(item[col.accessorKey] ?? '')
                        : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
