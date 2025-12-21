import { Prisma } from '@prisma/client';

export interface RAFilter {
  [key: string]: any;
}

export interface RASort {
  field: string;
  order: 'ASC' | 'DESC';
}

export interface RARange {
  start: number;
  end: number;
}

export interface RAListParams {
  filter?: RAFilter;
  sort?: RASort;
  range?: RARange;
}

export interface RAListResult<T> {
  data: T[];
  total: number;
  contentRange: string;
}

/**
 * Parse React Admin query parameters
 */
export function parseRAQuery(query: any): RAListParams {
  const filter = query.filter ? JSON.parse(query.filter) : {};
  const sort = query.sort ? JSON.parse(query.sort) : undefined;
  const range = query.range ? JSON.parse(query.range) : undefined;

  return { filter, sort, range };
}

/**
 * Build Prisma where clause from RA filter
 */
export function buildWhereClause(filter: RAFilter): Prisma.Enumerable<any> {
  const where: any = {};

  for (const [key, value] of Object.entries(filter)) {
    if (value === null || value === undefined) {
      continue;
    }

    // Handle special operators
    if (key === 'q') {
      // Search query - will be handled separately
      continue;
    }

    if (key === 'id') {
      // Handle array of IDs (for bulk operations)
      if (Array.isArray(value)) {
        where.id = { in: value };
      } else {
        where.id = value;
      }
      continue;
    }

    // Handle date ranges
    if (key.endsWith('_gte') || key.endsWith('_lte')) {
      const field = key.replace(/_gte$|_lte$/, '');
      if (!where[field]) {
        where[field] = {};
      }
      if (key.endsWith('_gte')) {
        where[field].gte = new Date(value);
      } else {
        where[field].lte = new Date(value);
      }
      continue;
    }

    // Handle contains (for string search)
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      where[key] = value;
    } else {
      where[key] = value;
    }
  }

  return where;
}

/**
 * Build Prisma orderBy from RA sort
 */
export function buildOrderBy(sort?: RASort): any {
  if (!sort) {
    return { createdAt: 'desc' };
  }

  return {
    [sort.field]: sort.order.toLowerCase(),
  };
}

/**
 * Build Prisma skip/take from RA range
 */
export function buildPagination(range?: RARange): { skip: number; take: number } {
  if (!range) {
    return { skip: 0, take: 25 }; // Default pagination
  }

  const skip = range.start;
  const take = range.end - range.start + 1;

  return { skip, take };
}

/**
 * Build Content-Range header value
 */
export function buildContentRange(
  start: number,
  end: number,
  total: number,
  resource: string = 'items',
): string {
  return `${resource} ${start}-${end}/${total}`;
}

/**
 * Apply search query (q) to where clause
 * Supports searching in multiple fields
 */
export function applySearchQuery(
  where: any,
  searchQuery: string,
  searchFields: string[],
): any {
  if (!searchQuery || searchFields.length === 0) {
    return where;
  }

  const searchConditions = searchFields.map((field) => ({
    [field]: {
      contains: searchQuery,
      mode: 'insensitive' as const,
    },
  }));

  return {
    ...where,
    OR: searchConditions,
  };
}

/**
 * Main helper function to build Prisma query from RA params
 */
export function buildPrismaQuery<T>(
  params: RAListParams,
  searchFields: string[] = [],
): {
  where: any;
  orderBy: any;
  skip: number;
  take: number;
} {
  const where = buildWhereClause(params.filter || {});
  
  // Apply search query if present
  const finalWhere = params.filter?.q
    ? applySearchQuery(where, params.filter.q, searchFields)
    : where;

  return {
    where: finalWhere,
    orderBy: buildOrderBy(params.sort),
    ...buildPagination(params.range),
  };
}

