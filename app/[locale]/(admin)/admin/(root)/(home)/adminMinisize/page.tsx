"use client";
import ModalReward from "@components/Admin/category/ModalReward";
import ModalCategory from "@components/Admin/rewardCategory/ModalCategory";
import {
  ChevronRightIcon,
  PencilIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toastError, toastSuccess } from "@lib-utils/helper";
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
import DataTable from "@components/Admin/Datatable";

export default function adminMinisize({ params }: { params: { id: number } }) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [minisizeData, setMinisizeData] = useState<DataType[]>([]);
  const [triggerMinisize, setTriggerMinisize] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  // const [Data, setReData] = useState<DataType | null>(null);
  const [mode, setMode] = useState("ADD");
  const [id, setId] = useState(0);
  const [title, setTitle] = useState("ตั้งค่ามินิไซต์");
  const locale = useCurrentLocale(i18nConfig);

  interface DataType {
    id: number;
    name: string;
    isActive: boolean;
    brandId: number;
    lv1: JSON;
    lv2: JSON;
    lv3: JSON;
    productCount: number;
    imageProfile: string;
  }


  const deleteMinisize = (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this minisize?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`/api/adminMinisize/${id}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          setTriggerMinisize(!triggerMinisize);
          router.replace(`/${locale}/admin/adminMinisize`);
          toastSuccess("Minisize deleted successfully");
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
      title: "สินค้า",
      dataIndex: "productCount",
      key: "productCount",
      sorter: (a, b) => a.productCount - b.productCount,
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
            onClick={() => deleteMinisize(record.id)}
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
      .get(`/api/adminMinisize?q=${searchText}`)
      .then((response) => {
        const useMinisize = response.data.map((minisize: DataType) => ({
          key: minisize.id,
          id: minisize.id,
          name: minisize.name,
          isActive: minisize.isActive,
          productCount: minisize.productCount,
          brandId: minisize.brandId,
          lv1: minisize.lv1,
          lv2: minisize.lv2,
          lv3: minisize.lv3,
          imageProfile: minisize?.imageProfile
        }));
        setMinisizeData(useMinisize);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, [searchText, triggerMinisize]);

  useEffect(() => {
    isModalVisible ? setMode('EDIT') : setMode('ADD');
  }, [isModalVisible]);

  function showModal(isShow: boolean, idReward: number) {
    return () => {
      setIsModalVisible(isShow);
      setId(idReward);
      if (idReward === 0) {
        setMode("ADD");
        setTitle("ตั้งค่ามินิไซต์");
      } else {
        setMode("EDIT");
        setTitle("แก้ไขมินิไซต์");
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
              {t("setting_minisize")}
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
        <DataTable columns={columns} data={minisizeData}></DataTable>

        <ModalMinisize
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setTriggerMinisize={setTriggerMinisize}
          triggerMinisize={triggerMinisize}
          {...(minisizeData && { minisizeData })}
          mode={mode}
          title={title}
          id={id}
          setId={setId}
        />
      </div>
    </div>
  );
}
