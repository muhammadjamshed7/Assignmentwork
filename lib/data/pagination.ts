import { PaginatedResult, PaginationOptions } from "@/lib/data/types";

const DEFAULT_PAGE_SIZE = 10;

export function getPaginationRange(options: PaginationOptions = {}) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.max(1, options.pageSize ?? DEFAULT_PAGE_SIZE);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { page, pageSize, from, to };
}

export function toPaginatedResult<T>(
  items: T[],
  count: number | null,
  options: ReturnType<typeof getPaginationRange>
): PaginatedResult<T> {
  return {
    items,
    total: count ?? items.length,
    page: options.page,
    pageSize: options.pageSize,
  };
}
