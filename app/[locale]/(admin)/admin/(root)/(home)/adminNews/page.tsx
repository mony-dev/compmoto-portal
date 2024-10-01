"use client";
import dynamic from "next/dynamic";

import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Flex, Input, Modal, Space, Spin, Switch, Tag } from "antd";
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
const Loading = dynamic(() => import("@components/Loading"));
const DataTable = dynamic(() => import("@components/Admin/Datatable"));
const ModalNews = dynamic(() => import("@components/Admin/news/ModalNews"));


export default function adminNews() {
  const locale = useCurrentLocale(i18nConfig);
  const { t } = useTranslation();
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [newsData, setNewsData] = useState<DataType[]>([]);
  const [triggerNews, setTriggerNews] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mode, setMode] = useState("ADD");
  const [id, setId] = useState(0);
  const [title, setTitle] = useState(t("add_media"));
  const [minisizeOptions, setMinisizeOptions] = useState<
    { value: string; label: string }[]
  >([]);

  interface DataType {
    id: number;
    key: number;
    name: string;
    minisize: {
      id: number;
      name: string;
    };
    isActive: boolean;
    content: string;
  }
  const deleteNews = (id: number) => {
    Modal.confirm({
      title: t("are_you_sure_you_want_to_delete_this_news"),
      content: t("this_action_cannot_be_undone"),
      okText: t("yes"),
      okType: "danger",
      cancelText: t("cancel"),
      onOk: async () => {
        try {
          await axios.delete(`/api/adminNews/${id}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          setTriggerNews(!triggerNews);
          router.replace(`/${locale}/admin/adminNews`);
          toastSuccess(t("news_deleted_successfully"));
        } catch (error: any) {
          toastError(error.response.data.message);
        }
      },
    });
  };

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
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t("minisize"),
      dataIndex: "minisize",
      key: "minisize",
      sorter: (a, b) => a.minisize.name.localeCompare(b.minisize.name),
    },
    {
      title: t("show"),
      key: "isActive",
      dataIndex: "isActive",
      sorter: (a: DataType, b: DataType) =>
        Number(b.isActive) - Number(a.isActive),
      render: (isActive: boolean) => (
        <div className="switch-backend">
          <Switch
            checked={isActive}
            checkedChildren={t("active")}
            unCheckedChildren={t("inactive")}
            disabled
          />
        </div>
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
          |
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pl-2"
            onClick={() => deleteNews(record.id)}
          >
            <TrashIcon className="w-4 mr-0.5" />
            <span>{t("delete")}</span>
          </p>
        </div>
      ),
    },
  ];

    // Debounce function for search input
    const debouncedFetchData = useCallback(
      debounce(() => {
        fetchData(searchText);
        // fetchBrands();
      }, 500), // 500 ms debounce delay
      [currentPage, pageSize]
    );
  
    useEffect(() => {
      const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
      setI18nName(lastPart);
      debouncedFetchData();
      return () => {
        debouncedFetchData.cancel();
      };
    }, [currentPage, debouncedFetchData, triggerNews]);
    
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
        const { data } = await axios.get(`/api/adminNews`, {
          params: {
            q: query,
            page: currentPage,
            pageSize: pageSize,
          },
        });
  
        const newsDataWithKeys = data.news.map(
          (news: DataType, index: number) => ({
            ...news,
            key: index + 1 + (currentPage - 1) * pageSize,
          })
        );
  
        setNewsData(newsDataWithKeys);
        setTotal(data.total);
      } catch (error: any) {
        toastError(error);
      } finally {
        setLoadPage(false);
      }
    }
  
    const fetchMinisizes = async () => {
      try {
        const { data } = await axios.get(`/api/adminMinisize`);
        const minisizes = data.minisizes.map((mini: any) => ({
          value: mini.id,
          label: mini.name,
        }));
  
        setMinisizeOptions(minisizes);
      } catch (error: any) {
        toastError(error.message);
      }
    };
  
    useEffect(() => {
      fetchMinisizes();
    }, []);

    useEffect(() => {
      isModalVisible ? setMode("EDIT") : setMode("ADD");
    }, [isModalVisible]);
  
    function showModal(isShow: boolean, idReward: number) {
      return () => {
        setIsModalVisible(isShow);
        setId(idReward);
        if (idReward === 0) {
          setMode("ADD");
          setTitle(t("add_news"));
        } else {
          setMode("EDIT");
          setTitle(t("edit_news"));
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
          <p className="text-lg font-semibold pb-4 grow default-font">{t('news')}</p>
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
              {t("add")}
            </Button>
          </div>
        </div>


        <DataTable
          columns={columns}
          data={newsData}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </div>
      <ModalNews
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setTriggerNews={setTriggerNews}
          triggerNews={triggerNews}
          {...(newsData && { newsData })}
          mode={mode}
          title={title}
          id={id}
          setId={setId}
          minisizeOptions={minisizeOptions}
        />
    </div>
  );
}
