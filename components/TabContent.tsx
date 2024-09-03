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
  minisize: {
    id: number;
    name: string;
  };
  isActive: boolean;
  type: string;
}

interface TableComponentProps<T> {
  columns: ColumnsType<T>;
  data: DataType[];
  setCurrentPage: (value: number) => void;
  currentPage: number;
  setPageSize: (value: number) => void;
  pageSize: number;
  onTabChange: (type: string) => void; // New prop to handle tab change
  activeKey: string;
  total: number;
}

const TabContent: React.FC<TableComponentProps<any>> = ({
  columns,
  data,
  setCurrentPage,
  currentPage,
  setPageSize,
  pageSize,
  onTabChange,
  activeKey,
  total,
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
      key: "Video",
      label: t("video"),
      children: (
        <DataTable
          columns={columns}
          data={data}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      ),
    },
    {
      key: "Image",
      label: t("image"),
      children: (
        <DataTable
          columns={columns}
          data={data}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      ),
    },
    {
      key: "File",
      label: t("pdf file"),
      children: (
        <DataTable
          columns={columns}
          data={data}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      ),
    },
  ];

  const onChange = (key: string) => {

  
    onTabChange(key); // Pass the selected type to the parent
  };

  return (
    <Tabs
      activeKey={activeKey} // Use activeKey prop to control the Tabs component
      items={items}
      onChange={onChange}
      className="redeem-tab"
    />
  );
};

export default TabContent;
