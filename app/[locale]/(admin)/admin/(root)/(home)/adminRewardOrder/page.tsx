"use client";
import dynamic from "next/dynamic";
import {
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import {
  formatDate,
  toastError,
} from "@lib-utils/helper";
import {
  Badge,
  Input,
  Spin,
  Tabs,
  TabsProps,
} from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "@components/Admin/Cartcontext";
import { CloseCircleOutlined } from "@ant-design/icons";
const DataTable = dynamic(() => import("@components/Admin/Datatable"));
const ModalVerify = dynamic(() => import("@components/Admin/RewardUser/ModalVerify"));

export default function AdminRewardOrder({
  params,
}: {
  params: { id: number };
}) {
  const { t } = useTranslation();
  const {setI18nName, setLoadPage, loadPage} = useCart();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [rewardUserData, setRewardUserData] = useState<RewardDataType[]>([]);
  const [triggerReward, setTriggerReward] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [id, setId] = useState(0);
  const [mode, setMode] = useState("ADD");
  const [title, setTitle] = useState(t("Reviewing"));
  const [completeCount, setCompleteCount] = useState(0);
  const [incompleteCount, setIncompleteCount] = useState(0);
  const pathname = usePathname();
  const [activeTabKey, setActiveTabKey] = useState("1");
  const searchParams = useSearchParams();

  interface RewardDataType {
    key: number;
    id: number;
    quantity: number;
    createdAt: string;
    isComplete: boolean;
    user: {
      custNo: string;
      id: number;
      contactName: string;
    };
    reward: {
      name: string;
      point: number;
      image: string;
      file: string;
      startDate: string;
      endDate: string;
    };
  }

  const columns: ColumnsType<RewardDataType> = [
    {
      title: t('no'),
      dataIndex: "key",
      key: "key",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.key - a.key,
    },
    {
      title: t('Customer No'),
      dataIndex: "custNo",
      key: "custNo",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.user.custNo.localeCompare(b.user.custNo),
      render: (_, record) => <p>{record.user.custNo}</p>,
    },
    {
      title: t('Name'),
      dataIndex: "contactName",
      key: "contactName",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.user.contactName.localeCompare(b.user.contactName),
      render: (_, record) => <p>{record.user.contactName}</p>,
    },
    {
      title: t('Reward'),
      dataIndex: "rewardName",
      key: "rewardName",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.reward.name.localeCompare(b.reward.name),
      render: (_, record) => <p>{record.reward.name}</p>,
    },
    {
      title: t('Point'),
      dataIndex: "point",
      key: "point",
      sorter: (a, b) => a.reward.point - b.reward.point,
      render: (_, record) => <p>{record.reward.point}</p>,
    },
    {
      title: t('Quantity'),
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (_, record) => <p>{record.quantity}</p>,
    },
    {
      title: t('Date'),
      dataIndex: "date",
      key: "date",
      render: (_, record) => <p>{formatDate(record.createdAt)}</p>,
      sorter: (a, b) =>
        formatDate(a.createdAt).localeCompare(formatDate(b.createdAt)),
    },
    {
      title: t("Action"),
      key: "action",
      render: (_, record) => (
        <div className="flex">
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pr-2 underline"
            onClick={showModal(true, record.id)}
          >
            <CheckBadgeIcon className="w-4 mr-0.5" />
            <span>{t('Verify')}</span>
          </p>
        </div>
      ),
    },
  ];
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <Badge className="redeem-badge default-font" count={incompleteCount} offset={[10, 1]} overflowCount={99}>
          <p>{t("Reviewing")}</p>
        </Badge>
      ),
      children: (
        <DataTable
        columns={columns}
        data={rewardUserData}
        total={total}
        currentPage={currentPage}
        pageSize={pageSize}
        scroll={{ x: "max-content" }}
        onPageChange={handlePageChange}
      />
      ),
    },
    {
      key: "2",
      label: (
        <Badge className="redeem-badge default-font" count={completeCount} offset={[10, 1]} overflowCount={99}>
          <p>{t("Verified")}</p>
        </Badge>
      ),
      children: (
        <DataTable
        columns={columns}
        data={rewardUserData}
        total={total}
        currentPage={currentPage}
        pageSize={pageSize}
        scroll={{ x: "max-content" }}
        onPageChange={handlePageChange}
      />
      ),
    },
  ];

  // useEffect(() => {
  //   const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
  //   setI18nName(lastPart);
  //   fetchData();
  // }, [searchText, triggerReward, currentPage]);

  const fetchData = async (isComplete: boolean, value: string) => {
    setLoadPage(true);
    try {
      const { data } = await axios.get(`/api/rewardUser`, {
        params: {
          q: value,
          page: currentPage,
          pageSize: pageSize,
          isComplete, // Pass the isComplete parameter based on the active tab
        },
      });
  
      const rewardUserDataWithKeys = data.rewardUsers.map(
        (cate: RewardDataType, index: number) => ({
          ...cate,
          key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
        })
      );
      setRewardUserData(rewardUserDataWithKeys);
      setTotal(data.total);
  
      // Update counts
      const complete = rewardUserDataWithKeys.filter((item: RewardDataType) => item.isComplete).length;
      const incomplete = rewardUserDataWithKeys.filter((item: RewardDataType) => !item.isComplete).length;
  
      setCompleteCount(complete);
      setIncompleteCount(incomplete);
    } catch (error: any) {
      toastError(error);
    } finally {
      setLoadPage(false);
    }
  };

  function showModal(isShow: boolean, idCate: number) {
    return () => {
      setIsModalVisible(isShow);
      setId(idCate);
      setMode("EDIT");
      setTitle(t("Redeem Verify"));
    };
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
    const tabVal = activeTabKey === "1" ? false : true
    fetchData(tabVal, value); 
  };
  const handleClear = () => {
    window.history.replaceState(null, "", `${pathname}`);
    setCurrentPage(1);
    setSearchText(""); // Clear the input
    const tabVal = activeTabKey === "1" ? false : true

    fetchData(tabVal, ""); // Reset the list to show all data
  };

  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);
    // Fetch data based on the active tab
    if (activeTabKey === "1") {
      fetchData(false, searchText); // Fetch incomplete data
    } else if (activeTabKey === "2") {
      fetchData(true, searchText); // Fetch complete data
    }
  }, [activeTabKey, currentPage, pageSize]);

  const onChange = (key: string) => {
    setActiveTabKey(key); // Update active tab state
  };

  return (
    <div className="px-4">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <p className="text-lg font-semibold pb-4 grow default-font">{t("Reward List")}</p>
          <div className="flex">
          <Input.Search
              placeholder={t("Search")}
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
          <Tabs
            activeKey={activeTabKey}
            items={items}
            onChange={onChange}
            className="redeem-tab"
          />
        </Spin>
        <ModalVerify
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setTriggerReward={setTriggerReward}
          triggerReward={triggerReward}
          {...(rewardUserData && { rewardUserData })}
          mode={mode}
          title={title}
          id={id}
        />
      </div>
    </div>
  );
}
