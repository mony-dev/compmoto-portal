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
  Tabs,
  TabsProps,
} from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "@components/Admin/Cartcontext";
import { useSession } from "next-auth/react";
import debounce from "lodash.debounce";
import { CloseCircleOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
const Loading = dynamic(() => import("@components/Loading"));
const DataTable = dynamic(() => import("@components/Admin/Datatable"));
const ModalVerify = dynamic(() => import("@components/Admin/RewardUser/ModalVerify"));

export default function claims({
  params,
}: {
  params: { id: number };
}) {
  const { t } = useTranslation();
  const {setI18nName, setLoadPage, loadPage} = useCart();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchText, setSearchText] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [claimData, setClaimData] = useState<ClaimDataType[]>([]);
  const [claimCount, setClaimCount] = useState<ClaimDataType[]>([]);
  const [triggerClaim, setTriggerClaim] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [id, setId] = useState(0);
  const [mode, setMode] = useState("ADD");
  const [title, setTitle] = useState(t("Reviewing"));
  const [completeCount, setCompleteCount] = useState(0);
  const [incompleteCount, setIncompleteCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const locale = useCurrentLocale(i18nConfig);

  const pathname = usePathname();
  const [activeTabKey, setActiveTabKey] = useState("1");

  interface ClaimDataType {
    key: number;
    id: number;
    claimNo: string;
    condition: string;
    details: string;
    createdAt: string;
    status: string;
    user: {
      custNo: string;
      id: number;
      contactName: string;
    };
    product: {
      id: number;
      name: string;
    };
    images: {
      url: string;
      type: string;
      role: string;
    };
  }

  const columns: ColumnsType<ClaimDataType> = [
    {
      title: t('claimNo'),
      dataIndex: "claimNo",
      key: "claimNo",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.key - a.key,
      render: (_, record) => (
        <Link href={`/${locale}/admin/claim/${record.id}`}>{record.claimNo}</Link>
      ),
    },
    {
      title: t('name'),
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.user.contactName.localeCompare(b.user.contactName),
      render: (_, record) => <p>{record.user.contactName}</p>,
    },
    {
      title: t('product'),
      dataIndex: "product",
      key: "product",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.product.name.localeCompare(b.product.name),
      render: (_, record) => <p>{record.product.name}</p>,
    },
    {
      title: t('Date'),
      dataIndex: "date",
      key: "date",
      render: (_, record) => <p>{formatDate(record.createdAt)}</p>,
      sorter: (a, b) =>
        formatDate(a.createdAt).localeCompare(formatDate(b.createdAt)),
    },
  ];

    // Debounce function for search input
    const debouncedFetchData = useCallback(
      debounce(() => {
        fetchData(searchText);
        if (activeTabKey === "1") {
          fetchData("inProgress", searchText); // Fetch incomplete data
        } else if (activeTabKey === "2") {
          fetchData("complete", searchText); // Fetch complete data
        } else {
          fetchData("incomplete", searchText);
        }
      }, 500), // 500 ms debounce delay
      [currentPage, pageSize, activeTabKey, triggerClaim]
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
        <Badge className="redeem-badge default-font" count={inProgressCount} offset={[10, 1]} overflowCount={99}>
          <p>{t("Inprogress")}</p>
        </Badge>
      ),
      children: (
        <DataTable
        columns={columns}
        data={claimData}
        total={total}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
      ),
    },
    {
      key: "2",
      label: (
        <Badge className="redeem-badge default-font" count={completeCount} offset={[10, 1]} overflowCount={99}>
          <p>{t("complated")}</p>
        </Badge>
      ),
      children: (
        <DataTable
        columns={columns}
        data={claimData}
        total={total}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
      ),
    },
    {
      key: "3",
      label: (
        <Badge className="redeem-badge default-font" count={incompleteCount} offset={[10, 1]} overflowCount={99}>
          <p>{t("inComplated")}</p>
        </Badge>
      ),
      children: (
        <DataTable
        columns={columns}
        data={claimData}
        total={total}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
      ),
    },
  ];

  const fetchData = async (claimStatus: string, query: string = "") => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/claim`, {
        params: {
          q: query,
          page: currentPage,
          pageSize: pageSize,
          status: claimStatus,
          userId: session?.user.id
        },
      });
  
      const claimUserDataWithKeys = data.claims.map(
        (claim: ClaimDataType, index: number) => ({
          ...claim,
          key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
        })
      );
      setClaimCount(data.claimCount)
      setClaimData(claimUserDataWithKeys);
      setTotal(data.total);
  
      // Update counts
      const complete = data.claimCount.filter((item: ClaimDataType) => item.status === "Complete").length;
      const incomplete = data.claimCount.filter((item: ClaimDataType) => item.status === "Incomplete").length;
      const inprogress = data.claimCount.filter((item: ClaimDataType) => item.status === "InProgress").length;
      setCompleteCount(complete);
      setIncompleteCount(incomplete);
      setInProgressCount(inprogress);
    } catch (error: any) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchData("", value); // Trigger data fetch only on search
  };
  const handleClear = () => {
    setSearchText(""); // Clear the input
    fetchData("", ""); // Reset the list to show all data
  };

  const onChange = (key: string) => {
    setActiveTabKey(key); // Update active tab state
    setCurrentPage(1);
  };

  if (loading || !t) {
    return <Loading />;
  }

  return (
    <div className="px-4">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow default-font">{t("Claim List")}</p>
          <div className="flex">
          <Input.Search
              placeholder={t("search")}
              size="middle"
              style={{ width: "200px", marginBottom: "20px" }}
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
          </div>
        </div>
        <Tabs
          activeKey={activeTabKey}
          items={items}
          onChange={onChange}
          className="redeem-tab"
        />
        
        {/* <ModalClaimVerify
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setTriggerReward={setTriggerReward}
          triggerReward={triggerReward}
          {...(claimData && { claimData })}
          mode={mode}
          title={title}
          id={id}
        /> */}
      </div>
    </div>
  );
}
