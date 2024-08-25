"use client";
import dynamic from 'next/dynamic';

import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Input, Modal, Switch } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import { useTranslation } from "react-i18next";
import { useCart } from "@components/Admin/Cartcontext";
const Loading = dynamic(() => import('@components/Loading'));
const DataTable = dynamic(() => import('@components/Admin/Datatable'));
const ModalMinisize = dynamic(() => import('@components/Admin/minisize/ModalMinisize'));

export default function adminMinisize({ params }: { params: { id: number } }) {
  const locale = useCurrentLocale(i18nConfig);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const {setI18nName} = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [minisizeData, setMinisizeData] = useState<DataType[]>([]);
  const [triggerMinisize, setTriggerMinisize] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mode, setMode] = useState("ADD");
  const [id, setId] = useState(0);
  const [title, setTitle] = useState("ตั้งค่ามินิไซต์");


  interface DataType {
    id: number;
    key: number;
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
      title: t('no'),
      dataIndex: "key",
      key: "key",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.key - a.key,
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
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart)
    async function fetchData() {
      try {
        const [minisizeResponse] = await Promise.all([
          axios
            .get(`/api/adminMinisize?q=${searchText}`)
            .then((response) => {
              const minisizeDate = response.data.map((mini: DataType, index: number) => ({
                ...mini,
                key: index + 1,
              }));

              setMinisizeData(minisizeDate);
            }),
        ]);
      } catch (error: any) {
        toastError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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
  
  if (loading || !t) {
    return (
      <Loading/>
    );
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
