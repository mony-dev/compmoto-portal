"use client";
import DataTable from "@components/Admin/Datatable";
import {
  ArrowPathIcon,
  Cog6ToothIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Form, Input, Modal, Space, Switch, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import { useTranslation } from "react-i18next";
import ModalProduct from "@components/Admin/product/ModalProduct";

export default function adminProduct({ params }: { params: { id: number } }) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [productData, setProductData] = useState<DataType[]>([]);
  const [triggerProduct, setTriggerProduct] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mode, setMode] = useState("ADD");
  const [id, setId] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const locale = useCurrentLocale(i18nConfig);

  interface DataType {
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
    lv1Name: string ;
    lv2Name: string ;
    lv3Name: string ;
  }

  const columns: ColumnsType<DataType> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.id.toString().localeCompare(b.id.toString()),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "หมวดหมู่",
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
      title: "โปรโมชั่น",
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
      title: "คลังสินค้า",
      dataIndex: "portalStock",
      key: "portalStock",
      sorter: (a, b) => a.portalStock - b.portalStock,
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
            <Cog6ToothIcon className="w-4 mr-0.5" />
            <span>Setting</span>
          </p>
        </div>
      ),
    },
  ];

  useEffect(() => {
    axios
      .get(`/api/adminProduct?q=${searchText}`)
      .then((response) => {
        const useProduct = response.data.map((product: DataType) => ({
          key: product.id,
          id: product.id,
          code: product.code,
          name: product.name,
          brandId: product.brandId,
          price: product.price,
          navStock: product.navStock,
          portalStock: product.portalStock,
          minisizeId: product.minisizeId,
          promotionId: product.promotionId,
          years: product.years,
          lv1Id: product.lv1Id,
          lv2Id: product.lv2Id,
          lv3Id: product.lv3Id,
          brand: {
            name: product?.brand?.name,
          },
          minisize: {
            name: product?.minisize?.name,
            lv1: product?.minisize?.lv1,
            lv2: product?.minisize?.lv2,
            lv3: product?.minisize?.lv3,
          },
          promotion: {
            name: product?.promotion?.name,
          },
          imageProducts: product?.imageProducts,
          lv1Name: product.lv1Name,
          lv2Name: product.lv2Name,
          lv3Name: product.lv3Name,
        }));
        setProductData(useProduct);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, [searchText, triggerProduct]);

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
  const { t } = useTranslation();

  return (
    <div className="px-12">
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
              placeholder="Search"
              size="middle"
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "200px", marginBottom: "20px" }}
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
                  toastSuccess("Sync product successfully");
                  setTriggerProduct(!triggerProduct);
                } catch (error: any) {
                  toastError(error);
                } finally {
                  setIsSyncing(false); // Set loading to false after the request completes
                }
              }}
            >
              Sync
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={productData}></DataTable>

        <ModalProduct
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setTriggerProduct={setTriggerProduct}
          triggerProduct={triggerProduct}
          {...(productData && { productData })}
          mode={mode}
          id={id}
        />
      </div>
    </div>
  );
}
