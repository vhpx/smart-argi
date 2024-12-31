'use client';

import { DatasetCrawler } from './dataset-crawler';
import { Button } from '@repo/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog';
import { Input } from '@repo/ui/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@repo/ui/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select';
import { Skeleton } from '@repo/ui/components/ui/skeleton';
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface Props {
  wsId: string;
  datasetId: string;
  datasetUrl: string | null;
}

export function DataExplorer({ wsId, datasetId, datasetUrl }: Props) {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const [pageSize, setPageSize] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newRow, setNewRow] = useState<any>({});
  const [editingRow, setEditingRow] = useState<any>(null);

  // Query for columns
  const columnsQuery = useQuery({
    queryKey: [wsId, datasetId, 'columns'],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/workspaces/${wsId}/datasets/${datasetId}/columns`
      );
      if (!response.ok) throw new Error('Failed to fetch columns');
      return response.json();
    },
    placeholderData: keepPreviousData,
  });

  // Query for rows with pagination
  const rowsQuery = useQuery({
    queryKey: [wsId, datasetId, 'rows', { currentPage, pageSize }],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/workspaces/${wsId}/datasets/${datasetId}/rows?` +
          new URLSearchParams({
            page: currentPage.toString(),
            pageSize,
          })
      );
      if (!response.ok) throw new Error('Failed to fetch rows');
      return response.json();
    },
    placeholderData: keepPreviousData,
  });

  const headers = columnsQuery.data?.map((col: any) => col.name) || [];
  const { data, totalRows = 0 } = rowsQuery.data || {};
  const totalPages = Math.ceil(totalRows / parseInt(pageSize));

  const handlePageSizeChange = (value: string) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    columnsQuery.refetch();
    rowsQuery.refetch();
  };

  const handleAddRow = async () => {
    try {
      const response = await fetch(
        `/api/v1/workspaces/${wsId}/datasets/${datasetId}/rows`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: [newRow] }),
        }
      );

      if (response.ok) {
        setIsAddingRow(false);
        setNewRow({});
        // Invalidate rows query to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['rows'] });
      }
    } catch (error) {
      console.error('Error adding row:', error);
    }
  };

  // Similar updates for handleEditRow and handleDeleteRow
  const handleEditRow = async () => {
    try {
      const response = await fetch(
        `/api/v1/workspaces/${wsId}/datasets/${datasetId}/rows`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rowId: editingRow.id, row: editingRow }),
        }
      );

      if (response.ok) {
        setEditingRow(null);
        queryClient.invalidateQueries({ queryKey: ['rows'] });
      }
    } catch (error) {
      console.error('Error editing row:', error);
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    try {
      const response = await fetch(
        `/api/v1/workspaces/${wsId}/datasets/${datasetId}/rows`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rowId }),
        }
      );

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['rows'] });
      }
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };

  const TableContent = () => {
    if (!headers.length) {
      return (
        <div className="flex h-64 flex-col items-center justify-center">
          <p className="text-muted-foreground text-sm">
            {t('ws-datasets.no_data')}
          </p>
          <Button variant="outline" onClick={handleRefresh} className="mt-4">
            {t('common.refresh')}
          </Button>
        </div>
      );
    }

    return (
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                {headers.map((header: any, index: number) => (
                  <th key={index} className="p-2 text-left text-sm">
                    {header}
                  </th>
                ))}
                <th className="p-2 text-left text-sm">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rowsQuery.isPlaceholderData && data.length > 0
                ? // Show skeleton rows while loading with existing data
                  Array.from({ length: parseInt(pageSize) }).map(
                    (_, rowIndex) => (
                      <tr key={`skeleton-${rowIndex}`} className="border-b">
                        {headers.map((_: any, colIndex: number) => (
                          <td key={colIndex} className="p-2">
                            <Skeleton className="h-9 w-full" />
                          </td>
                        ))}
                        <td className="flex gap-2 p-2">
                          <Skeleton className="h-9 w-full" />
                          <Skeleton className="h-9 w-full" />
                        </td>
                      </tr>
                    )
                  )
                : data.map((row: any, rowIndex: number) => (
                    <tr key={rowIndex} className="border-b">
                      {headers.map((header: any, colIndex: number) => (
                        <td key={colIndex} className="p-2 text-sm">
                          {row[header]}
                        </td>
                      ))}
                      <td className="flex gap-2 p-2 text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingRow(row)}
                        >
                          {t('common.edit')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRow(row.id)}
                        >
                          {t('common.delete')}
                        </Button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const getPageHref = (page: number) => {
    return `#page=${page}`;
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {t('common.rows-per-page')}:
          </span>
          <Select value={pageSize} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            {t('common.refresh')}
          </Button>
          <Dialog open={isAddingRow} onOpenChange={setIsAddingRow}>
            <DialogTrigger asChild>
              <Button variant="outline">{t('ws-datasets.add_row')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('ws-datasets.add_row')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {headers.map((header: any) => (
                  <div key={header} className="space-y-2">
                    <label className="text-sm font-medium">{header}</label>
                    <Input
                      value={newRow[header] || ''}
                      onChange={(e) =>
                        setNewRow({ ...newRow, [header]: e.target.value })
                      }
                      placeholder={`Enter ${header}`}
                    />
                  </div>
                ))}
                <Button onClick={handleAddRow} className="w-full">
                  {t('common.add')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <DatasetCrawler wsId={wsId} datasetId={datasetId} url={datasetUrl} />
        </div>
      </div>

      {rowsQuery.isFetching && !data?.length ? (
        <div className="flex h-64 items-center justify-center">
          <span className="text-muted-foreground text-sm">
            {t('common.loading')}...
          </span>
        </div>
      ) : (
        <TableContent />
      )}

      {/* Show skeleton pagination when loading but not on first load */}
      {data?.length > 0 && (
        <div className="flex items-center justify-between">
          {rowsQuery.isPending ? (
            <>
              <Skeleton className="h-4 w-64" /> {/* Row count text */}
              <Skeleton className="h-9 w-80" /> {/* Pagination */}
            </>
          ) : (
            <>
              <div className="text-muted-foreground text-sm">
                Showing {(currentPage - 1) * parseInt(pageSize) + 1} to{' '}
                {Math.min(currentPage * parseInt(pageSize), totalRows)} of{' '}
                {totalRows} rows
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={getPageHref(currentPage - 1)}
                      onClick={() => handlePageClick(currentPage - 1)}
                      className={
                        currentPage <= 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, array) => {
                      if (index > 0 && array[index - 1] !== page - 1) {
                        return (
                          <PaginationItem key={`ellipsis-${page}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }

                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageClick(page)}
                            isActive={page === currentPage}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                  {currentPage < totalPages - 1 && (
                    <PaginationItem key={totalPages}>
                      <PaginationLink
                        onClick={() => handlePageClick(totalPages)}
                        isActive={currentPage === totalPages}
                        className="cursor-pointer"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href={getPageHref(currentPage + 1)}
                      onClick={() => handlePageClick(currentPage + 1)}
                      className={
                        currentPage >= totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          )}
        </div>
      )}

      {editingRow && (
        <Dialog open={!!editingRow} onOpenChange={() => setEditingRow(null)}>
          <DialogTrigger asChild>
            <Button variant="outline">{t('ws-datasets.edit_row')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('ws-datasets.edit_row')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {headers.map((header: any) => (
                <div key={header} className="space-y-2">
                  <label className="text-sm font-medium">{header}</label>
                  <Input
                    value={editingRow[header] || ''}
                    onChange={(e) =>
                      setEditingRow({ ...editingRow, [header]: e.target.value })
                    }
                    placeholder={`Enter ${header}`}
                  />
                </div>
              ))}
              <Button onClick={handleEditRow} className="w-full">
                {t('common.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
