"use client";
import dynamic from "next/dynamic";
import debounce from "lodash.debounce";
import {
  formatDate,
  toastError,
  toastSuccess,
} from "@lib-utils/helper";
import {
  Badge,
  Button,
  Input,
  Tabs,
  TabsProps,
} from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { useCart } from "@components/Admin/Cartcontext";
import { CloseCircleOutlined } from "@ant-design/icons";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
const Loading = dynamic(() => import("@components/Loading"));
const TabContentOrder = dynamic(() => import("@components/Admin/order/TabContentOrder"));

// export default function normalOrder({ params }: { params: { id: number } }) {
//   const { t } = useTranslation();
//   const pathname = usePathname();
//   const { setI18nName, setLoadPage, loadPage } = useCart();
//   const [searchText, setSearchText] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [total, setTotal] = useState(0);
//   const [orderData, setOrderData] = useState<OrderDataType[]>([]);
//   const [triggerOrder, setTriggerOrder] = useState(false);
//   const [orderTotal, setOrderTotal] = useState(0);
//   const [invoiceTotal, setInvoiceTotal] = useState(0);


//   const locale = useCurrentLocale(i18nConfig);
//   const { data: session } = useSession();
//   const [activeTabKey, setActiveTabKey] = useState("1");

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
//     createdAt: string;
//     user: {
//       custNo: string;
//       name: string;
//       id: number;
//       contactName: string;
//     };
//     product: any;
//   }

//   const handlePageChange = (page: number, pageSize?: number) => {
//     setCurrentPage(page);
//     if (pageSize) {
//       setPageSize(pageSize);
//     }
//   };
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
//         <Link href={`/${locale}/admin/normalOrder/${record.id}`}>{record.documentNo}</Link>
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
//         <Link href={`/${locale}/admin/invoice/${record.id}`}>{record.documentNo}</Link>
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

//   const items: TabsProps["items"] = [
//     {
//       key: "1",
//       label: (
//         <Badge
//           className="redeem-badge default-font"
//           count={orderTotal}
//           offset={[15, 1]}
//         >
//           <p>{t("Sale Quotes")}</p>
//         </Badge>
//       ),
//       children:  <DataTable
//       columns={columns}
//       data={orderData}
//       total={total}
//       currentPage={currentPage}
//       pageSize={pageSize}
//       onPageChange={handlePageChange}
//     />,
//     },
//     {
//       key: "2",
//       label: (
//         <Badge className="redeem-badge default-font" count={invoiceTotal} offset={[15, 1]}>
//           <p>{t("Invoice")}</p>
//         </Badge>
//       ),
//       children: <DataTable
//       columns={columnsInvoice}
//       data={orderData}
//       total={total}
//       currentPage={currentPage}
//       pageSize={pageSize}
//       onPageChange={handlePageChange}
//     />,
//     },
//   ];

//   useEffect(() => {
//     const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
//     setI18nName(lastPart);
    
//     // Fetch both orders and invoices data on initial load
//     fetchData(false); // Fetch normal orders data
//     fetchData(true);  // Fetch invoices data
//   }, [searchText, currentPage, pageSize]); // Removed `activeTabKey` from dependencies
  
//   useEffect(() => {
//     // Fetch data based on the active tab whenever activeTabKey changes
//     if (activeTabKey === "1") {
//       fetchData(false); // Fetch incomplete data (Normal Orders)
//     } else if (activeTabKey === "2") {
//       fetchData(true); // Fetch complete data (Invoices)
//     }
//   }, [activeTabKey]); // Separate useEffect for activeTabKey changes
  
//   async function fetchData(isInvoice: boolean) {
//     setLoadPage(true);
//     if (session?.user?.id) {
//       if (isInvoice) {
//         try {
//           const { data } = await axios.get(`/api/invoice`, {
//             params: {
//               q: searchText,
//               userId: session.user.id,
//               page: currentPage,
//               pageSize: pageSize,
//             },
//           });
    
//           const orderDataWithKeys = data.orders.map(
//             (order: any, index: number) => ({
//               ...order,
//               key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
//             })
//           );
//           setOrderData(orderDataWithKeys);
//           setInvoiceTotal(orderDataWithKeys.length);
//           setTotal(data.total);
//         } catch (error: any) {
//           toastError(error);
//         } finally {
//           setLoadPage(false);
//         }
//       } else {
//         try {
//           const { data } = await axios.get(`/api/order`, {
//             params: {
//               q: searchText,
//               type: 'Normal',
//               userId: session.user.id,
//               page: currentPage,
//               pageSize: pageSize,
//             },
//           });
    
//           const orderDataWithKeys = data.orders.map(
//             (order: any, index: number) => ({
//               ...order,
//               key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
//             })
//           );
//           setOrderData(orderDataWithKeys);
//           setOrderTotal(orderDataWithKeys.length);
//           setTotal(data.total);
//         } catch (error: any) {
//           toastError(error);
//         } finally {
//           setLoadPage(false);
//         }
//       }
 
//     } else {
//       console.warn(t("User ID is undefined. Cannot fetch orders"));
//     }
   
//   }
//   const onChange = (key: string) => {
//     setActiveTabKey(key); // Update active tab state
//   };

