"use client";
import dynamic from "next/dynamic";
import debounce from "lodash.debounce";
import { ArrowPathIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Input, Tag } from "antd";
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
const ModalProduct = dynamic(
  () => import("@components/Admin/product/ModalProduct")
);
interface DataType {
  key: number;
  id: number;
  code: string;
  name: string;
  brandId: number;
  price: number;
  navStock: number;
  portalStock: number;
  minisizeId?: number;
  promotionId?: number;
  years: JSON;
  lv1Id?: number;
  lv2Id?: number;
  lv3Id?: number;
  brand?: {
    name: string;
  };
  minisize?: {
    name: string;
    lv1?: any;
    lv2?: any;
    lv3?: any;
  };
  promotion?: {
    name: string;
  };
  imageProducts?: { url: string }[];
  lv1Name: string;
  lv2Name: string;
  lv3Name: string;
}

export default function adminProduct({ params }: { params: { id: number } }) {
  const locale = useCurrentLocale(i18nConfig);
  const { t } = useTranslation();
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const [searchText, setSearchText] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });
  const router = useRouter();
  const [productData, setProductData] = useState<DataType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [triggerProduct, setTriggerProduct] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mode, setMode] = useState("ADD");
  const [id, setId] = useState(0);
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
  }, [currentPage, debouncedFetchData, triggerProduct]);

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
      const { data } = await axios.get(`/api/adminProduct`, {
        params: {
          q: query,
          page: currentPage,
          pageSize: pageSize,
        },
      });

      // Add 'key' to each product
      const productDataWithKeys = data.products.map(
        (product: DataType, index: number) => ({
          ...product,
          key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
        })
      );
      setProductData(productDataWithKeys);
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
      title: t("code"),
      dataIndex: "code",
      key: "code",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t("category"),
      dataIndex: "productCount",
      key: "productCount",
      render: (_, { lv1Name, lv2Name, lv3Name }) => (
        <>
          {lv1Name && (
            <Tag color={"green"} key={lv1Name}>
              {lv1Name}
            </Tag>
          )}
          {lv2Name && (
            <Tag color={"blue"} key={lv2Name}>
              {lv2Name}
            </Tag>
          )}
          {lv3Name && (
            <Tag color={"red"} key={lv3Name}>
              {lv3Name}
            </Tag>
          )}
        </>
      ),
    },
    {
      title: t("promotion"),
      dataIndex: "promotionName",
      key: "promotionName",
      defaultSortOrder: "descend",
      sorter: (a, b) => {
        const nameA = a.promotion?.name || "";
        const nameB = b.promotion?.name || "";
        return nameA.localeCompare(nameB);
      },
      render: (_, record) => <p>{record?.promotion?.name}</p>,
    },
    {
      title: t("stock"),
      dataIndex: "portalStock",
      key: "portalStock",
      sorter: (a, b) => a.portalStock - b.portalStock,
    },
    {
      title: t("action"),
      key: "action",
      render: (_, record) => (
        <div className="flex">
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pr-2 underline"
            onClick={showModal(true, record.id)}
          >
            <Cog6ToothIcon className="w-4 mr-0.5" />
            <span>{t("setting")}</span>
          </p>
        </div>
      ),
    },
  ];

  function showModal(isShow: boolean, idProduct: number) {
    return () => {
      setIsModalVisible(isShow);
      setId(idProduct);
      if (idProduct === 0) {
        setMode("ADD");
      } else {
        setMode("EDIT");
      }
    };
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
            <p className="text-lg font-semibold pb-4 grow">{t("product")}</p>
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
              loading={isSyncing} // Add loading prop
              onClick={async () => {
                setIsSyncing(true); // Set loading to true when the button is clicked
                try {
                  const response = await axios.get("/api/fetchProducts");
                  toastSuccess(t("Sync product successfully"));
                  setTriggerProduct(!triggerProduct);
                } catch (error: any) {
                  toastError(error);
                } finally {
                  setIsSyncing(false); // Set loading to false after the request completes
                }
              }}
            >
              {t("Sync")}
            </Button>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={productData}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />

        <ModalProduct
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setTriggerProduct={setTriggerProduct}
          triggerProduct={triggerProduct}
          {...(productData && { productData })}
          mode={mode}
          id={id}
          setId={setId}
        />
      </div>
    </div>
  );
}
