"use client";
import DataTable from "@components/Admin/Datatable";
import {
  ArrowPathIcon,
  PencilIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Input, Space, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { exec } from "child_process";
import { useCurrentLocale } from "next-i18n-router/client";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import i18nConfig from "../../../../../../../i18nConfig";
import { useCart } from "@components/Admin/Cartcontext";
import { useTranslation } from "react-i18next";
import Loading from "@components/Loading";

export default function users() {
  const { t } = useTranslation();
  const {setI18nName, setLoadPage, loadPage} = useCart();
  const router = useRouter();
  const locale = useCurrentLocale(i18nConfig);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);
  const [userData, setUserData] = useState<DataType[]>([]);
  const pathname = usePathname();

  interface DataType {
    key: number;
    id: number;
    name: string;
    email: string;
    status: string;
    role: string;
    custNo: string;
  }
  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);
    fetchData();
  }, [searchText, currentPage]);

  async function fetchData() {
    setLoadPage(true);
    try {
      const roles = "USER";
      const { data } = await axios.get(`/api/users`, {
        params: {
          role: roles,
          q: searchText,
          page: currentPage,
          pageSize: pageSize,
        },
      });

      const userDataWithKeys = data.users.map(
        (user: DataType, index: number) => ({
          ...user,
          key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
        })
      );

      setUserData(userDataWithKeys);
      setTotal(data.total);
    } catch (error: any) {
      toastError(error);
    } finally {
      setLoadPage(false);
    }
  }

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  if (loadPage || !t) {
    return (
      <Loading/>
    );
  }

  const columns: ColumnsType<DataType> = [
    {
      title: t('no'),
      dataIndex: "key",
      key: "key",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.key - a.key,
    },
    {
      title: t('name'),
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t('email'),
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: t('cust_no'),
      dataIndex: "custNo",
      key: "custNo",
      sorter: (a, b) => a.custNo.localeCompare(b.custNo),
    },
    {
      title: t('role'),
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
      title: t('status'),
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: t('action'),
      key: "action",
      render: (_, record) => (
        <p
          className="flex cursor-pointer hover:text-comp-blue-link"
          onClick={() => router.push(`/${locale}/admin/users/${record.id}`)}
        >
          <PencilSquareIcon className="w-4 mr-0.5" />
          <span>{t('edit')}</span>
        </p>
      ),
    },
  ];

  return (
    <div className="px-12">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow">{t('user_setting')}</p>
          <div className="flex">
            <Input.Search
              placeholder={t('search')}
              size="middle"
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "200px", marginBottom: "20px" }}
              value={searchText}
            />
            <Button
              className="bg-comp-red button-backend ml-4"
              type="primary"
              icon={<ArrowPathIcon className="w-4" />}
              onClick={async () => {
                try {
                  const response = await axios.get('/api/fetchUsers');
                  toastSuccess("Sync user successfully");
                } catch (error: any) {
                  toastError(error);
                }
              }}
            >
              {t('sync')}
            </Button>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={userData}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
