import type { PaginationProps } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
  if (type === 'prev') {
    return <a>previous</a>;
  }
  if (type === 'next') {
    return <a>next</a>;
  }
  return originalElement;
};

const getCustomPagination = (
  total: number,
  currentPage: number,
  pageSize: number,
  onPageChange: (page: number, pageSize?: number) => void
): TablePaginationConfig => ({
  total,
  current: currentPage,
  pageSize,
  showSizeChanger: false,
  showQuickJumper: false,
  itemRender,
  position: ["bottomCenter"],
  onChange: onPageChange,  // Pass the onChange handler here
});

export default getCustomPagination;
