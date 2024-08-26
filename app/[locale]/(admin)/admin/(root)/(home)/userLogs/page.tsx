"use client";
import { useCart } from "@components/Admin/Cartcontext";
import DataTable from "@components/Admin/Datatable";
import Loading from "@components/Loading";
import {
  ArrowPathIcon,
  PencilIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Input, Space, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { exec } from "child_process";
import { DateTime } from "luxon";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function userLogs() {
  const { t } = useTranslation();
  const {setI18nName, setLoadPage, loadPage} = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);
  const [userLogData, setUserLogData] = useState<DataLogType[]>([]);

  interface DataLogType {
    key: number;
    user: any;
    id: number;
    ipAddress: string;
    createdAt: DateTime;
    userName: string;
    userEmail: string;
  }

  const columns: ColumnsType<DataLogType> = [
    {
      title: t('no'),
      dataIndex: "key",
      key: "key",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.key - a.key,
    },
    {
      title: t("IP Address"),
      dataIndex: "ipAddress",
      key: "ipAddress",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.ipAddress.localeCompare(b.ipAddress),
    },
    {
      title: t("User Email"),
      dataIndex: "userEmail",
      key: "userEmail",
      sorter: (a, b) => a.userEmail.length - b.userEmail.length, 
    },
    {
      title: t("User name"),
      dataIndex: "userName",
      key: "userName",
      sorter: (a, b) => a.userName.length - b.userName.length,
    },
    {
      title: t("Created At"),
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => a.createdAt.valueOf() - b.createdAt.valueOf(),
    },
  ];

  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);
    fetchData();
  }, [searchText, currentPage]);

  async function fetchData() {
    setLoadPage(true);
    try {
      const { data } = await axios.get(`/api/userLogs`, {
        params: {
          q: searchText,
          page: currentPage,
          pageSize: pageSize,
        },
      });

      const userDataWithKeys = data.userLogs.map(
        (user: DataLogType, index: number) => ({
          ...user,
          key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
        })
      );

      setUserLogData(userDataWithKeys);
      setTotal(data.total);
    } catch (error: any) {
      toastError(error);
    } finally {
      setLoadPage(false);
    }
  }

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  if (loadPage || !t) {
    return (
      <Loading/>
    );
  }

  return (
    <div className="px-12">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow">{t("User Logs")}</p>
          <div className="flex">
            <Input.Search
              placeholder={t("Search")}
              size="middle"
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "200px", marginBottom: "20px" }}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={userLogData}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
