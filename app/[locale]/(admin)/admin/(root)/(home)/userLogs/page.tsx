"use client";
import DataTable from "@components/Admin/datatable";
import {
  ArrowPathIcon,
  PencilIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { toastSuccess } from "@lib-utils/helper";
import { Button, Input, Space, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { exec } from "child_process";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function userLogs() {
  const router = useRouter();

  interface DataLogType {
    user: any;
    id: number;
    ipAddress: string;
    createdAt: DateTime;
    userName: string;
    userEmail: string;
  }

  const columns: ColumnsType<DataLogType> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.id.toString().localeCompare(b.id.toString()),
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.ipAddress.localeCompare(b.ipAddress),
    },
    {
      title: "User Email",
      dataIndex: "userEmail",
      key: "userEmail",
      sorter: (a, b) => a.userEmail.length - b.userEmail.length, 
    },
    {
      title: "User name",
      dataIndex: "userName",
      key: "userName",
      sorter: (a, b) => a.userName.length - b.userName.length,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => a.createdAt.valueOf() - b.createdAt.valueOf(),
    },
  ];
  const [searchText, setSearchText] = useState("");
  const [userLogData, setUserLogData] = useState<DataLogType[]>([]);
  useEffect(() => {
    axios
      .get(`/api/userLogs?q=${searchText}`)
      .then((response) => {
        const userLogData = response.data.map((userLog: DataLogType) => ({
          key: userLog.id,
          id: userLog.id,
          ipAddress: userLog.ipAddress,
          userEmail: userLog.user.email,
          userName: userLog.user.name,
          createdAt: userLog.createdAt
        }));

        setUserLogData(userLogData);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, [searchText]);

  return (
    <div className="px-12">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow">ตั้งค่าผู้ใช้งาน</p>
          <div className="flex">
            <Input.Search
              placeholder="Search"
              size="middle"
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "200px", marginBottom: "20px" }}
            />
          </div>
        </div>

        <DataTable columns={columns} data={userLogData}></DataTable>
      </div>
    </div>
  );
}
