import type { PaginationProps } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
  const { t } = useTranslation();
  if (type === 'prev') {
    return <a>{t('previous')}</a>;
  }
  if (type === 'next') {
    return <a>{t('next')}</a>;
  }
  return originalElement;
};

const getCustomPagination = (total: number): TablePaginationConfig => ({
  total,
  pageSize: 15,
  showSizeChanger: false,
  showQuickJumper: false,
  itemRender,
  position: ["bottomCenter"] // Use the specific type for TablePaginationPosition
});

export default getCustomPagination;
