"use client";
import ModalAlbum from "@components/Admin/category/ModalAlbum";
import DataTable from "@components/Admin/Datatable";
import ModalCategory from "@components/Admin/rewardCategory/ModalCategory";
import {
  CheckBadgeIcon,
  PencilIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  formatDate,
  formatDateRange,
  toastError,
  toastSuccess,
} from "@lib-utils/helper";
import {
  Badge,
  Button,
  Form,
  Input,
  Modal,
  Space,
  Switch,
  Tabs,
  TabsProps,
  Tag,
} from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Image } from "antd";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import { DateTime } from "luxon";
import ModalVerify from "@components/Admin/RewardUser/ModalVerify";

export default function adminRewardOrder({
  params,
}: {
  params: { id: number };
}) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [rewardUserData, setRewardUserData] = useState<RewardDataType[]>([]);
  const [triggerReward, setTriggerReward] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [id, setId] = useState(0);
  const [mode, setMode] = useState("ADD");
  const [title, setTitle] = useState("กำลังตรวจสอบ");
  const [completeCount, setCompleteCount] = useState(0);
  const [incompleteCount, setIncompleteCount] = useState(0);

  const locale = useCurrentLocale(i18nConfig);

  interface RewardDataType {
    key: number;
    id: number;
    quantity: number;
    createdAt: string;
    isComplete: boolean;
    user: {
      custNo: string;
      id: number;
      contactName: string;
    };
    reward: {
      name: string;
      point: number;
      image: string;
      file: string;
      startDate: string;
      endDate: string;
    };
  }

  const columns: ColumnsType<RewardDataType> = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.id.toString().localeCompare(b.id.toString()),
    },
    {
      title: "รหัสลูกค้า",
      dataIndex: "custNo",
      key: "custNo",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.user.custNo.localeCompare(b.user.custNo),
      render: (_, record) => <p>{record.user.custNo}</p>,
    },
    {
      title: "ชื่อ",
      dataIndex: "contactName",
      key: "contactName",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.user.contactName.localeCompare(b.user.contactName),
      render: (_, record) => <p>{record.user.contactName}</p>,
    },
    {
      title: "รางวัล",
      dataIndex: "rewardName",
      key: "rewardName",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.reward.name.localeCompare(b.reward.name),
      render: (_, record) => <p>{record.reward.name}</p>,
    },
    {
      title: "คะแนน",
      dataIndex: "point",
      key: "point",
      sorter: (a, b) => a.reward.point - b.reward.point,
      render: (_, record) => <p>{record.reward.point}</p>,
    },
    {
      title: "จำนวน",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (_, record) => <p>{record.quantity}</p>,
    },
    {
      title: "วันที่",
      dataIndex: "date",
      key: "date",
      render: (_, record) => <p>{formatDate(record.createdAt)}</p>,
      sorter: (a, b) =>
        formatDate(a.createdAt).localeCompare(formatDate(b.createdAt)),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex">
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pr-2 underline"
            onClick={showModal(true, record.id)}
          >
            <CheckBadgeIcon className="w-4 mr-0.5" />
            <span>Verify</span>
          </p>
        </div>
      ),
    },
  ];

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <Badge className="redeem-badge default-font" count={incompleteCount} offset={[10, 1]}>
          <p>กำลังตรวจสอบ</p>
        </Badge>
      ),
      children: (
        <DataTable
          columns={columns}
          data={rewardUserData.filter((item) => !item.isComplete)}
        />
      ),
    },
    {
      key: "2",
      label: (
        <Badge className="redeem-badge default-font" count={completeCount} offset={[10, 1]}>
          <p>ตรวจสอบแล้ว</p>
        </Badge>
      ),
      children: (
        <DataTable
          columns={columns}
          data={rewardUserData.filter((item) => item.isComplete)}
        />
      ),
    },
  ];

  useEffect(() => {
    axios
      .get(`/api/rewardUser?q=${searchText}`)
      .then((response) => {
        const useReward = response.data.map((reward: any) => ({
          key: reward.id,
          id: reward.id,
          quantity: reward.quantity,
          createdAt: reward.createdAt,
          isComplete: reward.isComplete,
          user: {
            custNo: reward.user.custNo,
            id: reward.user.id,
            contactName: reward.user.contactName,
          },
          reward: {
            name: reward.reward.name,
            point: reward.reward.point,
            image: reward.reward.image,
            file: reward.reward.file,
            startDate: reward.reward.startDate,
            endDate: reward.reward.endDate,
          },
        }));
        setRewardUserData(useReward);

        // Calculate counts
        const complete = useReward.filter(
          (item: { isComplete: any }) => item.isComplete
        ).length;
        const incomplete = useReward.filter(
          (item: { isComplete: any }) => !item.isComplete
        ).length;

        setCompleteCount(complete);
        setIncompleteCount(incomplete);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, [searchText, triggerReward]);


  function showModal(isShow: boolean, idCate: number) {
    return () => {
      setIsModalVisible(isShow);
      setId(idCate);
      setMode("EDIT");
      setTitle("ตรวจสอบการแลกรางวัล");
    };
  }

  const onChange = (key: string) => {
    if (key === "1") {
      setTriggerReward(false);
    } else if (key === "2") {
      setTriggerReward(true);
    }
  };
  return (
    <div className="px-12">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow">รายการแลกรางวัล</p>
          <div className="flex">
            <Input.Search
              placeholder="Search"
              size="middle"
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "200px", marginBottom: "20px" }}
            />
          </div>
        </div>
        <Tabs
          defaultActiveKey="1"
          items={items}
          onChange={onChange}
          className="redeem-tab"
        />
        
        <ModalVerify
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setTriggerReward={setTriggerReward}
          triggerReward={triggerReward}
          {...(rewardUserData && { rewardUserData })}
          mode={mode}
          title={title}
          id={id}
        />
      </div>
    </div>
  );
}
