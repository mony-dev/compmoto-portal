import { signOut } from "next-auth/react";
import { toast } from "react-toastify";
// import { DataTablePaginated } from "@components/Admin/DataTable/DataTable";
// import BaseResponse from "./responses";
// import { DEFAULT_PAGE_SIZE } from "@lib-shared/params/pagination-params";
// import axios from "@lib-services/axios";
import { AxiosError } from "axios";

export function handleAPIError(error: unknown) {
  let message = "";
  if (error instanceof AxiosError) {
    if (error.message) {
      message = error.message;
    } else {
      message = error.response?.data["error"]["message"];
    }
  } else if (typeof error == "string") {
    message = error;
  }
  toastError(message);
}

export function toastSuccess(message: string) {
  toast.success(message, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });
}

export function toastError(message: string) {
  toast.error(message, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });
}

// export const fetchItemPaginated = async <T>(
//   path: string,
//   pageIndex: number,
//   searchKey: string,
//   sortKey: string,
//   sortOrder: string,
//   pageSize: number = DEFAULT_PAGE_SIZE,
//   additionalParams?: any
// ): Promise<DataTablePaginated<T>> => {
//   const params: { [key: string]: string | number } = {
//     page: pageIndex,
//     per: pageSize,
//   };
//   if (searchKey != "") {
//     params["q"] = searchKey;
//   }
//   if (sortKey != "") {
//     params["orderBy"] = sortKey;
//   }
//   if (sortOrder != "") {
//     params["order"] = sortOrder;
//   }

//   const { data } = await axios.get<BaseResponse<T[]>>(path, {
//     params: { ...params, ...additionalParams },
//   });

//   const currentPageIndex = data.meta.pagination ? (data.meta.pagination.currentPage > 0 ? data.meta.pagination.currentPage - 1 : 0) : 0;
//   const totalPage = data.meta.pagination?.totalPages ? data.meta.pagination?.totalPages : 1;

//   return {
//     items: data.data,
//     pageIndex: currentPageIndex,
//     searchKey,
//     totalPage,
//   };
// };

// export function snakeCaseToTitleCase(s: string): string {
//   return s.replace(/^_*(.)|_+(.)/g, (s, c, d) => (c ? c.toUpperCase() : " " + d.toUpperCase()));
// }

// type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]];

// export type Join<K, P> = K extends string | number ? (P extends string | number ? `${K}${"" extends P ? "" : "."}${P}` : never) : never;

// export type Paths<T, D extends number = 2> = [D] extends [never]
//   ? never
//   : T extends object
//   ? {
//       [K in keyof T]-?: K extends string | number ? `${K}` | Join<K, Paths<T[K], Prev[D]>> : never;
//     }[keyof T]
//   : "";

// export function resolvePath(path: string | string[], obj: any, separator = ".") {
//   const properties = Array.isArray(path) ? path : path.split(separator);
//   return properties.reduce((prev, curr) => prev && prev[curr], obj);
// }

// export function capitalizeFirstLetter(text: string) {
//   return text.charAt(0).toUpperCase() + text.slice(1);
// }
