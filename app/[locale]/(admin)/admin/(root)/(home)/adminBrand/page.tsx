"use client";
import dynamic from "next/dynamic";

import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Flex, Input, Modal, Space, Spin, Tag } from "antd";
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
const Loading = dynamic(() => import("@components/Loading"));
const DataTable = dynamic(() => import("@components/Admin/Datatable"));

export default function adminBrand() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchText, setSearchText] = useState(() => {
    // Initialize searchText from query parameter 'q' or default to an empty string
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [brandData, setBrandData] = useState<DataType[]>([]);
  const [triggerBrand, setTriggerBrand] = useState(false);
  const locale = useCurrentLocale(i18nConfig);
  const {setI18nName, setLoadPage, loadPage} = useCart();
  const pathname = usePathname();
  const searchParams = useSearchParams();


  interface DataType {
    key: number;
    id: number;
    name: string;
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
      title: t('action'),
      key: "action",
      render: (_, record) => (
        <div className="flex">
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pr-2"
            // onClick={() => router.push(`/${locale}/admin/admins/${record.id}`)}
          >
            <PencilSquareIcon className="w-4 mr-0.5" />
            <span>{t('special bonus')}</span>
          </p>
        </div>
      ),
    },
  ];

    // Debounce function for search input
    const debouncedFetchData = useCallback(
      debounce(() => {
        fetchData(searchText);
        // fetchBrands();
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
      const { data } = await axios.get(`/api/brand`, {
        params: {
          q: query,
          page: currentPage,
          pageSize: pageSize,
        },
      });

      const brandDataWithKeys = data.brands.map(
        (brand: DataType, index: number) => ({
          ...brand,
          key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
        })
      );

      setBrandData(brandDataWithKeys);
      setTotal(data.total);
    } catch (error: any) {
      toastError(error);
    } finally {
      setLoadPage(false);
    }
  }
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
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow">{t('brands')}</p>
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
          </div>
        </div>


        <DataTable
          columns={columns}
          data={brandData}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}