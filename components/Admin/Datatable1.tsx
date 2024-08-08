import React from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import getCustomPagination from "./CustomPaginationConfig";
// import getCustomPagination from "./CustomPaginationConfig"; // Adjust the path as needed

interface TableComponentProps<T> {
  columns: ColumnsType<T>;
  data: T[];
}

const DataTable: React.FC<TableComponentProps<any>> = ({
  columns,
  data,
}) => {
  const customPagination = getCustomPagination(data.length);

  return (
    <div className="flex flex-col w-full">
      <Table
        columns={columns}
        dataSource={data}
        className="w-full default-font"
        pagination={customPagination}
      />
    </div>
  );
};

export default DataTable;
