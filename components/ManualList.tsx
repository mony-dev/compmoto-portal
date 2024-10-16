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
import dynamic from "next/dynamic";
const Loading = dynamic(() => import("@components/Loading"));

interface DataType {
  id: number;
  key: number;
  name: string;
  createdAt: string;
  coverImg?: string;
  minisize?: any;
}

interface ManualProps {
  type: string;
}

const ManualList: React.FC<ManualProps> = ({ type }) => {
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
      if (type === "manual") {
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
              coverImg: null,
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
        } 
      } else {
        const { data: response } = await axios.get(`/api/news`, {
          params: {
            page: currentPage,
            pageSize: pageSize,
          },
        });
        
        if (response.news.length > 0) {
          const data = response.news.map(
            (data: DataType, index: number) => ({
              ...data,
              coverImg: data.coverImg,
              key: index + 1 + (currentPage - 1) * pageSize,
            })
          );
          setData((prevData) => {
            const filteredData = data.filter(
              (newsData: any) => !prevData.some((item) => item.id === newsData.id)
            );
            return [...prevData, ...filteredData];
          });
  
          setTotal(response.total); // Set total items from API
          setCurrentPage((prevPage) => prevPage + 1); // Increment page after successful fetch
        } 
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

  // if (loading || !locale) {
  //   return <Loading />;
  // }
  return (
    <>
      {type === "news" && (
        <p className="text-black default-font text-md font-semibold p-4">
          {t("News and events")}
        </p>
      )}
      <div
        id="scrollableDiv"
        className={type === "manual" ? "px-4" : "px-6"}
        style={{
          height: 400,
          overflow: "auto",
        }}
      >
        <InfiniteScroll
          dataLength={data.length}
          next={loadMoreData}
          hasMore={data.length < total} 
          loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
          // endMessage={<Divider plain>{t('It is all nothing load more')}</Divider>}
          scrollableTarget="scrollableDiv"
        >
          <List
            dataSource={data}
            renderItem={(item) => (
              <List.Item key={item.id}>
                <List.Item.Meta
                  avatar={item.coverImg ? <Avatar src={item.coverImg} /> : ''}
                  title={<Link className="hover:comp-red-hover font-semibold" href={type === "manual" ? `/${locale}/admin/user-manuals/${item.id}` : `/${locale}/admin/news/${item.id}?name=${item.minisize.name}`}><span className="default-font">{item.name}</span></Link>}
                  description={formatDateDiffNumber(item.createdAt)} // Adjusted this as well to directly use item
                />
              </List.Item>
            )}
          />
        </InfiniteScroll>
      </div>
    </>
  );
};

export default ManualList;
