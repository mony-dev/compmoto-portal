import type { PaginationProps } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';

const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
  if (type === 'prev') {
    return <a>ก่อนหน้า</a>;
  }
  if (type === 'next') {
    return <a>ถัดไป</a>;
  }
  return originalElement;
};

const getCustomPagination = (total: number): TablePaginationConfig => ({
  total,
  pageSize: 30,
  showSizeChanger: false,
  showQuickJumper: false,
  itemRender,
  position: ["bottomCenter"] // Use the specific type for TablePaginationPosition
});

export default getCustomPagination;
