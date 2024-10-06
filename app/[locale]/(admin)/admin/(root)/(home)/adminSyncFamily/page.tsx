"use client";
import dynamic from "next/dynamic";
import debounce from "lodash.debounce";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Input } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import { useCart } from "@components/Admin/Cartcontext";
import { CloseCircleOutlined } from "@ant-design/icons";

const Loading = dynamic(() => import("@components/Loading"));
const DataTable = dynamic(() => import("@components/Admin/Datatable"));

interface DataType {
  key: number;
  id: number;
  name: string;
}

export default function adminSyncFamily({ params }: { params: { id: number } }) {
  const locale = useCurrentLocale(i18nConfig);
  const { t } = useTranslation();
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const [searchText, setSearchText] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });
  const router = useRouter();
  const [familyData, setFamilyData] = useState<DataType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isSyncing, setIsSyncing] = useState(false);

  // Debounce function for search input
  const debouncedFetchData = useCallback(
    debounce(() => {
      fetchData(searchText);
    }, 500), // 500 ms debounce delay
    [currentPage, pageSize]
  );

  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);

    // Call the debounced fetch function
    debouncedFetchData();

    // Cleanup debounce on unmount
    return () => {
      debouncedFetchData.cancel();
    };
  }, [currentPage, debouncedFetchData]);

  useEffect(() => {
    // Update the URL with the search query
    const queryParams = new URLSearchParams(searchParams.toString());
    if (searchText) {
      queryParams.set('q', searchText);
    } else {
      queryParams.delete('q');
    }
    const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
    // @ts-ignore: TypeScript error explanation or ticket reference
    router.push(newUrl, undefined, { shallow: true });

  }, [searchText]);

  async function fetchData(query: string = "") {
    setLoadPage(true);
    try {
      const { data } = await axios.get(`/api/adminFamily`, {
        params: {
          q: query,
          page: currentPage,
          pageSize: pageSize,
        },
      });

      // Add 'key' to each product
      const familyDataWithKeys = data.data.map(
        (family: DataType, index: number) => ({
          ...family,
          key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
        })
      );
      setFamilyData(familyDataWithKeys);
      setTotal(data.total);
    } catch (error: any) {
      console.log(error)
      toastError(error);
    } finally {
      setLoadPage(false);
    }
  }

  const columns: ColumnsType<DataType> = [
    {
      title: t("no"),
      dataIndex: "key",
      key: "key",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.key - a.key,
    },
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchData(value); // Trigger data fetch only on search
  };
  const handleClear = () => {
    setSearchText(""); // Clear the input
    fetchData(""); // Reset the list to show all data
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  const fetchFamily = async () => {
    try {
      const { data } = await axios.get(`/api/fetchFamily`);
    } catch (error: any) {
      toastError(error.message);
    }
  };

  const sync = async () => {
    try {
      setIsSyncing(true); 
      await fetchFamily();
      setTimeout(async () => {
        await fetchData(); // Fetch the latest data after a short delay
        setIsSyncing(false); 
        toastSuccess(t("Sync data successfully"));
      }, 3000);
    } catch (error: any) {
      toastError(error.message);
    } 
  };
  

  if (loadPage || !t) {
    return <Loading />;
  }

  return (
    <div className="px-4">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <div className="text-lg pb-4 default-font flex">
            <p className="text-lg font-semibold pb-4 grow">{t("Family")}</p>
          </div>
          <div className="flex">
            <Input.Search
              placeholder={t('search')}
              size="middle"
              style={{ width: "200px", marginBottom: "20px" }}
              value={searchText}
              onSearch={handleSearch}
              onChange={handleInputChange}
              suffix={
                searchText ? (
                  <CloseCircleOutlined
                    onClick={handleClear}
                    style={{ cursor: "pointer" }}
                  />
                ) : null
              }
            />
            <Button
              className="bg-comp-red button-backend ml-4"
              type="primary"
              icon={<ArrowPathIcon className="w-4" />}
              loading={isSyncing} 
              onClick={async () => {
                try {
                    await sync(); 
                  } catch (error: any) {
                    toastError(error); 
                  } 
              }}
            >
              {t("Sync")}
            </Button>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={familyData}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
