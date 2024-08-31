"use client";
import dynamic from "next/dynamic";

import { formatDate, toastError } from "@lib-utils/helper";
import { Badge, Input, Tabs, TabsProps } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import { useSession } from "next-auth/react";
import { useCart } from "@components/Admin/Cartcontext";
import { useTranslation } from "react-i18next";
const Loading = dynamic(() => import("@components/Loading"));
const DataTable = dynamic(() => import("@components/Admin/Datatable"));
export default function adminOrder({ params }: { params: { id: number } }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [orderData, setOrderData] = useState<OrderDataType[]>([]);
  const [triggerOrder, setTriggerOrder] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);

  const locale = useCurrentLocale(i18nConfig);
  const { data: session } = useSession();

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
      saleUser: {
        custNo: string;
      };
    };
    product: any;
  }
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
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
      render: (_, record) => <p>{record.user.saleUser.custNo}</p>,
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

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <Badge
          className="redeem-badge default-font"
          count={orderTotal}
          offset={[10, 1]}
        >
          <p>{t("Sale Quotes")}</p>
        </Badge>
      ),
      children: (
        <DataTable
          columns={columns}
          data={orderData}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      ),
    },
    {
      key: "2",
      label: (
        <Badge className="redeem-badge default-font" count={0} offset={[10, 1]}>
          <p>{t("Invoice")}</p>
        </Badge>
      ),
      children: (
        <DataTable
          columns={columns}
          data={orderData}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      ),
    },
  ];

  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);
    fetchData();
  }, [searchText, triggerOrder, session, currentPage]);

  async function fetchData() {
    setLoadPage(true);
    if (session?.user?.id) {
      try {
        const { data } = await axios.get(`/api/adminOrder`, {
          params: {
            q: searchText,
            type: 'Normal',
            userId: session.user.id,
            role: session.user.role,
            page: currentPage,
            pageSize: pageSize,
          },
        });
        
        const orderDataWithKeys = data.orders.map(
          (order: any, index: number) => ({
            ...order,
            key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
          })
        );
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
          <p className="text-lg font-semibold pb-4 grow">{t("Normal Order")}</p>
          <div className="flex">
            <Input.Search
              placeholder={t("Search")}
              size="middle"
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "200px", marginBottom: "20px" }}
              value={searchText}
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
