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
import ModalManual from "@components/Admin/userManual/ModalManual";
const Loading = dynamic(() => import("@components/Loading"));
const DataTable = dynamic(() => import("@components/Admin/Datatable"));

export default function adminUserManual() {
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
  const [manualData, setManualData] = useState<DataType[]>([]);
  const [triggerManual, setTriggerManual] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mode, setMode] = useState("ADD");
  const [id, setId] = useState(0);
  const [title, setTitle] = useState(t("add_user_manual"));

  interface DataType {
    id: number;
    key: number;
    name: string;
    content: string;
  }
  const deleteManual = (id: number) => {
    Modal.confirm({
      title: t("are_you_sure_you_want_to_delete_this_user_manual"),
      content: t("this_action_cannot_be_undone"),
      okText: t("yes"),
      okType: "danger",
      cancelText: t("cancel"),
      onOk: async () => {
        try {
          await axios.delete(`/api/adminUserManual/${id}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          setTriggerManual(!triggerManual);
          router.replace(`/${locale}/admin/adminUserManual`);
          toastSuccess(t("user_manual_deleted_successfully"));
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
            onClick={() => deleteManual(record.id)}
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
    }, [currentPage, debouncedFetchData, triggerManual]);
    
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
        const { data } = await axios.get(`/api/adminUserManual`, {
          params: {
            q: query,
            page: currentPage,
            pageSize: pageSize,
          },
        });
  
        const manualDataWithKeys = data.userManuals.map(
          (userManuals: DataType, index: number) => ({
            ...userManuals,
            key: index + 1 + (currentPage - 1) * pageSize,
          })
        );
  
        setManualData(manualDataWithKeys);
        setTotal(data.total);
      } catch (error: any) {
        toastError(error);
      } finally {
        setLoadPage(false);
      }
    }

    useEffect(() => {
      isModalVisible ? setMode("EDIT") : setMode("ADD");
    }, [isModalVisible]);
  
    function showModal(isShow: boolean, idReward: number) {
      return () => {
        setIsModalVisible(isShow);
        setId(idReward);
        if (idReward === 0) {
          setMode("ADD");
          setTitle(t("add_user_manual"));
        } else {
          setMode("EDIT");
          setTitle(t("edit_user_manual"));
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
          <p className="text-lg font-semibold pb-4 grow">{t('user_manual')}</p>
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
          data={manualData}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </div>
      <ModalManual
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setTriggerManual={setTriggerManual}
          triggerManual={triggerManual}
          {...(manualData && { manualData })}
          mode={mode}
          title={title}
          id={id}
          setId={setId}
        />
    </div>
  );
}
