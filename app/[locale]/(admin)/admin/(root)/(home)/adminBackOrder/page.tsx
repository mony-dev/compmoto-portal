"use client";
import dynamic from "next/dynamic";
import debounce from "lodash.debounce";
import {
  formatDate,
  toastError,
} from "@lib-utils/helper";
import {
  Badge,
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
const Loading = dynamic(() => import("@components/Loading"));
const DataTable = dynamic(() => import("@components/Admin/Datatable"));
export default function adminBackOrder({ params }: { params: { id: number } }) {
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
  const [triggerOrder, setTriggerOrder] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const locale = useCurrentLocale(i18nConfig);
  const { data: session } = useSession();
  const searchParams = useSearchParams();
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
    calculatedSubTotal: number;
    createdAt: string;
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
        <Link href={`/${locale}/admin/adminBackOrder/${record.id}`}>{record.documentNo}</Link>
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
      sorter: (a, b) => a.user.saleUser.custNo.localeCompare(b.user.saleUser.custNo),
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

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <Badge
          className="redeem-badge default-font"
          count={orderTotal}
          offset={[15, -1]}
          overflowCount={99}
        >
          <p>{t('Back orders')}</p>
        </Badge>
      ),
      children:   <DataTable
      columns={columns}
      data={orderData}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={handlePageChange}
    />,
    }
  ];

  async function fetchData(query: string = "") {
    setLoadPage(true);
    if (session?.user?.id) {
      try {
        const { data } = await axios.get(`/api/adminOrder`, {
          params: {
            q: query,
            type: 'Back',
            userId: session.user.id,
            role: session.user.role,
            page: currentPage,
            pageSize: pageSize,
          },
        });
  
        const orderDataWithKeys = data.orders.map((order: any, index: number) => {
          // Initialize a variable to store the calculated subTotal for each order
          let calculatedSubTotal = 0;
        
          // Iterate through each item in the order
          order.items.forEach((item: any) => {
            if (item.year === null) {
              // If the item has no year
              const yearDiscount = (item.price * item.discount) / 100;
              calculatedSubTotal += item.price - yearDiscount
            } else {
              // If the item has a year, calculate the discount and subtract it from the subTotal
              calculatedSubTotal += item.discountPrice
            }
          });
          // Return the order with the new subTotal and a unique key
          return {
            ...order,
            calculatedSubTotal, // Add the calculated subTotal to each order
            key: index + 1 + (currentPage - 1) * pageSize, // Ensure unique keys across pages
          };
        });
        setOrderData(orderDataWithKeys);
        setOrderTotal(orderDataWithKeys.length);
        setTotal(data.total);
      } catch (error: any) {
        toastError(error);
      } finally {
        setLoadPage(false);
      }
    } else {
      console.warn(t("User ID is undefined. Cannot fetch orders"));
    }
   
  }
  const onChange = (key: string) => {
    if (key === "1") {
      setTriggerOrder(false);
    } else if (key === "2") {
      setTriggerOrder(true);
    }
  };
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
        <div className="flex justify-end items-center">
          <p className="text-lg font-semibold pb-4 grow default-font">{t('Back orders')}</p>
          <div className="flex">
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
          </div>
        </div>
        <Tabs
          defaultActiveKey="1"
          items={items}
          onChange={onChange}
          className="redeem-tab"
        />
      </div>
    </div>
  );
}
