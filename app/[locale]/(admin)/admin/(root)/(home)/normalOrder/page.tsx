// "use client";
// import dynamic from "next/dynamic";
// import debounce from "lodash.debounce";
// import { formatDate, toastError, toastSuccess } from "@lib-utils/helper";
// import { Badge, Button, Input, Tabs, TabsProps } from "antd";
// import { ColumnsType } from "antd/es/table";
// import axios from "axios";
// import Link from "next/link";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import React, { useCallback, useEffect, useState } from "react";
// import { useCurrentLocale } from "next-i18n-router/client";
// import i18nConfig from "../../../../../../../i18nConfig";
// import { useSession } from "next-auth/react";
// import { useTranslation } from "react-i18next";
// import { useCart } from "@components/Admin/Cartcontext";
// import { CloseCircleOutlined } from "@ant-design/icons";

// const TabContentOrder = dynamic(
//   () => import("@components/Admin/order/TabContentOrder")
// );

// export default function normalOrder({ params }: { params: { id: number } }) {
//   const { t } = useTranslation();
//   const pathname = usePathname();
//   const { setI18nName, setLoadPage, loadPage } = useCart();
//   const [searchText, setSearchText] = useState(() => {
//     // Initialize searchText from query parameter 'q' or default to an empty string
//     const params = new URLSearchParams(window.location.search);
//     return params.get("q") || "";
//   });
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [total, setTotal] = useState(0);
//   const [orderData, setOrderData] = useState<OrderDataType[]>([]);
//   const [invoiceData, setInvoiceData] = useState<OrderDataType[]>([]);
//   const [orderTotal, setOrderTotal] = useState(0);
//   const [invoiceTotal, setInvoiceTotal] = useState(0);
//   const [activeTabKey, setActiveTabKey] = useState("1");
//   const searchParams = useSearchParams();
//   const [triggerData, setTriggerData] = useState(false);

//   const { data: session } = useSession();
//   const locale = useCurrentLocale(i18nConfig);
//   const router = useRouter();

//   interface OrderDataType {
//     key: number;
//     id: number;
//     documentNo: string;
//     externalDocument: string;
//     totalAmount: number;
//     type: string;
//     groupDiscount: number;
//     subTotal: number;
//     totalPrice: number;
//     calculatedSubTotal: number;
//     createdAt: string;
//     date: string;
//     user: {
//       custNo: string;
//       id: number;
//       contactName: string;
//       name: string;
//       saleUser: {
//         custNo: string;
//       };
//     };
//     product: any;
//   }

