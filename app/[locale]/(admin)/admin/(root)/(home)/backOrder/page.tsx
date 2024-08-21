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
import { useSession } from "next-auth/react";

export default function backOrder({ params }: { params: { id: number } }) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [orderData, setOrderData] = useState<OrderDataType[]>([]);
  const [triggerOrder, setTriggerOrder] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [id, setId] = useState(0);
  const [mode, setMode] = useState("ADD");
  const [title, setTitle] = useState("กำลังตรวจสอบ");
  const [orderTotal, setOrderTotal] = useState(0);
  const [incompleteCount, setIncompleteCount] = useState(0);

  const locale = useCurrentLocale(i18nConfig);
  const { data: session } = useSession();

  interface OrderDataType {
    key: number;
    id: number;
    documentNo: string;
    externalDocument: string;
    totalAmount: number;
    type: string;
    groupDiscount: number;
    subTotal: number;
    totalPrice: number;
    created_at: string;
    user: {
      custNo: string;
      id: number;
      contactName: string;
    };
    product: any;
  }

  const columns: ColumnsType<OrderDataType> = [
    {
      title: "ลำดับ",
      dataIndex: "key",
      key: "key",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.key - a.key,
    },
    {
      title: "Document",
      dataIndex: "documentNo",
      key: "documentNo",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.documentNo.localeCompare(b.documentNo),
      render: (_, record) => (
        <Link href={`/${locale}/admin/backOrder/${record.id}`}>{record.documentNo}</Link>
      ),
    },
    {
      title: "Customer no.",
      dataIndex: "custNo",
      key: "custNo",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.user.custNo.localeCompare(b.user.custNo),
      render: (_, record) => <p>{record.user.custNo}</p>,
    },
    {
      title: "วันที่",
      dataIndex: "date",
      key: "date",
      render: (_, record) => <p>{formatDate(record.created_at)}</p>,
      sorter: (a, b) =>
        formatDate(a.created_at).localeCompare(formatDate(b.created_at)),
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      key: "totalPrice",
      sorter: (a, b) => a.totalPrice - b.totalPrice,
      render: (_, record) => (
        <p>
          {record.totalPrice.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      ),
    },
  ];

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <Badge
          className="redeem-badge default-font"
          count={orderTotal}
          offset={[15, 1]}
        >
          <p>Back orders</p>
        </Badge>
      ),
      children: <DataTable columns={columns} data={orderData} />,
    }
  ];

  useEffect(() => {
    if (session?.user?.id) {
      axios
        .get(`/api/order?q=${searchText}&type=Back&userId=${session.user.id}`)
        .then((response) => {
          const useOrder = response.data.map((order: any, index: number) => ({
            key: index + 1,
            id: order.id,
            documentNo: order.documentNo,
            externalDocument: order.externalDocument,
            totalAmount: order.totalAmount,
            type: order.type,
            groupDiscount: order.groupDiscount,
            subTotal: order.subTotal,
            totalPrice: order.totalPrice,
            created_at: order.createdAt,
            user: {
              custNo: order.user.custNo,
              id: order.user.id,
              contactName: order.user.contactName,
            },
            product: order.items,
          }));
          setOrderData(useOrder);
          setOrderTotal(useOrder.length);
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
        });
    } else {
      console.warn("User ID is undefined. Cannot fetch orders.");
    }
  }, [searchText, triggerOrder, session]);

  const onChange = (key: string) => {
    if (key === "1") {
      setTriggerOrder(false);
    } else if (key === "2") {
      setTriggerOrder(true);
    }
  };
  return (
    <div className="px-12">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-end items-center">
          <p className="text-lg font-semibold pb-4 grow">Back orders</p>
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
      </div>
    </div>
  );
}
