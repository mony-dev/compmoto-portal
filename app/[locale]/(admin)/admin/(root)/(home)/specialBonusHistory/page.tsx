"use client";
import dynamic from "next/dynamic";

import { PlusIcon } from "@heroicons/react/24/outline";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Flex, Input, Modal, Select, Space, Spin, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import i18nConfig from "../../../../../../../i18nConfig";
import { useCurrentLocale } from "next-i18n-router/client";
import { useTranslation } from "react-i18next";
import { useCart } from "@components/Admin/Cartcontext";
import debounce from "lodash.debounce";
import { SelectValue } from "antd/es/select";
const Loading = dynamic(() => import("@components/Loading"));
const DataTable = dynamic(() => import("@components/Admin/Datatable"));

interface Option {
  label: string;
  value: string;
}

interface DataType {
  key: number;
  id: number;
  user: {
    userId: number;
    name: string;
    custNo: string;
  };
  totalSpend: [
    {
      minisizeId: number;
      minisizeName: string;
      total: number;
      level: number;
      cn: number;
      intensivePoint: number;
    }
  ];
}

export default function specialBonusHistory() {
  const { t } = useTranslation();
  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString(); // Months are 0-based in JS, so +1
  const currentYear = currentDate.getFullYear().toString();
  const [selectedMonth, setSelectedMonth] = useState<string>(""); // Default to "All" (empty string)
  const [selectedYear, setSelectedYear] = useState<string>(""); // Default to "All" (empty string)

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalBonusData, setTotalBonusData] = useState<DataType[]>([]);
  const locale = useCurrentLocale(i18nConfig);
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [monthOptions, setMonthOptions] = useState<Option[]>([]);
  const [yearOptions, setYearOptions] = useState<Option[]>([]);

  //     {
  //       title: t("no"),
  //       dataIndex: "key",
  //       key: "key",
  //       defaultSortOrder: "descend",
  //       sorter: (a, b) => b.key - a.key,
  //     },
  //     {
  //       title: t("name"),
  //       dataIndex: "name",
  //       key: "name",
  //       defaultSortOrder: "descend",
  //       sorter: (a, b) => a.user.name.localeCompare(b.user.name),
  //       render: (_, record) => <p>{record.user.name}</p>,
  //     },
  //     {
  //       title: t("total"),
  //       dataIndex: "totalSpend",
  //       key: "totalSpend",
  //       sorter: (a, b) => b.totalSpend - a.totalSpend,
  //       render: (_, record) => (
  //         <p>
  //           {record.totalSpend.toLocaleString("en-US", {
  //             minimumFractionDigits: 2,
  //             maximumFractionDigits: 2,
  //           })}
  //         </p>
  //       ),
  //     },
  //     {
  //       title: t("cn"),
  //       key: "cn",
  //       dataIndex: "cn",
  //       sorter: (a, b) => b.cn - a.cn,
  //       render: (_, record) => (
  //         <p>
  //          {record.cn}%
  //         </p>
  //       ),
  //     },
  //     {
  //       title: t("intensive point"),
  //       dataIndex: "intensivePoint",
  //       key: "intensivePoint",
  //       sorter: (a, b) => b.intensivePoint - a.intensivePoint,
  //       render: (_, record) => (
  //         <p>
  //           {record.intensivePoint.toLocaleString("en-US", {
  //             minimumFractionDigits: 2,
  //             maximumFractionDigits: 2,
  //           })}
  //         </p>
  //       ),
  //     },
  //     {
  //       title: t("loyalty point"),
  //       dataIndex: "royaltyPoint",
  //       key: "royaltyPoint",
  //       sorter: (a, b) => b.royaltyPoint - a.royaltyPoint,
  //       render: (_, record) => (
  //         <p>
  //           {record.royaltyPoint.toLocaleString("en-US", {
  //             minimumFractionDigits: 2,
  //             maximumFractionDigits: 2,
  //           })}
  //         </p>
  //       ),
  //     },
  //     {
  //       title: t("level"),
  //       dataIndex: "Level",
  //       key: "level",
  //       sorter: (a, b) => b.level - a.level,
  //       render: (_, record) => <p>{record.level}</p>,
  //     },
  //   ];

  // Debounce function for search input
  const debouncedFetchData = useCallback(
    debounce(() => {
      fetchData(selectedMonth, selectedYear);
      fetchMonth();
      fetchYear();
      // fetchBrands();
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

  // Months in English and Thai

  const columns: ColumnsType<DataType> = [
    {
      title: t("no"),
      dataIndex: "key",
      key: "key",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.key - a.key,
    },
    {
      title: t("cust no"),
      dataIndex: "custNo",
      key: "custNo",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.user.custNo.localeCompare(b.user.custNo),
      render: (_, record) => <p>{record.user.custNo}</p>,
    },
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.user.name.localeCompare(b.user.name),
      render: (_, record) => <p>{record.user.name}</p>,
    },
    {
      title: t("minisize"),
      dataIndex: "totalSpend", // Assuming 'totalSpend' is at the root level of record
      key: "minisize",
      defaultSortOrder: "descend",
      render: (_, record) => {
        const { totalSpend } = record; // Extract totalSpend from record
        if (!Array.isArray(totalSpend)) {
          return null; // Ensure totalSpend is an array before rendering
        }
        
        return (
          <div className="grid grid-flow-row auto-rows-max total-spend">
            {totalSpend.map((total: { minisizeName: string }) => (
              <div
                key={total.minisizeName}
                className="py-4 border-b border-[#f0f0f0]"
              >
                {total.minisizeName}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: t("total purchase"),
      dataIndex: "totalSpend", // Assuming 'totalSpend' is at the root level of record
      key: "total",
      defaultSortOrder: "descend",
      render: (_, record) => {
        const { totalSpend } = record; // Extract totalSpend from record
        if (!Array.isArray(totalSpend)) {
          return null; // Ensure totalSpend is an array before rendering
        }
        return (
          <div className="grid grid-flow-row auto-rows-max total-spend">
            {totalSpend.map((total: { total: number }) => (
              <div key={total.total} className="py-4 border-b border-[#f0f0f0]">
                {total.total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: t("cn"),
      dataIndex: "totalSpend", // Assuming 'totalSpend' is at the root level of record
      key: "cn",
      defaultSortOrder: "descend",
      render: (_, record) => {
        const { totalSpend } = record; // Extract totalSpend from record
        if (!Array.isArray(totalSpend)) {
          return null; // Ensure totalSpend is an array before rendering
        }
        return (
          <div className="grid grid-flow-row auto-rows-max total-spend">
            {totalSpend.map((total: { cn: number }) => (
              <div key={total.cn} className="py-4 border-b border-[#f0f0f0]">
                {total.cn} %
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: t("intensive point"),
      dataIndex: "totalSpend", // Assuming 'totalSpend' is at the root level of record
      key: "intensivePoint",
      defaultSortOrder: "descend",
      render: (_, record) => {
        const { totalSpend } = record; // Extract totalSpend from record
        if (!Array.isArray(totalSpend)) {
          return null; // Ensure totalSpend is an array before rendering
        }
        return (
          <div className="grid grid-flow-row auto-rows-max total-spend">
            {totalSpend.map((total: { intensivePoint: number }) => (
              <div key={total.intensivePoint} className="py-4 border-b border-[#f0f0f0]">
                {total.intensivePoint} {t('Point')}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: t("level"),
      dataIndex: "totalSpend", // Assuming 'totalSpend' is at the root level of record
      key: "level",
      defaultSortOrder: "descend",
      render: (_, record) => {
        const { totalSpend } = record; // Extract totalSpend from record
        if (!Array.isArray(totalSpend)) {
          return null; // Ensure totalSpend is an array before rendering
        }
        return (
          <div className="grid grid-flow-row auto-rows-max total-spend">
            {totalSpend.map((total: { level: number }) => (
              <div key={total.level} className="py-4 border-b border-[#f0f0f0]">
                {total.level} 
              </div>
            ))}
          </div>
        );
      },
    },
  ];

  const fetchMonth = async () => {
    const months = [
      { en: "January", th: "มกราคม", key: "1" },
      { en: "February", th: "กุมภาพันธ์", key: "2" },
      { en: "March", th: "มีนาคม", key: "3" },
      { en: "April", th: "เมษายน", key: "4" },
      { en: "May", th: "พฤษภาคม", key: "5" },
      { en: "June", th: "มิถุนายน", key: "6" },
      { en: "July", th: "กรกฎาคม", key: "7" },
      { en: "August", th: "สิงหาคม", key: "8" },
      { en: "September", th: "กันยายน", key: "9" },
      { en: "October", th: "ตุลาคม", key: "10" },
      { en: "November", th: "พฤศจิกายน", key: "11" },
      { en: "December", th: "ธันวาคม", key: "12" },
    ];
    let month = [];
    if (locale === "en") {
      month = months.map((option) => ({
        label: option.en,
        value: option.key,
      }));
    } else {
      month = months.map((option) => ({
        label: option.th,
        value: option.key,
      }));
    }
    setMonthOptions([{ label: locale === "en"? "All" : "ทั้งหมด", value: "" }, ...month]);
  };

  // Fetch years from 2024 to the current year
  const fetchYear = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - 2024 + 1 },
      (v, i) => 2024 + i
    );

    const yearOptions = years.map((year) => ({
      label: year.toString(),
      value: year.toString(),
    }));

    setYearOptions([{ label: locale === "en"? "All" : "ทั้งหมด", value: "" }, ...yearOptions]);
  };

  const handleMonthChange = (value: SelectValue) => {
    setSelectedMonth(value?.toString() || ""); // Update selected month, allowing for the "All" option (empty string)
    fetchData(value?.toString() || "", selectedYear);
  };

  const handleYearChange = (value: SelectValue) => {
    setSelectedYear(value?.toString() || ""); // Update selected year, allowing for the "All" option (empty string)
    fetchData(selectedMonth, value?.toString() || "");
  };

  async function fetchData(
    month: string | null = null,
    year: string | null = null
  ) {
    setLoadPage(true);
    let isActive = true
    if (month !== "" || year !== "") {
      if ((month !== currentMonth && month !== "") || (year !== currentYear && year !== "")) {
        isActive = false
     } 
    } 
    try {
      const { data } = await axios.get(`/api/adminSpecialBonusHistory`, {
        params: {
          isActive: isActive,
          month: month || currentMonth,
          year: year || currentYear,
          page: currentPage,
          pageSize: pageSize,
        },
      });
      if (data.specialBonusHistories) {
        const totalDataWithKeys = data.specialBonusHistories.map(
          (total: DataType, index: number) => ({
            ...total,
            key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
          })
        );
        setTotalBonusData(totalDataWithKeys);
      } else {
        setTotalBonusData([]);
      }

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
    return <Loading />;
  }

  return (
    <div className="px-4">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold pb-4 grow default-font">
              {t("total special bonus")}
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <label>{t('month')}</label>
            <Select
              showSearch
              placeholder={t('Search a month')}
              value={selectedMonth} // Default to current month
              onChange={handleMonthChange} // Handle month change
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={monthOptions}
            />
            <label>{t('year')}</label>
            <Select
              showSearch
              placeholder={t('Search a year')}
              value={selectedYear} // Default to current year
              onChange={handleYearChange} // Handle year change
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={yearOptions}
            />
            </div>
        </div>
        <div className="custom-table">
          <DataTable
            columns={columns}
            data={totalBonusData}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