//   const columns: ColumnsType<OrderDataType> = [
//     {
//       title: t("no"),
//       dataIndex: "key",
//       key: "key",
//       defaultSortOrder: "descend",
//       sorter: (a, b) => b.key - a.key,
//     },
//     {
//       title: t("Document"),
//       dataIndex: "documentNo",
//       key: "documentNo",
//       defaultSortOrder: "descend",
//       sorter: (a, b) => a.documentNo.localeCompare(b.documentNo),
//       render: (_, record) => (
//         <Link href={`/${locale}/admin/normalOrder/${record.id}`}>
//           {record.documentNo}
//         </Link>
//       ),
//     },
//     {
//       title: t("Customer no"),
//       dataIndex: "custNo",
//       key: "custNo",
//       defaultSortOrder: "descend",
//       sorter: (a, b) => a.user.custNo.localeCompare(b.user.custNo),
//       render: (_, record) => <p>{record.user.custNo}</p>,
//     },
//     {
//       title: t("Name"),
//       dataIndex: "custNo",
//       key: "custNo",
//       defaultSortOrder: "descend",
//       sorter: (a, b) => a.user.name.localeCompare(b.user.name),
//       render: (_, record) => <p>{record.user.name}</p>,
//     },
//     {
//       title: t("date"),
//       dataIndex: "date",
//       key: "date",
//       render: (_, record) => <p>{formatDate(record.createdAt)}</p>,
//       sorter: (a, b) =>
//         formatDate(a.createdAt).localeCompare(formatDate(b.createdAt)),
//     },
//     {
//       title: t("Total"),
//       dataIndex: "totalPrice",
//       key: "totalPrice",
//       sorter: (a, b) => a.calculatedSubTotal - b.calculatedSubTotal,
//       render: (_, record) => (
//         <p>
//           {record.calculatedSubTotal.toLocaleString("en-US", {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2,
//           })}
//         </p>
//       ),
//     },
//   ];
//   const columnsInvoice: ColumnsType<OrderDataType> = [
//     {
//       title: t("no"),
//       dataIndex: "key",
//       key: "key",
//       defaultSortOrder: "descend",
//       sorter: (a, b) => b.key - a.key,
//     },
//     {
//       title: t("Document"),
//       dataIndex: "documentNo",
//       key: "documentNo",
//       defaultSortOrder: "descend",
//       sorter: (a, b) => a.documentNo.localeCompare(b.documentNo),
//       render: (_, record) => (
//         <Link href={`/${locale}/admin/invoice/${record.id}`}>
//           {record.documentNo}
//         </Link>
//       ),
//     },
//     {
//       title: t("Customer no"),
//       dataIndex: "custNo",
//       key: "custNo",
//       defaultSortOrder: "descend",
//       sorter: (a, b) => a.user.custNo.localeCompare(b.user.custNo),
//       render: (_, record) => <p>{record.user.custNo}</p>,
//     },
//     {
//       title: t("Name"),
//       dataIndex: "custNo",
//       key: "custNo",
//       defaultSortOrder: "descend",
//       sorter: (a, b) => a.user.name.localeCompare(b.user.name),
//       render: (_, record) => <p>{record.user.name}</p>,
//     },
//     {
//       title: t("date"),
//       dataIndex: "date",
//       key: "date",
//       render: (_, record) => <p>{formatDate(record.date)}</p>,
//       sorter: (a, b) =>
//         formatDate(a.date).localeCompare(formatDate(b.date)),
//     },
//     {
//       title: t("Total"),
//       dataIndex: "totalPrice",
//       key: "totalPrice",
//       sorter: (a, b) => a.totalPrice - b.totalPrice,
//       render: (_, record) => (
//         <p>
//           {record.totalPrice.toLocaleString("en-US", {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2,
//           })}
//         </p>
//       ),
//     },
//   ];

//   // Debounce function for search input
//   const debouncedFetchData = useCallback(
//     debounce(() => {
//       fetchData(searchText);
//     }, 500), // 500 ms debounce delay
//     [currentPage, pageSize, activeTabKey, triggerData]
//   );

//   useEffect(() => {
//     const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
//     setI18nName(lastPart);

//     // Call the debounced fetch function
//     debouncedFetchData();

//     // Cleanup debounce on unmount
//     return () => {
//       debouncedFetchData.cancel();
//     };
//   }, [currentPage, debouncedFetchData]);

//   useEffect(() => {
//     // Update the URL with the search query
//     const queryParams = new URLSearchParams(searchParams.toString());
//     if (searchText) {
//       queryParams.set("q", searchText);
//     } else {
//       queryParams.delete("q");
//     }
//     const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
//     // @ts-ignore: TypeScript error explanation or ticket reference
//     router.push(newUrl, undefined, { shallow: true });
//   }, [searchText]);

//   async function fetchData(query: string = "") {
//     setLoadPage(true);
//     if (session?.user?.id) {
//       try {
//         // Make both API requests concurrently
//         const [invoiceResponse, orderResponse] = await Promise.all([
//           axios.get(`/api/invoice`, {
//             params: {
//               q: searchText,
//               userId: session.user.id,
//               page: currentPage,
//               pageSize: pageSize,
//             },
//           }),
//           axios.get(`/api/order`, {
//             params: {
//               q: searchText,
//               type: "Normal",
//               userId: session.user.id,
//               page: currentPage,
//               pageSize: pageSize,
//             },
//           }),
//         ]);

