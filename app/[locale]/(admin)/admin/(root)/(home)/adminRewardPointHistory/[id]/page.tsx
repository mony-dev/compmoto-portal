"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Form, Input, InputNumber, Spin, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import { useCart } from "@components/Admin/Cartcontext";
import { usePathname, useSearchParams } from "next/navigation";
import { toastError, toastSuccess } from "@lib-utils/helper";
import i18nConfig from "../../../../../../../../i18nConfig";
import { useCurrentLocale } from "next-i18n-router/client";
import debounce from "lodash.debounce";
import dynamic from "next/dynamic";
import axios from "axios";
import { CloseCircleOutlined } from "@ant-design/icons";

const DataTable = dynamic(() => import("@components/Admin/Datatable"));

export default function AdminRewardPointHistory({ params }: { params: { id: number } }) {
  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const pathname = usePathname();
  const [searchText, setSearchText] = useState(() => {
    // Initialize searchText from query parameter 'q' or default to an empty string
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  });
  const [id, setId] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [historiesData, setHistoriesData] = useState<DataType[]>([]);
  const [editingRowKey, setEditingRowKey] = useState<number | null>(null);
  const searchParams = useSearchParams();

  interface DataType {
    key: number;
    id: number;
    name: string;
    custNo: string;
    point: number;
    incentivePoint: number;
    loyaltyPoint: number;
    usedPoint: number;
    totalPoint: number;
    totalSpend: number;
  }

  const fetchRewardPoint = async (query: string = "") => {
    setLoadPage(true);
    try {
      const values: any = {
        q: query,
        page: currentPage,
        pageSize: pageSize,
      };


      const response = await axios.get(`/api/adminRewardPoint/${params.id}`, { params: values });

      const historiesDataWithKeys = response.data.histories.map(
        (history: DataType, index: number) => ({
          ...history,
          key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
        })
      );
      setHistoriesData(historiesDataWithKeys);
      setTotal(response.data.total);

    } catch (error) {
      console.error("Error fetching Reward Point:", error);
    } finally {
      setLoadPage(false);
    }
  };

  // Debounce function for search input
  const debouncedFetchData = useCallback(
    debounce(() => {
      fetchRewardPoint();
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

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  
  const handleLoyaltyPointUpdate = async (record: DataType, newValue: number) => {
    try {
      const response = await axios.put(
        `/api/updateLoyaltyPoint`, 
        {
          userId: record.id, 
          rewardPointId: params.id, 
          loyaltyPoint: newValue
        },
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      )
      fetchRewardPoint();
      // Optionally update UI
      toastSuccess(t("Updated successfully"));
    } catch (error) {
      toastError(t("Update failed"));
    }
  };
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

    fetchRewardPoint(value); 
  };

  const handleClear = () => {
    window.history.replaceState(null, "", `${pathname}`);
    setCurrentPage(1);
    setSearchText(""); // Clear the input
    fetchRewardPoint(""); // Reset the list to show all data
  };

  const columns: ColumnsType<DataType> = [
    {
      title: t('no'),
      dataIndex: "key",
      key: "key",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.key - a.key,
    },
    {
      title: t('name'),
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t('cust no'),
      dataIndex: "custNo",
      key: "custNo",
      sorter: (a, b) => a.custNo.localeCompare(b.custNo),
    },
    {
      title: t('total spend'),
      dataIndex: "totalSpend",
      key: "totalSpend",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.totalSpend - a.totalSpend,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: t('point'),
      dataIndex: "point",
      key: "point",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.point - a.point,
    },
    {
      title: t('incentive point'),
      dataIndex: "incentivePoint",
      key: "incentivePoint",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.incentivePoint - a.incentivePoint,
    },
    {
      title: t('loyalty point'),
      dataIndex: "loyaltyPoint",
      key: "loyaltyPoint",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.loyaltyPoint - a.loyaltyPoint,
      render: (value: number, record: DataType) => {
        const isEditing = editingRowKey === record.key;
      
        const exitAndSave = async (val: number) => {
          await handleLoyaltyPointUpdate(record, val);
          setEditingRowKey(null);
        };
      
        return isEditing ? (
          <InputNumber
            defaultValue={value}
            min={0}
            onPressEnter={(e) => {
              const inputValue = parseFloat((e.target as HTMLInputElement).value);
              exitAndSave(inputValue);
            }}
            onBlur={(e) => {
              const inputValue = parseFloat((e.target as HTMLInputElement).value);
              exitAndSave(inputValue);
            }}
            autoFocus
          />
        ) : (
          <Tooltip placement="top" title={t("Click to edit")}>
            <Button 
              onClick={() => {
                setEditingRowKey(record.key);
                setId(record.id);
              }}
            >
              {value.toLocaleString()}
            </Button>
          </Tooltip>
        );
      }
    },
    {
      title: t('total point'),
      dataIndex: "totalPoint",
      key: "totalPoint",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.totalPoint - a.totalPoint,
    },
  ];
  return (
    <div className="px-4">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow default-font">
            {t("Reward Points Settings")}
          </p>
          <div className="flex">
            <Input.Search
              placeholder={t("search")}
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
            data={historiesData}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            scroll={{ x: "max-content" }}
            onPageChange={handlePageChange}
          />
        </Spin>
      </div>
    </div>
  );
}
