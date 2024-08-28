"use client";
import dynamic from "next/dynamic";
import {
  ChevronRightIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import debounce from "lodash.debounce";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Form, Input, Modal, Space, Switch, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import i18nConfig from "../../../../../../../../i18nConfig";
import { useCurrentLocale } from "next-i18n-router/client";
import { useTranslation } from "react-i18next";
import { useCart } from "@components/Admin/Cartcontext";
import { CloseCircleOutlined } from "@ant-design/icons";
const Loading = dynamic(() => import("@components/Loading"));
const DataTable = dynamic(() => import("@components/Admin/Datatable"));
const ModalReward = dynamic(() => import("@components/Admin/category/ModalReward"));

export default function adminsRewardCategory({
  params,
}: {
  params: { id: number };
}) {
  const { t } = useTranslation();
  const {setI18nName, setLoadPage, loadPage} = useCart();
  const router = useRouter();
  const locale = useCurrentLocale(i18nConfig);
  const [searchText, setSearchText] = useState(() => {
    // Initialize searchText from query parameter 'q' or default to an empty string
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [rewardData, setRewardData] = useState<DataType[]>([]);
  const [triggerReward, setTriggerReward] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reData, setReData] = useState<DataType | null>(null);
  const [mode, setMode] = useState("ADD");
  const [id, setId] = useState(0);
  const [title, setTitle] = useState(t("Add reward"));
  const pathname = usePathname();
  const searchParams = useSearchParams();

  interface DataType {
    key: number;
    id: number;
    name: string;
    point: number;
    startDate: string;
    endDate: string;
    image: string;
    file: string;
  }

  const deleteReward = (id: number) => {
    Modal.confirm({
      title: t("Are you sure you want to delete this reward?"),
      content: t("This action cannot be undone."),
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("Cancel"),
      onOk: async () => {
        try {
          const response = await axios.delete(`/api/reward/${id}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          setTriggerReward(!triggerReward);
          router.replace(`/${locale}/admin/adminReward/${params.id}`);
          toastSuccess(t("Reward deleted successfully"));
        } catch (error: any) {
          toastError(error.response.data.message);
        }
      },
    });
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
      title: t("Name"),
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t("Point"),
      dataIndex: "point",
      key: "point",
      sorter: (a, b) => a.point - b.point,
    },
    {
      title: t("Action"),
      key: "action",
      render: (_, record) => (
        <div className="flex">
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pr-2"
            onClick={showModal(true, record.id)}
          >
            <PencilSquareIcon className="w-4 mr-0.5" />
            <span>{t("Edit")}</span>
          </p>
          |
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pl-2"
            onClick={() => deleteReward(record.id)}
          >
            <TrashIcon className="w-4 mr-0.5" />
            <span>{t("Delete")}</span>
          </p>
        </div>
      ),
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
      const parts = pathname.split("/");
      const lastPart = parts[parts.length - 2];
      setI18nName(lastPart);
  
      // Call the debounced fetch function
      debouncedFetchData();
  
      // Cleanup debounce on unmount
      return () => {
        debouncedFetchData.cancel();
      };
    }, [currentPage, debouncedFetchData, triggerReward]);
  
    useEffect(() => {
      // Update the URL with the search query
      const queryParams = new URLSearchParams(searchParams.toString());
      if (searchText) {
        queryParams.set('q', searchText);
      } else {
        queryParams.delete('q');
      }
      const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
      // @ts-ignore: TypeScript error explanation or ticket reference
      router.push(newUrl, undefined, { shallow: true });
  
    }, [searchText]);

    async function fetchData(query: string = "") {
      setLoadPage(true);
      try {
        const { data } = await axios.get(`/api/adminReward/${params.id}`, {
          params: {
            q: query,
            page: currentPage,
            pageSize: pageSize,
          },
        });
  
        const rewardDataWithKeys = data.rewards.map(
          (order: any, index: number) => ({
            ...order,
            key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
          })
        );
        setRewardData(rewardDataWithKeys);
        setTotal(data.total);
      } catch (error: any) {
        toastError(error);
      } finally {
        setLoadPage(false);
      }
    }
  
  useEffect(() => {
    if (id > 0) {
      axios
        .get(`/api/reward/${id}`)
        .then((response) => {
          setReData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
        });
      setMode("EDIT");
    }
  }, [id, triggerReward]);

  function showModal(isShow: boolean, idReward: number) {
    return () => {
      setIsModalVisible(isShow);
      setId(idReward);
      if (idReward === 0) {
        setMode("ADD");
        setTitle(t("Add reward"));
      } else {
        setMode("EDIT");
        setTitle(t("Edit reward"));
      }
    };
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
  if (loadPage || !t) {
    return (
      <Loading/>
    );
  }
 
  return (
    <div className="px-4">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <div className="text-lg pb-4 default-font flex">
            <Link
              className="text-comp-sub-header"
              href={`/${locale}/admin/adminRewardCategory`}
            >
               {t("Reward Category")}
            </Link>{" "}
            <ChevronRightIcon className="w-4 mx-4" />{" "}
            <p className="font-semibold">{t("Reward List")}</p>
          </div>
          <div className="flex">
             <Input.Search
              placeholder={t('search')}
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
            <Button
              className="bg-comp-red button-backend ml-4"
              type="primary"
              icon={<PlusIcon className="w-4" />}
              onClick={showModal(true, 0)}
            >
              {t("Add")}
            </Button>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={rewardData}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
   
        <ModalReward
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setTriggerReward={setTriggerReward}
          triggerReward={triggerReward}
          {...(reData && { reData })}
          mode={mode}
          id={params.id}
          title={title}
        />

      </div>
    </div>
  );
}
