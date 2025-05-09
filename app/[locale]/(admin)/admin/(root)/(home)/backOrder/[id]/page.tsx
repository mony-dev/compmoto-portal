"use client";
import dynamic from "next/dynamic";

import {
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Card, Divider, Form, Input, Modal, Space, Switch, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import i18nConfig from "../../../../../../../../i18nConfig";
import { useCurrentLocale } from "next-i18n-router/client";
import { useTranslation } from "react-i18next";
import { useCart } from "@components/Admin/Cartcontext";
const Loading = dynamic(() => import("@components/Loading"));
const DataTable = dynamic(() => import("@components/Admin/Datatable"));
export default function backOrder({ params }: { params: { id: number } }) {
  const { t } = useTranslation();
  const [reData, setReData] = useState<DataType>();
  const locale = useCurrentLocale(i18nConfig);
  const pathname = usePathname();
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  interface Product {
    key: number;
    id: number;
    code: string;
    name: string;
    brandId: number;
    price: number;
    navStock: number;
    portalStock: number;
    minisizeId: number;
    promotionId: number | null;
    years: string;
    lv1Id: number | null;
    lv2Id: number | null;
    lv3Id: number | null;
    image: string;
    imageProducts: any[];
    madeToOrder: number;
  }

  interface ItemType {
    key: number;
    id: number;
    orderId: number;
    productId: number;
    amount: number;
    type: string;
    price: number;
    year: number;
    discount: number;
    discountPrice: number;
    createdAt: string;
    updatedAt: string;
    product: Product;
  }

  interface DataType {
    key: number;
    id: number;
    documentNo: string;
    subTotal: number;
    grandTotal: number;
    totalPrice: number;
    groupDiscount: number;
    groupDiscountPrice: number;
    totalAmount: number;
    type: string;
    externalDocument: string;
    user: {
      custNo: string;
      id: number;
      name: string;
      saleUser: {
        custNo: string;
      };
    };
    items: ItemType[];
  }


  useEffect(() => {
    const parts = pathname.split("/");
    const lastPart = parts[parts.length - 2];
    setI18nName(lastPart);
    setLoadPage(true);
    axios
      .get(`/api/order/${params.id}?type=Back`)
      .then((response) => {
        const order = response.data;
        const normalOrder: DataType = {
          key: order.id,
          id: order.id,
          documentNo: order.documentNo,
          subTotal: order.subTotal,
          totalPrice: order.totalPrice,
          groupDiscount: order.groupDiscount,
          groupDiscountPrice: order.subTotal * (order.groupDiscount/100) || 0,
          grandTotal: (order.subTotal - (order.subTotal * (order.groupDiscount / 100) || 0)),
          totalAmount: order.totalAmount,
          type: order.type,
          externalDocument: order.externalDocument, // Corrected from "extertalDocument"
          user: {
            custNo: order.user.custNo,
            id: order.user.id,
            name: order.user.name,
            saleUser: {
              custNo: order.user.saleUser.custNo,
            },
          },
          items: order.items.map((item: any, index: number) => ({
            key: index + 1,
            id: item.id,
            orderId: item.orderId,
            productId: item.productId,
            amount: item.amount,
            type: item.type,
            price: item.price,
            year: item.year,
            discount: item.discount,
            discountPrice: item.year
            ? item.discountPrice
            : item.price - (item.price * item.discount) / 100,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            product: {
              id: item.product.id,
              code: item.product.code,
              name: item.product.name,
              brandId: item.product.brandId,
              price: item.product.price,
              navStock: item.product.navStock,
              portalStock: item.product.portalStock,
              minisizeId: item.product.minisizeId,
              promotionId: item.product.promotionId,
              years: item.product.years,
              lv1Id: item.product.lv1Id,
              lv2Id: item.product.lv2Id,
              lv3Id: item.product.lv3Id,
              image: item.product.image,
              imageProducts: item.product.imageProducts,
              madeToOrder: item.madeToOrder
            },
          })),
        };
        setReData(normalOrder);
        setLoadPage(false);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  const columns: ColumnsType<ItemType> = [
    {
      title: t("no"),
      dataIndex: "key",
      key: "key",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.key - a.key,
    },
    {
      title: t("Item Code"),
      dataIndex: "Itemcode",
      key: "Itemcode",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.product.code.localeCompare(b.product.code),
      render: (_, record) => <p>{record.product.code}</p>,
    },
    {
      title: t("Product"),
      dataIndex: "Product",
      key: "Product",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.product.name.localeCompare(b.product.name),
      render: (_, record) => <p>{record.product.name}</p>,
    },
    {
      title:  t("qty"),
      dataIndex: "qty",
      key: "qty",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.amount.toString().localeCompare(b.amount.toString()),
      render: (_, record) => <p>{record.amount}</p>,
    },
    {
      title:  t("Quantity Received"),
      dataIndex: "madeToOrder",
      key: "madeToOrder",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.product.madeToOrder.toString().localeCompare(b.product.madeToOrder.toString()),
      render: (_, record) => <p>{record.product.madeToOrder}</p>,
    },
    {
      title: t("Unit price"),
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.product.price - b.product.price,
      render: (_, record) => (
        <p>
        ฿
        {record.year ? 
        (record.product.price - (record.product.price * (record.discount/100))).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) : record.product.price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
      ),
    },
    {
      title: t("Initial Price"),
      dataIndex: "initialPrice",
      key: "initialPrice",
      sorter: (a, b) => a.price - b.price,
      render: (_, record) => (
        <p>
          ฿
          {record.price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      ),
    },
    {
      title: t("Lot Discount"),
      dataIndex: "discount",
      key: "discount",
      defaultSortOrder: "descend",
      sorter: (a, b) =>
        a.discount.toString().localeCompare(b.discount.toString()),
      render: (_, record) => (
        <Tag bordered={false} color="error" style={{ borderRadius: "1rem" }}>
          {record.year ?  record.discount : '0'}%
        </Tag>
      ),
    },
    {
      title: t("Discount"),
      dataIndex: "discount",
      key: "discount",
      defaultSortOrder: "descend",
      sorter: (a, b) =>
        a.discount.toString().localeCompare(b.discount.toString()),
      render: (_, record) => (
        <Tag bordered={false} color="error" style={{ borderRadius: "1rem" }}>
          {record.year ?  '0' : record.discount}%
        </Tag>
      ),
    },
    {
      title: t("Discount Price"),
      dataIndex: "discountPrice",
      key: "discountPrice",
      sorter: (a, b) => a.discountPrice - b.discountPrice,
      render: (_, record) => (
        <p>
          ฿
          {record.discountPrice.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      ),
    },
  ];

  const actions: React.ReactNode[] = [
    <div className="flex justify-between promotion-text p-6">
    <p className="text-sm default-font text-base text-black">{t("Grand Total")}</p>
    <p className="text-xl font-semibold	text-black default-font">
      ฿
      {reData?.grandTotal.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </p>
  </div>
  ];
  if (loadPage || !t) {
    return <Loading />;
  }
  return (
    <div className="px-4">
      <div className="flex justify-between items-center">
        <div className="text-lg pb-4 default-font flex">
          <Link
            className="text-comp-sub-header"
            href={`/${locale}/admin/backOrder`}
          >
            {t("Order lists")}
          </Link>{" "}
          <ChevronRightIcon className="w-4 mx-4" />{" "}
          <p className="font-semibold">{reData?.documentNo}</p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-lg pb-4 default-font flex">
          <Link
            className="flex items-center gap-2 hover:underline"
            href={`/${locale}/admin/backOrder`}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM27 21.5H16.62L20.06 24.94C20.64 25.52 20.64 26.48 20.06 27.06C19.76 27.36 19.38 27.5 19 27.5C18.62 27.5 18.24 27.36 17.94 27.06L11.94 21.06C11.36 20.48 11.36 19.52 11.94 18.94L17.94 12.94C18.52 12.36 19.48 12.36 20.06 12.94C20.64 13.52 20.64 14.48 20.06 15.06L16.62 18.5H27C27.82 18.5 28.5 19.18 28.5 20C28.5 20.82 27.82 21.5 27 21.5Z"
                fill="#919FAF"
                fillOpacity="0.5"
              />
            </svg>
            <p className="text-sm default-font text-[#919FAF]">{t("Back")}</p>
          </Link>
        </div>
      </div>
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="grid grid-cols-4 gap-4 order-table">
          <div className="col-span-3">
            <div className="flex justify-between items-center pb-4">
              <div className="flex flex-col">
                <p className="gotham-book text-xl font-thin grow pb-1">
                {t("Back Order")}
                </p>
                <p className="mb-0 default-font text-[#919FAF] text-xs">
                  #{reData?.documentNo}
                </p>
              </div>
            </div>
            {reData && reData.items && (
               <DataTable
               columns={columns}
               data={reData.items}
               total={reData.items.length}
               currentPage={currentPage}
               pageSize={pageSize}
               onPageChange={handlePageChange}
             />
            )}
          </div>
          <div className="col-span-1 col-start-4">
            <Card
              title={t("You’re paying")}
              bordered={false}
              className="default-font"
              actions={actions}
              style={{
                boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)`,
              }}
            >
              {reData && reData.externalDocument && (
                <>
                  <div className="flex justify-between promotion-text pb-4">
                    <p className="text-sm default-font text-[#919FAF]">
                    {t("Promotion")}
                    </p>
                    <p className="text-sm default-font">
                      {reData.externalDocument}
                    </p>
                  </div>
                </>
              )}

              <div className="flex justify-between promotion-text pb-4">
                <p className="text-sm default-font text-[#919FAF]">{t("Sub Total")}</p>
                <p className="text-sm default-font">
                  ฿
                  {reData?.subTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              {/* {reData?.groupDiscount && (
                <div className="flex justify-between promotion-text pb-4">
                  <p className="text-sm default-font text-[#919FAF]">{t("Discount")}</p>
                  <p className="text-sm default-font">
                  <Tag bordered={false} color="error" style={{ borderRadius: "1rem" }}>
                    {reData.groupDiscount}%
                  </Tag>
                  </p>
                </div>
              )} */}
              {reData?.groupDiscountPrice &&
                 <div className="flex justify-between promotion-text pb-4">
                 <p className="text-sm default-font text-[#919FAF]">{t("Discount Price")}</p>
                 <p className="text-sm default-font">
                   ฿
                   {(reData?.groupDiscountPrice).toLocaleString("en-US", {
                     minimumFractionDigits: 2,
                     maximumFractionDigits: 2,
                   })}
                 </p>
               </div>
              }
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
