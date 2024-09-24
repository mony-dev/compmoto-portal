"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Avatar, Divider, List, Skeleton } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import { formatDateDiffNumber, toastError } from "@lib-utils/helper";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../i18nConfig";

interface DataType {
  id: number;
  key: number;
  name: string;
  createdAt: string;
  picture: string;
}

const ManualList: React.FC = () => {
  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataType[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // Start from page 1
  const [total, setTotal] = useState(0);
  const pageSize = 5;

  const loadMoreData = useCallback(async () => {
    if (loading || (total > 0 && data.length >= total)) {
      return; // Prevent loading more if already loading or all data is loaded
    }

    setLoading(true);

    try {
      console.log(`Fetching page ${currentPage} with pageSize ${pageSize}`);

      const { data: response } = await axios.get(`/api/userManual`, {
        params: {
          page: currentPage,
          pageSize: pageSize,
        },
      });

      if (response.userManuals.length > 0) {
        const newManualData = response.userManuals.map(
          (manual: DataType, index: number) => ({
            ...manual,
            key: index + 1 + (currentPage - 1) * pageSize,
          })
        );

        setData((prevData) => {
          const filteredData = newManualData.filter(
            (manual: any) => !prevData.some((item) => item.id === manual.id)
          );
          return [...prevData, ...filteredData];
        });

        setTotal(response.total); // Set total items from API
        setCurrentPage((prevPage) => prevPage + 1); // Increment page after successful fetch
      } else {
        console.log("No more data to load");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, loading, total, data.length, pageSize]);

  useEffect(() => {
    loadMoreData();
  }, []); 

  return (
    <div
      id="scrollableDiv"
      style={{
        height: 400,
        overflow: "auto",
        padding: "0 16px",
        border: "1px solid rgba(140, 140, 140, 0.35)",
      }}
    >
      <InfiniteScroll
        dataLength={data.length}
        next={loadMoreData}
        hasMore={data.length < total} 
        loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
        endMessage={<Divider plain>{t('It is all nothing load more')}</Divider>}
        scrollableTarget="scrollableDiv"
      >
        <List
          dataSource={data}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                avatar={<Avatar src={"https://via.placeholder.com/150"} />}
                title={<Link href={`/${locale}/admin/user-manuals/${item.id}`}>{item.name}</Link>}
                description={formatDateDiffNumber(item?.createdAt)} // You can include createdAt or other data if needed
              />
            </List.Item>
          )}
        />
      </InfiniteScroll>
    </div>
  );
};

export default ManualList;
