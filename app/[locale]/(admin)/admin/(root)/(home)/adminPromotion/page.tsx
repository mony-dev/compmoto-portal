"use client";
import ModalReward from "@components/Admin/category/ModalReward";
import DataTable from "@components/Admin/Datatable";
import ModalCategory from "@components/Admin/rewardCategory/ModalCategory";
import {
  ChevronRightIcon,
  PencilIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { formatDate, toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Form, Input, Modal, Space, Switch, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { DateTime } from "luxon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import { useTranslation } from "react-i18next";
import ModalMinisize from "@components/Admin/minisize/ModalMinisize";
import ModalPromotion from "@components/Admin/promotion/ModalPromotion";

export default function adminPromotion({ params }: { params: { id: number } }) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [promotionData, setPromotionData] = useState<DataType[]>([]);
  const [triggerPromotion, setTriggerPromotion] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mode, setMode] = useState("ADD");
  const [id, setId] = useState(0);
  const [title, setTitle] = useState("เพิ่มโปรโมชัน");
  const locale = useCurrentLocale(i18nConfig);

  interface DataType {
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
      title: "Are you sure you want to delete this promotion?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`/api/promotion/${id}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          setTriggerPromotion(!triggerPromotion);
          router.replace(`/${locale}/admin/adminPromotion`);
          toastSuccess("Promotion deleted successfully");
        } catch (error: any) {
          toastError(error.response.data.message);
        }
      },
    });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.id.toString().localeCompare(b.id.toString()),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
        title: "วันที่เริ่มต้น",
        dataIndex: "startDate",
        key: "startDate",
        render: (_, record) => <p>{formatDate(record.startDate)}</p>,
        sorter: (a, b) =>
          formatDate(a.startDate).localeCompare(formatDate(b.startDate)),
      },
      {
        title: "วันที่สิ้นสุด",
        dataIndex: "endDate",
        key: "endDate",
        render: (_, record) => <p>{formatDate(record.endDate)}</p>,
        sorter: (a, b) =>
          formatDate(a.endDate).localeCompare(formatDate(b.endDate)),
      },
    {
      title: "แสดง",
      key: "isActive",
      dataIndex: "isActive",
      sorter: (a: DataType, b: DataType) =>
        Number(b.isActive) - Number(a.isActive),
      render: (isActive: boolean) => (
        <div className="switch-backend">
          <Switch
            checked={isActive}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            disabled
          />
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex">
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pr-2"
            onClick={showModal(true, record.id)}
          >
            <PencilSquareIcon className="w-4 mr-0.5" />
            <span>Edit</span>
          </p>
          |
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pl-2"
            onClick={() => deletePromotion(record.id)}
          >
            <TrashIcon className="w-4 mr-0.5" />
            <span>Delete</span>
          </p>
        </div>
      ),
    },
  ];

  useEffect(() => {
    axios
      .get(`/api/promotion?q=${searchText}`)
      .then((response) => {
        const usePromotion = response.data.map((promotion: DataType) => ({
          key: promotion.id,
          id: promotion.id,
          name: promotion.name,
          isActive: promotion.isActive,
          minisizeId: promotion.minisizeId,
          amount: promotion.amount,
          productRedeem: promotion.productRedeem,
          userGroup: promotion.userGroup,
          startDate: promotion.startDate,
          endDate: promotion.endDate,
          image: promotion?.image,
        }));
        setPromotionData(usePromotion);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, [searchText, triggerPromotion]);

  function showModal(isShow: boolean, idPromotion: number) {
    return () => {
      setIsModalVisible(isShow);
      setId(idPromotion);
      if (idPromotion === 0) {
        setMode("ADD");
        setTitle("เพิ่มโปรโมชัน");
      } else {
        setMode("EDIT");
        setTitle("แก้ไขโปรโมชัน");
      }
    };
  }
  const { t } = useTranslation();

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
              placeholder="Search"
              size="middle"
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "200px", marginBottom: "20px" }}
            />
            <Button
              className="bg-comp-red button-backend ml-4"
              type="primary"
              icon={<PlusIcon className="w-4" />}
              onClick={showModal(true, 0)}
            >
              Add
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={promotionData}></DataTable>

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
