import React from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

interface TableComponentProps<T> {
  columns: ColumnsType<T>;
  data: T[];
}

const DataTable: React.FC<TableComponentProps<any>> = ({
  columns,
  data,
}) => (
  <>
    <div className="flex flex-col w-full">
      <Table columns={columns} dataSource={data} className="w-full" />
    </div>
  </>
);

export default DataTable;
