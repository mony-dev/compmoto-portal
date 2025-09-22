"use client";
import dynamic from "next/dynamic";
import { useCart } from "@components/Admin/Cartcontext";
const Loading = dynamic(() => import("@components/Loading"));
const DataTable = dynamic(() => import("@components/Admin/Datatable"));
import { toastError } from "@lib-utils/helper";
import { Input, Spin } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { DateTime } from "luxon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import debounce from "lodash.debounce";
import { CloseCircleOutlined } from "@ant-design/icons";

export default function UserLogs() {
  const { t } = useTranslation();
  const {setI18nName, setLoadPage, loadPage} = useCart();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchText, setSearchText] = useState(() => {
    // Initialize searchText from query parameter 'q' or default to an empty string
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [userLogData, setUserLogData] = useState<DataLogType[]>([]);

  interface DataLogType {
    key: number;
    user: {
      email: string;
      name: string;
    };
    id: number;
    ipAddress: string;
    createdAt: DateTime;
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
      sorter: (a, b) => a.user?.email.localeCompare(b.user?.email), 
      render: (_, record) => <p>{record.user.email}</p>,
    },
    {
      title: t("User name"),
      dataIndex: "userName",
      key: "userName",
      sorter: (a, b) => a.user?.name.localeCompare(b.user?.name), 
      render: (_, record) => <p>{record.user.name}</p>,    },
    {
      title: t("Created At"),
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => a.createdAt.valueOf() - b.createdAt.valueOf(),
    },
  ];

  // Debounce function for search input
  const debouncedFetchData = useCallback(
    debounce(() => {
      fetchData(searchText);
    }, 500), // 500 ms debounce delay
    [currentPage, pageSize]
  );

  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);

    // Call the debounced fetch function
    debouncedFetchData();

    // Cleanup debounce on unmount
    return () => {
      debouncedFetchData.cancel();
    };
  }, [currentPage, debouncedFetchData]);

  async function fetchData(query: string = "") {
    setLoadPage(true);
    try {
      const { data } = await axios.get(`/api/userLogs`, {
        params: {
          q: query,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    const queryParams = new URLSearchParams(searchParams.toString());
    if (value) queryParams.set("q", value);
    else queryParams.delete("q");
    const newUrl = `${pathname}?${queryParams.toString()}`;
    window.history.replaceState(null, "", newUrl);

    fetchData(value); 
  };
  const handleClear = () => {
    window.history.replaceState(null, "", `${pathname}`);
    setCurrentPage(1);
    setSearchText(""); // Clear the input
    fetchData(""); // Reset the list to show all data
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  return (
    <div className="px-4">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow default-font">{t("User Logs")}</p>
          <div className="flex">
            <Input.Search
              placeholder={t('search')}
              size="middle"
              style={{ width: "200px", marginBottom: "20px" }}
              value={searchText}
              onSearch={handleSearch}
              onChange={handleInputChange}
              suffix={
                <CloseCircleOutlined
                  onMouseDown={(e) => e.preventDefault()} 
                  onClick={handleClear}
                  style={{
                    cursor: searchText ? "pointer" : "default",
                    opacity: searchText ? 1 : 0,        
                    pointerEvents: searchText ? "auto" : "none", 
                    transition: "opacity 120ms ease",
                  }}
                  tabIndex={-1} 
                />
              }
            />
          </div>
        </div>
        <Spin spinning={loadPage}>
          <DataTable
            columns={columns}
            data={userLogData}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </Spin>
      </div>
    </div>
  );
}