//         // Process the response from `/api/adminInvoice`
//         const invoiceOrderDataWithKeys = invoiceResponse.data.orders.map(
//           (order: any, index: number) => ({
//             ...order,
//             key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
//           })
//         );
//         setInvoiceData(invoiceOrderDataWithKeys);
//         setInvoiceTotal(invoiceResponse.data.total);
//         setTotal(invoiceResponse.data.total);

//         const orderDataWithKeys = orderResponse.data.orders.map(
//           (order: any, index: number) => {
//             // Initialize a variable to store the calculated subTotal for each order
//             let calculatedSubTotal = 0;

//             // Iterate through each item in the order
//             order.items.forEach((item: any) => {
//               if (item.year === null) {
//                 // If the item has no year
//                 const yearDiscount = (item.price * item.discount) / 100;
//                 calculatedSubTotal += item.price - yearDiscount;
//               } else {
//                 // If the item has a year, calculate the discount and subtract it from the subTotal
//                 calculatedSubTotal += item.discountPrice;
//               }
//             });
//             // Return the order with the new subTotal and a unique key
//             return {
//               ...order,
//               calculatedSubTotal: calculatedSubTotal, // Add the calculated subTotal to each order
//               key: index + 1 + (currentPage - 1) * pageSize, // Ensure unique keys across pages
//             };
//           }
//         );
//         setOrderData(orderDataWithKeys);
//         setOrderTotal(orderResponse.data.total);
//         setTotal(orderResponse.data.total);
//       } catch (error: any) {
//         toastError(error);
//       } finally {
//         setLoadPage(false);
//       }
//     } else {
//       console.warn(t("User ID is undefined. Cannot fetch orders"));
//     }
//   }

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchText(e.target.value);
//   };

//   const handleSearch = (value: string) => {
//     setSearchText(value);
//     fetchData(value); // Trigger data fetch only on search
//   };
//   const handleClear = () => {
//     setSearchText(""); // Clear the input
//     fetchData(""); // Reset the list to show all data
//   };

//   return (
//     <div className="px-4">
//       <div
//         className="py-8 px-8 rounded-lg flex flex-col bg-white"
//         style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
//       >
//         <div className="text-lg pb-4 default-font">
//           <div className="flex">
//             <p className="text-lg font-semibold pb-4 grow">
//               {t("Normal Order")}
//             </p>
//             <Input.Search
//               placeholder={t("search")}
//               size="middle"
//               style={{ width: "200px", marginBottom: "20px" }}
//               value={searchText}
//               onSearch={handleSearch}
//               onChange={handleInputChange}
//               suffix={
//                 searchText ? (
//                   <CloseCircleOutlined
//                     onClick={handleClear}
//                     style={{ cursor: "pointer" }}
//                   />
//                 ) : null
//               }
//             />
//             {activeTabKey === "2" && (
//               // <Button
//               //   className="bg-comp-red button-backend ml-4"
//               //   type="primary"
//               //   icon={<ArrowPathIcon className="w-4" />}
//               //   loading={isSyncing} // Add loading prop
//               //   onClick={async () => {
//               //     try {
//               //       await syncAndProcessInvoices(); // Call the async function
//               //     } catch (error: any) {
//               //       toastError(error); // Handle the error
//               //     }
//               //   }}
//               // >
//               //   {t("Sync")}
//               // </Button>
//               ""
//             )}
//           </div>
//           <TabContentOrder
//             columns={columns}
//             columnsInvoice={columnsInvoice}
//             data={orderData}
//             invoiceData={invoiceData}
//             setCurrentPage={setCurrentPage}
//             currentPage={currentPage}
//             setPageSize={setPageSize}
//             pageSize={pageSize}
//             invoiceTotal={invoiceTotal}
//             orderTotal={orderTotal}
//             activeTabKey={activeTabKey}
//             setActiveTabKey={setActiveTabKey}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import dynamic from "next/dynamic";
import { formatDate, toastError } from "@lib-utils/helper";
import { Spin, Input } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { useCart } from "@components/Admin/Cartcontext";
import { CloseCircleOutlined } from "@ant-design/icons";

