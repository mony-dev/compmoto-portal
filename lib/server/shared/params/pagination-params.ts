import { number, object, string, z } from "zod";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;

export const paginationParams = object({
  page: z
    .union([string(), number()])
    .default(DEFAULT_PAGE)
    .transform((item) => Number(item)),
  pageSize: z
    .union([string(), number()])
    .default(DEFAULT_PAGE_SIZE)
    .transform((item) => Number(item)),
});

export type PaginationParams = z.infer<typeof paginationParams>;
