import React, { useState } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import getCustomPagination from './CustomPaginationConfig';

interface TableComponentProps<T> {
  columns: ColumnsType<T>;
  data: T[];
  rowSelection: any;
}

const DatatableSelect: React.FC<TableComponentProps<any>> = ({
  columns,
  data,
  rowSelection, 
}) => {
  const [selectionType, setSelectionType] = useState<'checkbox' | 'radio'>('checkbox');
  const customPagination = getCustomPagination(data.length);

  return (
    <div>
      <Table
        rowSelection={{
          type: selectionType,
          ...rowSelection,
        }}
        columns={columns}
        dataSource={data}
        pagination={customPagination}
        className="thead-white-table"
      />
    </div>
  );
};

export default DatatableSelect;