//   if (loadPage || !t) {
//     return <Loading />;
//   }
//   return (
//     <div className="px-4">
//       <div
//         className="py-8 px-8 rounded-lg flex flex-col bg-white"
//         style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
//       >
//         <div className="flex justify-end items-center">
//           <p className="text-lg font-semibold pb-4 grow">{t("Normal Order")}</p>
//           <div className="flex">
//             <Input.Search
//               placeholder={t("Search")}
//               size="middle"
//               onChange={(e) => setSearchText(e.target.value)}
//               style={{ width: "200px", marginBottom: "20px" }}
//               value={searchText}
//             />
//           </div>
//         </div>
//         <Tabs
//           activeKey={activeTabKey}
//           items={items}
//           onChange={onChange}
//           className="redeem-tab"
//         />
//       </div>
//     </div>
//   );
// }

export default function normalOrder({ params }: { params: { id: number } }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const [searchText, setSearchText] = useState(() => {
    // Initialize searchText from query parameter 'q' or default to an empty string
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [orderData, setOrderData] = useState<OrderDataType[]>([]);
  const [invoiceData, setInvoiceData] = useState<OrderDataType[]>([]);
  const [triggerOrder, setTriggerOrder] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [activeTabKey, setActiveTabKey] = useState("1");
  const [isSyncing, setIsSyncing] = useState(false);
  const searchParams = useSearchParams();

  const { data: session } = useSession();
  const locale = useCurrentLocale(i18nConfig);
  const router = useRouter();

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
    createdAt: string;
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
        <Link href={`/${locale}/admin/normalOrder/${record.id}`}>{record.documentNo}</Link>
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
      dataIndex: "custNo",
      key: "custNo",
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
        <Link href={`/${locale}/admin/invoice/${record.id}`}>{record.documentNo}</Link>
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
      dataIndex: "custNo",
      key: "custNo",
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

  // Debounce function for search input
  const debouncedFetchData = useCallback(
    debounce(() => {
      fetchData(searchText);
    }, 500), // 500 ms debounce delay
    [currentPage, pageSize]
  );

  
  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);

    // Call the debounced fetch function
    debouncedFetchData();

    // Cleanup debounce on unmount
    return () => {
      debouncedFetchData.cancel();
    };
  }, [currentPage, debouncedFetchData]);

  useEffect(() => {
    // Update the URL with the search query
    const queryParams = new URLSearchParams(searchParams.toString());
    if (searchText) {
      queryParams.set("q", searchText);
    } else {
      queryParams.delete("q");
    }
    const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
    // @ts-ignore: TypeScript error explanation or ticket reference
    router.push(newUrl, undefined, { shallow: true });
  }, [searchText]);

  async function fetchData(query: string = "") {
    setLoadPage(true);
    if (session?.user?.id) {
      try {
        // Make both API requests concurrently
        const [invoiceResponse, orderResponse] = await Promise.all([
          axios.get(`/api/invoice`, {
            params: {
              q: searchText,
              userId: session.user.id,
              page: currentPage,
              pageSize: pageSize,
            },
          }),
          axios.get(`/api/order`, {
            params: {
              q: searchText,
              type: 'Normal',
              userId: session.user.id,
              page: currentPage,
              pageSize: pageSize,
            },
          }),
        ]);
      
        // Process the response from `/api/adminInvoice`
        const invoiceOrderDataWithKeys = invoiceResponse.data.orders.map(
          (order: any, index: number) => ({
            ...order,
            key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
          })
        );
        setInvoiceData(invoiceOrderDataWithKeys);
        setInvoiceTotal(invoiceResponse.data.total);
        setTotal(invoiceResponse.data.total);
      
        // Process the response from `/api/adminOrder`
        const orderDataWithKeys = orderResponse.data.orders.map(
          (order: any, index: number) => ({
            ...order,
            key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
          })
        );
        setOrderData(orderDataWithKeys);
        setOrderTotal(orderResponse.data.total);
        setTotal(orderResponse.data.total);
      
      } catch (error: any) {
        toastError(error);
      } finally {
        setLoadPage(false);
      }
     
    } else {
      console.warn(t("User ID is undefined. Cannot fetch orders"));
    }
  }


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchData(value); // Trigger data fetch only on search
  };
  const handleClear = () => {
    setSearchText(""); // Clear the input
    fetchData(""); // Reset the list to show all data
  };

  if (loadPage || !t) {
    return <Loading />;
  }

  return (
    <div className="px-4">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="text-lg pb-4 default-font">
          <div className="flex">
            <p className="text-lg font-semibold pb-4 grow">{t("Normal Order")}</p>
            <Input.Search
              placeholder={t("search")}
              size="middle"
              style={{ width: "200px", marginBottom: "20px" }}
              value={searchText}
              onSearch={handleSearch}
              onChange={handleInputChange}
              suffix={
                searchText ? (
                  <CloseCircleOutlined
                    onClick={handleClear}
                    style={{ cursor: "pointer" }}
                  />
                ) : null
              }
            />
            <Button
              className="bg-comp-red button-backend ml-4"
              type="primary"
              icon={<ArrowPathIcon className="w-4" />}
              loading={isSyncing} // Add loading prop
              onClick={async () => {
                setIsSyncing(true); // Set loading to true when the button is clicked
                try {
                  const response = await axios.get("/api/fetchInvoices");
                  toastSuccess(t("Sync invoice successfully"));
                  setActiveTabKey('2');
                } catch (error: any) {
                  toastError(error);
                } finally {
                  setIsSyncing(false); // Set loading to false after the request completes
                }
              }}
            >
              {t("Sync")}
            </Button>
          </div>
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
          />
        </div>

     
      </div>
    </div>
  );
}