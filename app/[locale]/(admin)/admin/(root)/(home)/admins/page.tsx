"use client";
import DataTable from "@components/Admin/Datatable";
import {
  PencilIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Input, Modal, Space, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import i18nConfig from "../../../../../../../i18nConfig";
import { useCurrentLocale } from "next-i18n-router/client";

export default function admins() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [userData, setUserData] = useState<DataType[]>([]);
  const [triggerUser, setTriggerUser] = useState(false);
  const locale = useCurrentLocale(i18nConfig);

  interface DataType {
    id: number;
    name: string;
    email: string;
    status: string;
    role: string;
  }

  const deleteAdmin = (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this admin?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          const response = await axios.delete(
            `/api/users/${id}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          setTriggerUser(!triggerUser)
          router.replace(`/${locale}/admin/admins`);
          toastSuccess("User deleted successfully");
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
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "role",
      key: "role",
      dataIndex: "role",
      sorter: (a, b) => a.role.localeCompare(b.role),
      render: (_, { role }) => (
        <>
          <Tag
            color={
              role === "ADMIN" ? "red" : role === "CLAIM" ? "green" : "blue"
            }
            key={role}
          >
            {role}
          </Tag>
        </>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex">
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pr-2"
            onClick={() => router.push(`/${locale}/admin/admins/${record.id}`)}
          >
            <PencilSquareIcon className="w-4 mr-0.5" />
            <span>Edit</span>
          </p>
          |
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pl-2"
            onClick={() => deleteAdmin(record.id)}
          >
            <TrashIcon className="w-4 mr-0.5" />
            <span>Delete</span>
          </p>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const roles = ["ADMIN", "CLAIM", "SALE"];

    axios
      .get(`/api/users?role=${roles}&q=${searchText}`)
      .then((response) => {
        const userData = response.data.map((user: DataType) => ({
          key: user.id,
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        }));

        setUserData(userData);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, [searchText, triggerUser]);

  return (
    <div className="px-12">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow">ตั้งค่าพนักงาน</p>
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
              onClick={() => router.push(`/${locale}/admin/admins/new`)}
            >
              Add
            </Button>
          </div>
        </div>

        <DataTable columns={columns} data={userData}></DataTable>
      </div>
    </div>
  );
}