const TabContentOrder = dynamic(
  () => import("@components/Admin/order/TabContentOrder")
);

export default function NormalOrder({ params }: { params: { id: number } }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { setI18nName, setLoadPage, loadPage } = useCart();
  const { data: session } = useSession();
  const locale = useCurrentLocale(i18nConfig);

  interface OrderDataType {
    key: number;
    id: number;
    documentNo: string;
    externalDocument: string;
    totalAmount: number;
    type: string;
    groupDiscount: number;
    subTotal: number;
    totalPrice: number;
    calculatedSubTotal: number;
    createdAt: string;
    date: string;
    user: {
      custNo: string;
      id: number;
      contactName: string;
      name: string;
      saleUser: {
        custNo: string;
      };
    };
    product: any;
  }

  // ✅ init searchText from URL (safe)
  const initialQ = useMemo(() => searchParams.get("q") || "", [searchParams]);
  const [searchText, setSearchText] = useState(initialQ);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [orderData, setOrderData] = useState<OrderDataType[]>([]);
  const [invoiceData, setInvoiceData] = useState<OrderDataType[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [activeTabKey, setActiveTabKey] = useState("1");

  // ✅ Abort in-flight requests to prevent overlap
  const abortRef = useRef<AbortController | null>(null);

  const columns: ColumnsType<OrderDataType> = [
    {
      title: t("no"),
      dataIndex: "key",
      key: "key",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.key - a.key,
    },
    {
      title: t("Document"),
      dataIndex: "documentNo",
      key: "documentNo",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.documentNo.localeCompare(b.documentNo),
      render: (_, record) => (
        <Link href={`/${locale}/admin/normalOrder/${record.id}`}>
          {record.documentNo}
        </Link>
      ),
    },
    {
      title: t("Customer no"),
      dataIndex: "custNo",
      key: "custNo",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.user.custNo.localeCompare(b.user.custNo),
      render: (_, record) => <p>{record.user.custNo}</p>,
    },
    {
      title: t("Name"),
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.user.name.localeCompare(b.user.name),
      render: (_, record) => <p>{record.user.name}</p>,
    },
    {
      title: t("date"),
      dataIndex: "date",
      key: "date",
      render: (_, record) => <p>{formatDate(record.createdAt)}</p>,
      sorter: (a, b) =>
        formatDate(a.createdAt).localeCompare(formatDate(b.createdAt)),
    },
    {
      title: t("Total"),
      dataIndex: "totalPrice",
      key: "totalPrice",
      sorter: (a, b) => a.calculatedSubTotal - b.calculatedSubTotal,
      render: (_, record) => (
        <p>
          {record.calculatedSubTotal.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      ),
    },
  ];

  const columnsInvoice: ColumnsType<OrderDataType> = [
    {
      title: t("no"),
      dataIndex: "key",
      key: "key",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.key - a.key,
    },
    {
      title: t("Document"),
      dataIndex: "documentNo",
      key: "documentNo",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.documentNo.localeCompare(b.documentNo),
      render: (_, record) => (
        <Link href={`/${locale}/admin/invoice/${record.id}`}>
          {record.documentNo}
        </Link>
      ),
    },
    {
      title: t("Customer no"),
      dataIndex: "custNo",
      key: "custNo",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.user.custNo.localeCompare(b.user.custNo),
      render: (_, record) => <p>{record.user.custNo}</p>,
    },
    {
      title: t("Name"),
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.user.name.localeCompare(b.user.name),
      render: (_, record) => <p>{record.user.name}</p>,
    },
    {
      title: t("date"),
      dataIndex: "date",
      key: "date",
      render: (_, record) => <p>{formatDate(record.date)}</p>,
      sorter: (a, b) => formatDate(a.date).localeCompare(formatDate(b.date)),
    },
    {
      title: t("Total"),
      dataIndex: "totalPrice",
      key: "totalPrice",
      sorter: (a, b) => a.totalPrice - b.totalPrice,
      render: (_, record) => (
        <p>
          {record.totalPrice.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      ),
    },
  ];

  // ✅ fetchData with abort + stable parameters
  async function fetchData(query: string) {
    if (!session?.user?.id) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoadPage(true);
    try {
      // ✅ NOTE: หน้านี้ใช้ /api/invoice และ /api/order
      const [invoiceResponse, orderResponse] = await Promise.all([
        axios.get(`/api/invoice`, {
          params: {
            q: query,
            userId: session.user.id,
            page: currentPage,
            pageSize,
          },
          signal: controller.signal,
        }),
        axios.get(`/api/order`, {
          params: {
            q: query,
            type: "Normal",
            userId: session.user.id,
            page: currentPage,
            pageSize,
          },
          signal: controller.signal,
        }),
      ]);

      const invoiceRows = (invoiceResponse.data.orders ?? []).map(
        (row: any, index: number) => ({
          ...row,
          key: index + 1 + (currentPage - 1) * pageSize,
        })
      );

      setInvoiceData(invoiceRows);
      setInvoiceTotal(invoiceResponse.data.total ?? 0);

      const orderRows = (orderResponse.data.orders ?? []).map(
        (order: any, index: number) => {
          let calculatedSubTotal = 0;
          (order.items ?? []).forEach((item: any) => {
            if (item.year === null) {
              const yearDiscount = (item.price * item.discount) / 100;
              calculatedSubTotal += item.price - yearDiscount;
            } else {
              calculatedSubTotal += item.discountPrice;
            }
          });

          return {
            ...order,
            calculatedSubTotal,
            key: index + 1 + (currentPage - 1) * pageSize,
          };
        }
      );

      setOrderData(orderRows);
      setOrderTotal(orderResponse.data.total ?? 0);
    } catch (error: any) {
      if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;
      toastError(error);
    } finally {
      setLoadPage(false);
    }
  }

  // ✅ setI18nName once per pathname change
  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);
  }, [pathname, setI18nName]);

  // ✅ debounced fetch (single source of truth)
  useEffect(() => {
    if (!session?.user?.id) return;

    const timer = setTimeout(() => {
      fetchData(searchText);
    }, 500);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, currentPage, pageSize, activeTabKey, session?.user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // ✅ update URL only; do NOT call fetchData here (effect will do)
  const handleSearch = (value: string) => {
    setCurrentPage(1);
    setSearchText(value);

    const queryParams = new URLSearchParams(searchParams.toString());
    if (value) queryParams.set("q", value);
    else queryParams.delete("q");

    const newUrl = `${pathname}?${queryParams.toString()}`;
    window.history.replaceState(null, "", newUrl);
  };

  const handleClear = () => {
    window.history.replaceState(null, "", `${pathname}`);
    setCurrentPage(1);
    setSearchText("");
  };

  return (
    <div className="px-4">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="text-lg pb-4 default-font">
          <div className="flex">
            <p className="text-lg font-semibold pb-4 grow">
              {t("Normal Order")}
            </p>

            <Input.Search
              placeholder={t("search")}
              size="middle"
              style={{ width: "200px", marginBottom: "20px" }}
              value={searchText}
              onSearch={handleSearch}
              onChange={handleInputChange}
              suffix={
                <CloseCircleOutlined
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleClear}
                  style={{
                    cursor: searchText ? "pointer" : "default",
                    opacity: searchText ? 1 : 0,
                    pointerEvents: searchText ? "auto" : "none",
                    transition: "opacity 120ms ease",
                  }}
                  tabIndex={-1}
                />
              }
            />
          </div>

          <Spin spinning={loadPage}>
            <TabContentOrder
              columns={columns}
              columnsInvoice={columnsInvoice}
              data={orderData}
              invoiceData={invoiceData}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
              setPageSize={setPageSize}
              pageSize={pageSize}
              invoiceTotal={invoiceTotal}
              orderTotal={orderTotal}
              activeTabKey={activeTabKey}
              setActiveTabKey={setActiveTabKey}
            />
          </Spin>
        </div>
      </div>
    </div>
  );
}
