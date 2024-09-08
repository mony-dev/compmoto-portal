import React, { useState } from "react";
import "../../../styles/globals.scss";
import "../../../styles/fonts.scss";

import { Card, Image, Modal, Pagination, PaginationProps } from "antd";
import {
  formatDateDiff,
  formatDateDiffNumber,
  formatDateNumber,
} from "@lib-utils/helper";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { ColumnsType } from "antd/es/table";
import Link from "next/link";
import Meta from "antd/es/card/Meta";
import { useRouter } from "next/navigation";
import i18nConfig from "../../../i18nConfig";
import { useCurrentLocale } from "next-i18n-router/client";
const DataTable = dynamic(() => import("../Datatable"));

interface NewsCardProps {
  newsData: {
    id: number;
    key: number;
    name: string;
    minisize: {
      id: number;
      name: string;
    };
    isActive: boolean;
    coverImg: string;
    content: string;
    createdAt: string;
  }[];
  total: number;
  setPageSize: any;
  setCurrentPage: any;
  pageSize: number;
  currentPage: number;
}

interface News {
    id: number;
    key: number;
    name: string;
    minisize: {
      id: number;
      name: string;
    };
    isActive: boolean;
    coverImg: string;
    content: string;
    createdAt: string;
}
const NewsCard: React.FC<NewsCardProps> = ({
  newsData,
  total,
  pageSize,
  currentPage,
  setPageSize,
  setCurrentPage,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useCurrentLocale(i18nConfig);

  const handlePreviewClick = (imgSrc: string) => {
    setPreviewImage(imgSrc);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setPreviewImage("");
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const itemRender: PaginationProps["itemRender"] = (
    _,
    type,
    originalElement
  ) => {
    if (type === "prev") {
      return <a>previous</a>;
    }
    if (type === "next") {
      return <a>next</a>;
    }
    return originalElement;
  };
  const newsDetails = (
    news: News
  ) => {
    
  };
  return (
    <>
      <div className="flex flex-wrap gap-4">
        {newsData.map((news, index) => (
          <div key={news.key} className={``}>
            <Card
              hoverable
              style={{ width: 240 }}
              onClick={() => router.push(`/${locale}/admin/news/${news.id}?name=${news.minisize.name}`)}
              cover={
                <Image
                  width={"100%"}
                  className="w-full h-auto rounded-lg object-cover flex"
                  src={news.coverImg}
                  alt={news.name}
                  style={{ maxWidth: "100%", height: "100%" }} // Ensures the image fills the grid item width
                  preview={false} // Disable default preview behavior of Ant Design Image
                />
              }
            >
              <Meta
                title={news.name}
                description={formatDateDiffNumber(news.createdAt)}
              />
            </Card>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
          className="mt-4"
          showSizeChanger={false}
          showQuickJumper={false}
          itemRender={itemRender}
        />
      </div>
    </>
  );
};

export default NewsCard;
