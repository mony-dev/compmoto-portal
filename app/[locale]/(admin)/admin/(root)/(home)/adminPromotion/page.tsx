"use client";
import dynamic from "next/dynamic";
import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { formatDate, toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Form, Input, Modal, Space, Switch, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import { useTranslation } from "react-i18next";
import { useCart } from "@components/Admin/Cartcontext";

const Loading = dynamic(() => import("@components/Loading"));
const DataTable = dynamic(() => import("@components/Admin/Datatable"));
const ModalPromotion = dynamic(
  () => import("@components/Admin/promotion/ModalPromotion")
);

export default function adminPromotion({ params }: { params: { id: number } }) {
  const { t } = useTranslation();

  const router = useRouter();
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);
  const pathname = usePathname();
  const [promotionData, setPromotionData] = useState<DataType[]>([]);
  const [triggerPromotion, setTriggerPromotion] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mode, setMode] = useState("ADD");
  const [id, setId] = useState(0);
  const [title, setTitle] = useState(t("Add Promotion"));
  const locale = useCurrentLocale(i18nConfig);

  interface DataType {
    key: number;
    id: number;
    name: string;
    isActive: boolean;
    minisizeId: number;
    amount: number;
    productRedeem: string;
    userGroup: string;
    startDate: string;
    endDate: string;
    image: string;
  }

  const deletePromotion = (id: number) => {
    Modal.confirm({
      title: t("Are you sure you want to delete this promotion"),
      content: t("This action cannot be undone"),
      okText: t("yes"),
      okType: "danger",
      cancelText: t("cencel"),
      onOk: async () => {
        try {
          const response = await axios.delete(`/api/promotion/${id}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          setTriggerPromotion(!triggerPromotion);
          router.replace(`/${locale}/admin/adminPromotion`);
          toastSuccess(t('promotion_deleted_successfully'));
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
      title: t("Name"),
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
        title: t("Start Date"),
        dataIndex: "startDate",
        key: "startDate",
        render: (_, record) => <p>{formatDate(record.startDate)}</p>,
        sorter: (a, b) =>
          formatDate(a.startDate).localeCompare(formatDate(b.startDate)),
      },
      {
        title: t("End Date"),
        dataIndex: "endDate",
        key: "endDate",
        render: (_, record) => <p>{formatDate(record.endDate)}</p>,
        sorter: (a, b) =>
          formatDate(a.endDate).localeCompare(formatDate(b.endDate)),
      },
    {
      title: t("Show"),
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
            <span>{t("Edit")}</span>
          </p>
          |
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pl-2"
            onClick={() => deletePromotion(record.id)}
          >
            <TrashIcon className="w-4 mr-0.5" />
            <span>{t("Delete")}</span>
          </p>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);
    fetchData();
  }, [searchText, currentPage]);

  async function fetchData() {
    setLoadPage(true);
    try {
      const { data } = await axios.get(`/api/promotion`, {
        params: {
          q: searchText,
          page: currentPage,
          pageSize: pageSize,
        },
      });

      // Add 'key' to each product
      const promotionDataWithKeys = data.promotions.map(
        (product: DataType, index: number) => ({
          ...product,
          key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
        })
      );

      setPromotionData(promotionDataWithKeys);
      setTotal(data.total);
    } catch (error: any) {
      toastError(error);
    } finally {
      setLoadPage(false);
    }
  }


  function showModal(isShow: boolean, idPromotion: number) {
    return () => {
      setIsModalVisible(isShow);
      setId(idPromotion);
      if (idPromotion === 0) {
        setMode("ADD");
        setTitle(t("Add Promotion"));
      } else {
        setMode("EDIT");
        setTitle(t("Edit Promotion"));
      }
    };
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
    <div className="px-12">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <div className="text-lg pb-4 default-font flex">
            <p className="text-lg font-semibold pb-4 grow">
              {t("promotion")}
            </p>
          </div>
          <div className="flex">
            <Input.Search
              placeholder={t("Search")}
              size="middle"
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "200px", marginBottom: "20px" }}
              value={searchText}
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
          data={promotionData}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
        <ModalPromotion
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setTriggerPromotion={setTriggerPromotion}
          triggerPromotion={triggerPromotion}
          {...(promotionData && { promotionData })}
          mode={mode}
          title={title}
          id={id}
          setId={setId}
        />
      </div>
    </div>
  );
}
