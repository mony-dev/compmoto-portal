import React from "react";
import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import getCustomPagination from "./CustomPaginationConfig";

interface TableComponentProps<T> {
  columns: ColumnsType<T>;
  data: T[];
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number, pageSize?: number) => void;
  onChange?: TableProps<T>["onChange"]; 
}

const DataTable: React.FC<TableComponentProps<any>> = ({
  columns,
  data,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onChange, 
}) => {
  const customPagination = getCustomPagination(total, currentPage, pageSize, onPageChange);
  return (
    <div className="flex flex-col w-full">
      <Table
        columns={columns}
        dataSource={data}
        className="w-full default-font"
        pagination={customPagination}
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
        onChange={onChange}
      />
    </div>
  );
};

export default DataTable;
