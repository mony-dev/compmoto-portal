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
import i18nConfig from "../../../../../../../../i18nConfig";
import { useCurrentLocale } from "next-i18n-router/client";
import DataTable from "@components/Admin/Datatable";

export default function adminsRewardCategory({
  params,
}: {
  params: { id: number };
}) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [rewardData, setRewardData] = useState<DataType[]>([]);
  const [triggerReward, setTriggerReward] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reData, setReData] = useState<DataType | null>(null);
  const [mode, setMode] = useState("ADD");
  const [id, setId] = useState(0);
  const [title, setTitle] = useState("เพิ่มสินค้าแลกรางวัล");
  const locale = useCurrentLocale(i18nConfig);

  interface DataType {
    id: number;
    name: string;
    point: number;
    startDate: string;
    endDate: string;
    image: string;
    file: string;
  }

  interface AlbumDataType {
    id: number;
    name: string;
    images: any;
  }

  const deleteReward = (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this reward?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`/api/reward/${id}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          setTriggerReward(!triggerReward);
          router.replace(`/${locale}/admin/adminReward/${params.id}`);
          toastSuccess("Reward deleted successfully");
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
      // render: (_, record) => (
      //   <Link href={`/admin/adminReward/${record.id}`}>{record.name}</Link>
      // ),
    },
    {
      title: "คะแนน",
      dataIndex: "point",
      key: "point",
      sorter: (a, b) => a.point - b.point,
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
            onClick={() => deleteReward(record.id)}
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
      .get(`/api/adminReward/${params.id}?q=${searchText}`)
      .then((response) => {
        const useReward = response.data.map((reward: DataType) => ({
          key: reward.id,
          id: reward.id,
          name: reward.name,
          point: reward.point,
        }));
        setRewardData(useReward);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, [searchText, triggerReward]);

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
        setTitle("เพิ่มสินค้าแลกรางวัล");
      } else {
        setMode("EDIT");
        setTitle("แก้ไขสินค้าแลกรางวัล");
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
          <div className="text-lg pb-4 default-font flex">
            <Link
              className="text-comp-sub-header"
              href={`/${locale}/admin/adminRewardCategory`}
            >
              หมวดหมู่แลกรางวัล
            </Link>{" "}
            <ChevronRightIcon className="w-4 mx-4" />{" "}
            <p className="font-semibold">รายการสินค้าแลกรางวัล</p>
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
        <DataTable columns={columns} data={rewardData}></DataTable>

   
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
