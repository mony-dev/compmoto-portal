"use client";
import dynamic from "next/dynamic";

import {
  PencilSquareIcon,
  PlusIcon,
  EllipsisHorizontalCircleIcon
} from "@heroicons/react/24/outline";
import { toastError } from "@lib-utils/helper";
import {
  Button,
  Input,
  Select,
  Tag,
} from "antd";
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
import ModalRewardPoint from "@components/Admin/rewardPoint/ModalRewardPoint";
const Loading = dynamic(() => import("@components/Loading"));
const DataTable = dynamic(() => import("@components/Admin/Datatable"));

export default function adminRewardPoint() {
  const { Option } = Select;

  const { t } = useTranslation();
  const router = useRouter();
  const [searchText, setSearchText] = useState(() => {
    // Initialize searchText from query parameter 'q' or default to an empty string
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [rewardPointData, setRewardPointData] = useState<DataType[]>([]);
  const locale = useCurrentLocale(i18nConfig);
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filterStatus, setFilterStatus] = useState<"all" | "true" | "false">("all");
 
  const [triggerRewardPoint, setTriggerRewardPoint] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mode, setMode] = useState("ADD");
  const [id, setId] = useState(0);
  const [title, setTitle] = useState(t("Add Reward Point"));

  interface DataType {
    key: number;
    id: number;
    name: string;
    monthYear: string;
    isFinalize: boolean;
    resetDate: Date;
    expenses: number;
    point: number;
    customerGroup: {
      name: string;
    };
    specialBonus: {
      name: string;
    }
    totalPurchase: {
      name: string;
    }
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
      title: t("special bonus name"),
      dataIndex: "specialBonusName",
      key: "specialBonusName",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.specialBonus?.name.localeCompare(b.specialBonus?.name),
      render: (_, record) => <p>{record.specialBonus?.name}</p>,
    },
    {
      title: t("total purchase name"),
      dataIndex: "totalPurchaseName",
      key: "totalPurchaseName",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.totalPurchase?.name.localeCompare(b.totalPurchase?.name),
      render: (_, record) => <p>{record.totalPurchase?.name}</p>,
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
      dataIndex: "isFinalize",
      sorter: (a: DataType, b: DataType) =>
        Number(b.isFinalize) - Number(a.isFinalize),
      render: (isFinalize: boolean) => (
        <Tag color={isFinalize ? "green" : "grey"}>
          {isFinalize ? t("active") : t("inactive")}
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
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pr-2"
            onClick={() => router.push(`/${locale}/admin/adminRewardPointHistory/${record.id}`)}
          >
            <EllipsisHorizontalCircleIcon className="w-4 mr-0.5" />
            <span>{t("history")}</span>
          </p>
        </div>
      ),
    },
  ];

  // Debounce function for search input
  const debouncedFetchData = useCallback(
    debounce((query: string, status: "all" | "true" | "false") => {
      fetchData(query, status);
    }, 500), // 500 ms debounce delay
    [currentPage, pageSize]
  );

  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);

    // Call the debounced fetch function
    debouncedFetchData(searchText, filterStatus);

    // Cleanup debounce on unmount
    return () => {
      debouncedFetchData.cancel();
    };
  }, [currentPage, debouncedFetchData, filterStatus, triggerRewardPoint]);

  useEffect(() => {
    // Update the URL with the search query
    const queryParams = new URLSearchParams(searchParams.toString());
    if (searchText) {
      queryParams.set("q", searchText);
    } else {
      queryParams.delete("q");
    }
    const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
    // @ts-ignore: TypeScript error explanation or ticket reference
    router.push(newUrl, undefined, { shallow: true });
  }, [searchText]);

  async function fetchData(query: string = "", status: "all" | "true" | "false" = filterStatus) {
    setLoadPage(true);
    try {
      const params: any = {
        q: query,
        page: currentPage,
        pageSize: pageSize,
      };

      if (status !== "all") {
        params.isFinalize = status === "true";
      }
  
      const { data } = await axios.get(`/api/getListRewardPoint`, { params });
  

      const rewardPointDataWithKeys = data.rewardPoints.map(
        (rewardPoint: DataType, index: number) => ({
          ...rewardPoint,
          key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
        })
      );

      setRewardPointData(rewardPointDataWithKeys);
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
    fetchData(value); // Trigger data fetch only on search
  };
  const handleClear = () => {
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
    debouncedFetchData(searchText, value);
  };

  function showModal(isShow: boolean, idRewardPoint: number) {
    return () => {
      setIsModalVisible(isShow);
      setId(idRewardPoint);
      if (idRewardPoint === 0) {
        setMode("ADD");
        setTitle(t("Add Reward Point"));
      } else {
        setMode("EDIT");
        setTitle(t("Edit Reward Point"));
      }
    };
  }

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
          <p className="text-lg font-semibold pb-4 grow default-font">
            {t("Reward Point List")}
          </p>
          <div className="flex items-center">
            <Select
              value={filterStatus}
              onChange={onStatusChange}
              style={{ width: 140, marginRight: 12 }}
            >
              <Option value="all">{t("all")}</Option>
              <Option value="true">{t("active")}</Option>
              <Option value="false">{t("inactive")}</Option>
            </Select>
            <Input.Search
              placeholder={t("search")}
              size="middle"
              style={{ width: "200px" }}
              value={searchText}
              onSearch={handleSearch}
              onChange={handleInputChange}
              suffix={
                searchText ? (
                  <CloseCircleOutlined
                    onClick={handleClear}
                    style={{ cursor: "pointer" }}
                  />
                ) : null
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

        <DataTable
          columns={columns}
          data={rewardPointData}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
        <ModalRewardPoint
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setTriggerRewardPoint={setTriggerRewardPoint}
          triggerRewardPoint={triggerRewardPoint}
          {...(rewardPointData && { rewardPointData })}
          mode={mode}
          title={title}
          id={id}
          setId={setId}
        />  
      </div>
    </div>
  );
}
