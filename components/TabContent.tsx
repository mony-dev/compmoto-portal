"use client";

import React, { useState } from "react";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { useTranslation } from "react-i18next";
import DataTable from "./Admin/Datatable";
import { ColumnsType } from "antd/es/table";

interface DataType {
    id: number;
    key: number;
    name: string;
    isActive: boolean;
    brandId: number;
    lv1: JSON;
    lv2: JSON;
    lv3: JSON;
    productCount: number;
    imageProfile: string;
  }

interface TableComponentProps<T> {
    columns: ColumnsType<T>;
    data: DataType[];
    setCurrentPage: (value: number) => void;
    currentPage: number;
    setPageSize: (value: number) => void;
    pageSize: number;

}


const TabContent: React.FC<TableComponentProps<any>> = ({
    columns,
    data,
    setCurrentPage,
    currentPage,
    setPageSize,
    pageSize
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
      label: t("video"),
      children:   <DataTable
      columns={columns}
      data={data}
      total={data.length}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={handlePageChange}
    />,
    },
    {
      key: "2",
      label:  t("image"),
      children: "Content of Tab Pane 2",
    },
    {
      key: "3",
      label:  t("pdf file"),
      children: "Content of Tab Pane 3",
    },
  ];

  const onChange = (key: string) => {
    console.log(key);
  };



  return <Tabs defaultActiveKey="1" items={items} onChange={onChange} className="redeem-tab"/>;
};

export default TabContent;
