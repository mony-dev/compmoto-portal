"use client";
import dynamic from "next/dynamic";

import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Flex, Input, Modal, Space, Spin, Switch, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import i18nConfig from "../../../../../../../i18nConfig";
import { useCurrentLocale } from "next-i18n-router/client";
import { useTranslation } from "react-i18next";
import { useCart } from "@components/Admin/Cartcontext";
import debounce from "lodash.debounce";
import { CloseCircleOutlined } from "@ant-design/icons";
import ManualList from "@components/ManualList";
const Loading = dynamic(() => import("@components/Loading"));
const DataTable = dynamic(() => import("@components/Admin/Datatable"));
const ModalManual = dynamic(() => import("@components/Admin/userManual/ModalManual"));

export default function adminUserManual() {
  const locale = useCurrentLocale(i18nConfig);
  const { t } = useTranslation();
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [manualData, setManualData] = useState<DataType[]>([]);
  const [triggerManual, setTriggerManual] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mode, setMode] = useState("ADD");
  const [id, setId] = useState(0);
  const [title, setTitle] = useState(t("add_user_manual"));

  interface DataType {
    id: number;
    key: number;
    name: string;
    content: string;
  }
  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);
  }, []);
  if (loadPage || !t) {
    return (
      <Loading/>
    );
  }

  return (
    <div className="px-4">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
     
        <p className="text-3xl font-semibold pb-4">{t('Guide')}</p>
        <p className="text-base text-[#959596] pb-4">{t('The Guide page is your go-to resource for step-by-step instructions and helpful tips')}</p>
      </div>
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white mt-4"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <ManualList/>
      </div>
    </div>
  );
}
