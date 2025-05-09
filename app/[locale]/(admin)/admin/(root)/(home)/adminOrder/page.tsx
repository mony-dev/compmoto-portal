"use client";
import dynamic from "next/dynamic";
import debounce from "lodash.debounce";
import { formatDate, toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Input } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import { useSession } from "next-auth/react";
import { useCart } from "@components/Admin/Cartcontext";
import { useTranslation } from "react-i18next";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { CloseCircleOutlined } from "@ant-design/icons";
const TabContentOrder = dynamic(
  () => import("@components/Admin/order/TabContentOrder")
);

export default function adminOrder({ params }: { params: { id: number } }) {
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
    calculatedSubTotal: number;
    user: {
      custNo: string;
      id: number;
      contactName: string;
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
        <Link href={`/${locale}/admin/adminOrder/${record.id}`}>
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
      sorter: (a, b) => a.user.contactName.localeCompare(b.user.contactName),
      render: (_, record) => <p>{record.user.contactName}</p>,
    },
    {
      title: t("SaleAdmin"),
      dataIndex: "saleAdmin",
      key: "saleAdmin",
      defaultSortOrder: "descend",
      sorter: (a, b) =>
        a.user.saleUser.custNo.localeCompare(b.user.saleUser.custNo),
      render: (_, record) => <p>{record.user?.saleUser?.custNo}</p>,
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
        <Link href={`/${locale}/admin/adminInvoice/${record.id}`}>
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
      sorter: (a, b) => a.user.contactName.localeCompare(b.user.contactName),
      render: (_, record) => <p>{record.user.contactName}</p>,
    },
    {
      title: t("SaleAdmin"),
      dataIndex: "saleAdmin",
      key: "saleAdmin",
      defaultSortOrder: "descend",
      sorter: (a, b) =>
        a.user.saleUser.custNo.localeCompare(b.user.saleUser.custNo),
      render: (_, record) => <p>{record.user?.saleUser?.custNo}</p>,
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
    [currentPage, pageSize, activeTabKey, triggerOrder]
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
          axios.get(`/api/adminInvoice`, {
            params: {
              q: query,
              userId: session.user.id,
              role: session.user.role,
              page: currentPage,
              pageSize: pageSize,
            },
          }),
          axios.get(`/api/adminOrder`, {
            params: {
              q: query,
              type: "Normal",
              userId: session.user.id,
              role: session.user.role,
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

        const orderDataWithKeys = orderResponse.data.orders.map(
          (order: any, index: number) => {
            // Initialize a variable to store the calculated subTotal for each order
            let calculatedSubTotal = 0;

            // Iterate through each item in the order
            order.items.forEach((item: any) => {
              if (item.year === null) {
                // If the item has no year
                const yearDiscount = (item.price * item.discount) / 100;
                calculatedSubTotal += item.price - yearDiscount;
              } else {
                // If the item has a year, calculate the discount and subtract it from the subTotal
                calculatedSubTotal += item.discountPrice;
              }
            });
            // Return the order with the new subTotal and a unique key
            return {
              ...order,
              calculatedSubTotal: calculatedSubTotal, // Add the calculated subTotal to each order
              key: index + 1 + (currentPage - 1) * pageSize, // Ensure unique keys across pages
            };
          }
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

  const syncAndProcessInvoices = async () => {
    try {
      toastSuccess(
        t("The data synchronization will take a moment, please check back later")
      );

      setIsSyncing(true);
      localStorage.setItem("isSyncing", "true");

      const { data } = await axios.post(`/api/fetchHistory`);
      
      const jobId = data.jobId;
      
      localStorage.setItem("jobId", jobId);

      const checkStatus = setInterval(async () => {
        try {
          const { data } = await axios.get(`/api/fetchHistory`, {
            params: { jobId },
          });
        
          if (data.status === "completed") {
            clearInterval(checkStatus);
            setIsSyncing(false);
            localStorage.removeItem("isSyncing");
            localStorage.removeItem("jobId");
            setTriggerOrder(!triggerOrder)
          } else if (data.status === "failed") {
            clearInterval(checkStatus);
            setIsSyncing(false);
            localStorage.removeItem("isSyncing");
            localStorage.removeItem("jobId");
          }
        } catch (error: any) {
          clearInterval(checkStatus);
          setIsSyncing(false);
          localStorage.removeItem("isSyncing");
          localStorage.removeItem("jobId");
        }
      }, 5000);
    } catch (error: any) {
      setIsSyncing(false);
      localStorage.removeItem("isSyncing");
      localStorage.removeItem("jobId");
    }
  };

  useEffect(() => {
    const storedJobId = localStorage.getItem("jobId");
    const storedSyncState = localStorage.getItem("isSyncing");

    if (storedJobId && storedSyncState === "true") {
      setIsSyncing(true);

      const checkStatus = setInterval(async () => {
        try {
          const { data } = await axios.get(`/api/fetchHistory`, {
            params: { jobId: storedJobId }, // Use the jobId stored in localStorage
          });

          if (data.status === "completed") {
            clearInterval(checkStatus);
            setIsSyncing(false);
            localStorage.removeItem("isSyncing");
            localStorage.removeItem("jobId");
          } else if (data.status === "failed") {
            clearInterval(checkStatus);
            setIsSyncing(false);
            localStorage.removeItem("isSyncing");
            localStorage.removeItem("jobId");
          }
        } catch (error: any) {
          clearInterval(checkStatus);
          setIsSyncing(false);
          localStorage.removeItem("isSyncing");
          localStorage.removeItem("jobId");
        }
      }, 5000);
    }
  }, []);

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
                searchText ? (
                  <CloseCircleOutlined
                    onClick={handleClear}
                    style={{ cursor: "pointer" }}
                  />
                ) : null
              }
            />
            {activeTabKey === "2" && (
              <Button
                className="bg-comp-red button-backend ml-4"
                type="primary"
                icon={<ArrowPathIcon className="w-4" />}
                loading={isSyncing} // Add loading prop
                onClick={async () => {
                  try {
                    await syncAndProcessInvoices(); // Call the async function
                  } catch (error: any) {
                    toastError(error); // Handle the error
                  }
                }}
              >
                {t("Sync")}
              </Button>
            )}
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
            activeTabKey={activeTabKey}
            setActiveTabKey={setActiveTabKey}
          />
        </div>
      </div>
    </div>
  );
}
