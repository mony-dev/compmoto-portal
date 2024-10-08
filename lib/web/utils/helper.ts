import { signOut } from "next-auth/react";
import { toast } from "react-toastify";
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
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });
}

export function toastWarning(message: string) {
  toast.warning(message, {
    position: "top-center",
    autoClose: 200,
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
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });
}

export function formatDateRange(startDate: string, endDate: string) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  const month = monthNames[start.getUTCMonth()];
  const endMonth = monthNames[end.getUTCMonth()];


  return `${startDay} ${month}-${endDay} ${endMonth}`;
}

export function formatEndDate(startDate: string, endDate: string, locale: 'en' | 'th') {
  const monthNames = {
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    th: ["มค.", "กพ.", "มีค.", "เมย.", "พค.", "มิย.", "กค.", "สค.", "กย.", "ตค.", "พย.", "ธค."]
  };

  const start = new Date(startDate);
  const end = new Date(endDate);

  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  const endMonth = monthNames[locale][end.getUTCMonth()];
  return `${startDay} - ${endDay} ${endMonth}`;

}

export function formatDate(date: string) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const start = new Date(date);

  const startDay = start.getUTCDate();
  const month = start.getUTCMonth() + 1;
  const year = start.getUTCFullYear();
  return `${startDay}-${month}-${year}`;
}

export function formatDateDiff(date: string) {
  const start = new Date(date);

  const startDay = start.getUTCDate();
  const month = start.getUTCMonth() + 1; // Month as a number (1-12)
  const year = start.getUTCFullYear();

  // Calculate "time ago"
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();

  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average days in a month
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  let timeAgo = '';
  
  if (diffMonths > 0) {
    timeAgo = `${diffMonths} months ago`;
  } else if (diffDays > 0) {
    timeAgo = `${diffDays} days ago`;
  } else if (diffHours > 0) {
    timeAgo = `${diffHours} hours ago`;
  } else if (diffMinutes > 0) {
    timeAgo = `${diffMinutes} minutes ago`;
  } else {
    timeAgo = `just now`;
  }

  return `${startDay}-${month < 10 ? '0' + month : month}-${year} ・ ${timeAgo}`;
}
export function formatDateDiffNumber(date: string) {
  const start = new Date(date);
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();

  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average days in a month
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  let timeAgo = '';
  
  if (diffMonths > 0) {
    timeAgo = `${diffMonths} months ago`;
  } else if (diffDays > 0) {
    timeAgo = `${diffDays} days ago`;
  } else if (diffHours > 0) {
    timeAgo = `${diffHours} hours ago`;
  } else if (diffMinutes > 0) {
    timeAgo = `${diffMinutes} minutes ago`;
  } else {
    timeAgo = `just now`;
  }

  return timeAgo;
}

export function formatDateNumber(date: string) {
  const start = new Date(date);

  const startDay = start.getUTCDate();
  const month = start.getUTCMonth() + 1; // Month as a number (1-12)
  const year = start.getUTCFullYear();

  return `${startDay}-${month < 10 ? '0' + month : month}-${year}`;
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
