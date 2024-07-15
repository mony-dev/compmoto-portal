"use client";
import DataTable from "@components/Admin/datatable";
import ModalCategory from "@components/Admin/rewardCategory/ModalCategory";
import {
  PencilIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Form, Input, Modal, Space, Switch, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function adminsRewardCategory() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [categoryData, setCategoryData] = useState<DataType[]>([]);
  const [triggerCategory, setTriggerCategory] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [id, setId] = useState(0);
  const [cateDate, setCateData] = useState<DataType | null>(null);
  const [mode, setMode] = useState("ADD");

  interface DataType {
    rewardCount: any;
    rewards: any;
    id: number;
    name: string;
    isActive: boolean;
  }

  const deleteCategory = (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this category?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`/api/rewardCategories/${id}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          setTriggerCategory(!triggerCategory);
          router.replace("/admin/adminRewardCategory");
          toastSuccess("Category deleted successfully");
        } catch (error: any) {
          console.log("error", error.response.data.message);
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
      render: (_, record) => (
        <Link href={`/admin/adminReward/${record.id}`}>{record.name}</Link>
      ),
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
      title: "สินค้า",
      dataIndex: "rewardCount",
      key: "rewardCount",
      sorter: (a, b) => a.rewardCount-b.rewardCount,
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
            onClick={() => deleteCategory(record.id)}
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
      .get(`/api/rewardCategories?q=${searchText}`)
      .then((response) => {
        const useCate = response.data.map((cate: DataType) => ({
          key: cate.id,
          id: cate.id,
          name: cate.name,
          isActive: cate.isActive,
          rewardCount: cate?.rewards.length,
        }));

        setCategoryData(useCate);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, [searchText, triggerCategory]);

  useEffect(() => {
    if (id > 0) {
      axios
        .get(`/api/rewardCategories/${id}`)
        .then((response) => {
          setCateData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
        });
      setMode("EDIT");
    }
  }, [id, triggerCategory]);

  function showModal(isShow: boolean, idCate: number) {
    return () => {
      setIsModalVisible(isShow);
      setId(idCate);
      if (idCate === 0) {
        setMode("ADD");
      } else {
        setMode("EDIT");
      }
    };
  }
  return (
    <div className="px-12">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow">หมวดหมู่แลกรางวัล</p>
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

        <DataTable columns={columns} data={categoryData}></DataTable>
        <ModalCategory
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setTriggerCategory={setTriggerCategory}
          triggerCategory={triggerCategory}
          {...(cateDate && { cateDate })}
          mode={mode}
        />
      </div>
    </div>
  );
}
