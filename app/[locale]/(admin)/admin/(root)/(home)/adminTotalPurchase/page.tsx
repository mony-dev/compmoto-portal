"use client";
import dynamic from "next/dynamic";

import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import { toastError } from "@lib-utils/helper";
import { Button, Form, Input, Select, Spin, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import i18nConfig from "../../../../../../../i18nConfig";
import { useCurrentLocale } from "next-i18n-router/client";
import { useTranslation } from "react-i18next";
import { useCart } from "@components/Admin/Cartcontext";
import debounce from "lodash.debounce";
import { CloseCircleOutlined } from "@ant-design/icons";
import ModalTotalPurchase from "@components/Admin/totalPurchase/ModalTotalPurchase";
import DatePickers from "@components/Admin/DatePickers";
import { SelectValue } from "antd/es/select";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  searchDateSchema,
  SearchDateSchema,
} from "@lib-schemas/user/search-date-schema";
const DataTable = dynamic(() => import("@components/Admin/Datatable"));

interface Option {
  label: string;
  value: string;
}

export default function AdminTotalPurchase() {
  const { Option } = Select;

  const { t } = useTranslation();
  const [searchText, setSearchText] = useState(() => {
    // Initialize searchText from query parameter 'q' or default to an empty string
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPurchaseData, setTotalPurchaseData] = useState<DataType[]>([]);
  const locale = useCurrentLocale(i18nConfig);
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filterStatus, setFilterStatus] = useState<"all" | "true" | "false">(
    "all"
  );

  const [triggerTotalPurchase, setTriggerTotalPurchase] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mode, setMode] = useState("ADD");
  const [id, setId] = useState(0);
  const [title, setTitle] = useState(t("Add Total Purchase"));
  const [formSearchDate] = Form.useForm();

  const currentDate = new Date();

  const [selectedMonth, setSelectedMonth] = useState<string>(
    (currentDate.getMonth() + 1).toString()
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    currentDate.getFullYear().toString()
  );
  const [monthOptions, setMonthOptions] = useState<Option[]>([]);
  const [thisMonth, setThisMonth] = useState<string>(
    (currentDate.getMonth() + 1).toString()
  );
  const [thisYear, setThisYear] = useState<string>(
    currentDate.getFullYear().toString()
  );

  interface DataType {
    key: number;
    id: number;
    name: string;
    monthYear: string;
    isActive: boolean;
    resetDate: Date;
    customerGroup: {
      name: string;
    };
  }

  const columns: ColumnsType<DataType> = [
    {
      title: t("no"),
      dataIndex: "key",
      key: "key",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.key - a.key,
    },
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t("customerGroup"),
      dataIndex: "customerGroup",
      key: "customerGroup",
      defaultSortOrder: "descend",
      sorter: (a, b) =>
        a.customerGroup.name.localeCompare(b.customerGroup.name),
      render: (_, record) => <p>{record.customerGroup?.name}</p>,
    },
    {
      title: t("monthYear"),
      dataIndex: "monthYear",
      key: "monthYear",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.monthYear.localeCompare(b.monthYear),
    },
    {
      title: t("reset date"),
      key: "resetDate",
      dataIndex: "resetDate",
      render: (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear()).slice(-2); // 2025 → 25
        return `${day}/${month}/${year}`;
      },
    },
    {
      title: t("status"),
      key: "status",
      dataIndex: "isActive",
      sorter: (a: DataType, b: DataType) =>
        Number(b.isActive) - Number(a.isActive),
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "grey"}>
          {isActive ? t("active") : t("inactive")}
        </Tag>
      ),
    },
    {
      title: t("action"),
      key: "action",
      render: (_, record) => (
        <div className="flex">
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pr-2"
            onClick={showModal(true, record.id)}
          >
            <PencilSquareIcon className="w-4 mr-0.5" />
            <span>{t("edit")}</span>
          </p>
        </div>
      ),
    },
  ];

  const { control: controlSearch, setValue: setSearchValue } =
    useForm<SearchDateSchema>({
      resolver: zodResolver(searchDateSchema),
    });

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
    setMonthOptions(month);
  };

  // Debounce function for search input
  const debouncedFetchData = useCallback(
    debounce((query: string, status: "all" | "true" | "false", month: string, year: string) => {
      fetchData(query, status, month, year);
      fetchMonth();
    }, 500), // 500 ms debounce delay
    [currentPage, pageSize]
  );

  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);

    // Call the debounced fetch function
    debouncedFetchData(searchText, filterStatus, selectedMonth, selectedYear);

    // Cleanup debounce on unmount
    return () => {
      debouncedFetchData.cancel();
    };
  }, [currentPage, debouncedFetchData, filterStatus, triggerTotalPurchase]);

  async function fetchData(
    query: string = "",
    status: "all" | "true" | "false" = filterStatus,
    month: string = thisMonth,
    year: string = thisYear
  ) {
    setLoadPage(true);
    try {
      const params: any = {
        q: query,
        page: currentPage,
        pageSize: pageSize,
      };

      if (status !== "all") {
        params.isActive = status === "true";
      }

      const { data } = await axios.get(`/api/getListTotalPurchase?date=true&month=${month}&year=${year}`, { params });

      const totalPurchaseDataWithKeys = data.totalPurchases.map(
        (totalPurchase: DataType, index: number) => ({
          ...totalPurchase,
          key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
        })
      );
      setSelectedMonth(month);
      setSearchValue("month", month);
      setSearchValue("year", year);
      setTotalPurchaseData(totalPurchaseDataWithKeys);
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
    debouncedFetchData(value, filterStatus, selectedMonth, selectedYear);
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

  const onStatusChange = (value: "all" | "true" | "false") => {
    setFilterStatus(value);
    debouncedFetchData(searchText, value, selectedMonth, selectedYear);
  };

  function showModal(isShow: boolean, idTotalPurchase: number) {
    return () => {
      setIsModalVisible(isShow);
      setId(idTotalPurchase);
      if (idTotalPurchase === 0) {
        setMode("ADD");
        setTitle(t("Add Total Purchase"));
      } else {
        setMode("EDIT");
        setTitle(t("Edit Total Purchase"));
      }
    };
  }

  const handleYearChange = (value: SelectValue) => {
    setSelectedYear(value?.toString() || "");
    if (value) {
      setThisYear(value?.toString());
      setSearchValue("year", value.toString());
      fetchData(searchText, filterStatus, selectedMonth, value.toString())
    }
  };
  const handleMonthChange = (value: SelectValue) => {
    setSelectedMonth(value?.toString() || ""); // Update selected month, allowing for the "All" option (empty string)
    if (value) {
      setThisMonth(value?.toString());
      setSearchValue("month", value.toString());
      fetchData(searchText, filterStatus, value.toString(), selectedYear)

    }
  };
  return (
    <div className="px-4">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow default-font">
            {t("Total Purchase List")}
          </p>
          <div className="flex gap-2">
            <Select
              value={filterStatus}
              onChange={onStatusChange}
              style={{ width: 140, marginRight: 12 }}
            >
              <Option value="all">{t("all")}</Option>
              <Option value="true">{t("active")}</Option>
              <Option value="false">{t("inactive")}</Option>
            </Select>
            <Form
              form={formSearchDate}
              layout="horizontal"
              labelWrap
            >
              <div className="flex justify-between flex-col gap-2">
                <div className="grid grid-cols-2 gap-2 grid-row-2">
                  <Form.Item name="year" label={t("year")}>
                    <DatePickers
                      placeholder={t("year")}
                      name="year"
                      control={controlSearch}
                      size="middle"
                      picker="year"
                      onChange={handleYearChange}
                    />
                  </Form.Item>
                  <Form.Item name="month" label={t("month")}>
                    <Controller
                      control={controlSearch} // control from useForm()
                      name="month"
                      render={({ field }) => (
                        <Select
                          {...field}
                          showSearch
                          placeholder={t("Search a month")}
                          value={selectedMonth} // Default to current month
                          onChange={handleMonthChange} // Handle month change
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={monthOptions}
                        />
                      )}
                    />
                  </Form.Item>
                </div>
              </div>
            </Form>
            <Input.Search
              placeholder={t("search")}
              size="middle"
              style={{ width: "200px" }}
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
            <Button
              className="bg-comp-red button-backend ml-4"
              type="primary"
              icon={<PlusIcon className="w-4" />}
              onClick={showModal(true, 0)}
            >
              {t("add")}
            </Button>
          </div>
        </div>
        <Spin spinning={loadPage}>
          <DataTable
            columns={columns}
            data={totalPurchaseData}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </Spin>
        <ModalTotalPurchase
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setTriggerTotalPurchase={setTriggerTotalPurchase}
          triggerTotalPurchase={triggerTotalPurchase}
          {...(totalPurchaseData && { totalPurchaseData })}
          mode={mode}
          title={title}
          id={id}
          setId={setId}
        />
      </div>
    </div>
  );
}
