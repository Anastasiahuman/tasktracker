export interface RAQueryParams {
  filter?: Record<string, any>;
  sort?: { field: string; order: 'ASC' | 'DESC' };
  range?: { start: number; end: number };
}

export interface PrismaQuery {
  where?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
}

export function parseRAQuery(query: any): RAQueryParams {
  const params: RAQueryParams = {};

  // Parse filter
  if (query.filter) {
    try {
      params.filter = typeof query.filter === 'string' ? JSON.parse(query.filter) : query.filter;
    } catch {
      params.filter = query.filter;
    }
  }

  // Parse sort
  if (query.sort) {
    try {
      const sort = typeof query.sort === 'string' ? JSON.parse(query.sort) : query.sort;
      params.sort = {
        field: sort[0] || 'createdAt',
        order: sort[1] === 'DESC' ? 'DESC' : 'ASC',
      };
    } catch {
      params.sort = { field: 'createdAt', order: 'ASC' };
    }
  }

  // Parse range
  if (query.range) {
    try {
      const range = typeof query.range === 'string' ? JSON.parse(query.range) : query.range;
      params.range = {
        start: range[0] || 0,
        end: range[1] || 24,
      };
    } catch {
      params.range = { start: 0, end: 24 };
    }
  }

  return params;
}

export function buildPrismaQuery(params: RAQueryParams, allowedFields: string[] = []): PrismaQuery {
  const query: PrismaQuery = {};

  // Build where clause
  if (params.filter) {
    const where: any = {};
    for (const [key, value] of Object.entries(params.filter)) {
      if (allowedFields.length === 0 || allowedFields.includes(key)) {
        if (key === 'q') {
          // Search query - skip, handled separately
          continue;
        }
        where[key] = value;
      }
    }
    if (Object.keys(where).length > 0) {
      query.where = where;
    }
  }

  // Build orderBy
  if (params.sort) {
    query.orderBy = {
      [params.sort.field]: params.sort.order.toLowerCase(),
    };
  } else {
    query.orderBy = { createdAt: 'desc' };
  }

  // Build pagination
  if (params.range) {
    query.skip = params.range.start;
    query.take = params.range.end - params.range.start + 1;
  }

  return query;
}

export function buildContentRange(start: number, end: number, total: number, resource: string): string {
  return `${resource} ${start}-${end}/${total}`;
}


