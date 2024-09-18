"use client";

import React, { useState } from "react";
import { Badge, Tabs } from "antd";
import type { TabsProps } from "antd";
import { useTranslation } from "react-i18next";
import DataTable from "../../Admin/Datatable";
import { ColumnsType } from "antd/es/table";

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

interface TableComponentProps<T> {
  columns: ColumnsType<T>;
  columnsInvoice: ColumnsType<T>;
  data: OrderDataType[];
  invoiceData: OrderDataType[];
  setCurrentPage: (value: number) => void;
  currentPage: number;
  setPageSize: (value: number) => void;
  pageSize: number;
  orderTotal: number;
  invoiceTotal: number;
  activeTabKey: string;
  setActiveTabKey: (value: string) => void;
}

const TabContentOrder: React.FC<TableComponentProps<any>> = ({
  columns,
  columnsInvoice,
  data,
  setCurrentPage,
  currentPage,
  setPageSize,
  pageSize,
  orderTotal,
  invoiceTotal,
  invoiceData,
  activeTabKey,
  setActiveTabKey,
}) => {
  const { t } = useTranslation();

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
          <p>{t("Sale Quotes")}</p>
        </Badge>
      ),
      children: (
        <DataTable
          columns={columns}
          data={data}
          total={orderTotal}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      ),
    },
    {
      key: "2",
      label: (
        <Badge
          className="redeem-badge default-font"
          count={invoiceTotal}
          offset={[15, -1]}
          overflowCount={99}
        >
          <p>{t("Invoice")}</p>
        </Badge>
      ),
      children: (
        <DataTable
          columns={columnsInvoice}
          data={invoiceData}
          total={invoiceTotal}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      ),
    },
  ];

  const onChange = (key: string) => {
    setActiveTabKey(key)
  };

  return (
    <Tabs
      activeKey={activeTabKey}
      items={items}
      onChange={onChange}
      className="redeem-tab"
    />
  );
};

export default TabContentOrder;
