import { PaginationResult } from "../interfaces";

export const paginate = async <T>(
  model: any,               
  page: number = 1,
  limit: number = 10,
  options: any = {}
): Promise<PaginationResult<T>> => {
  page = Number(page);
  limit = Number(limit);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      skip,
      take: limit,
      ...options,
    }),
    model.count({
      where: options.where,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data,
  };
};
