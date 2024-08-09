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
import { Badge, Button, Form, Input, Modal, Space, Switch, Tabs, TabsProps, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useCurrentLocale } from "next-i18n-router/client";
import { useTranslation } from "react-i18next";
import ModalProduct from "@components/Admin/product/ModalProduct";
import i18nConfig from "../../../../../../../../i18nConfig";
import { useSession } from "next-auth/react";
import DatatableSelect from "@components/Admin/DatatableSelect";

export default function adminProduct({ params }: { params: { id: number } }) {
  const router = useRouter();
  const locale = useCurrentLocale(i18nConfig);
  const [cartData, setCartData] = useState<CartDataType[]>([]);
  const [triggerCart, setTriggerCart] = useState(false);
  const [normalCount, setNormalCount] = useState(0);
  const [backCount, setBackCount] = useState(0);
  const { data: session, status } = useSession();

  interface YearDataType {
    year: string;
    isActive: boolean;
    discount: number;
  }
  interface CartDataType {
    key: number;
    id: number;
    userId: number;
    item: {
      type: string;
      price: number;
      discount: number;
      amount: number;
      product: {
        name: string;
        brandName: string;
        price: number;
        years: YearDataType[];
        imageProduct: {
          id: Number;
          url: string;
        }
      }
    };
  }
  const { t } = useTranslation();
  const columns: ColumnsType<CartDataType> = [
    // {
    //   title: "ลำดับ",
    //   dataIndex: "id",
    //   key: "id",
    //   defaultSortOrder: "descend",
    //   sorter: (a, b) => a.id.toString().localeCompare(b.id.toString()),
    // },
    {
      title: 'สินค้า',
      dataIndex: 'name',
      render: (name: string) => <a>{name}</a>,
    },
    // {
    //   title: "ชื่อ",
    //   dataIndex: "contactName",
    //   key: "contactName",
    //   defaultSortOrder: "descend",
    //   sorter: (a, b) => a.user.contactName.localeCompare(b.user.contactName),
    //   render: (_, record) => <p>{record.user.contactName}</p>,
    // },
    // {
    //   title: "รางวัล",
    //   dataIndex: "rewardName",
    //   key: "rewardName",
    //   defaultSortOrder: "descend",
    //   sorter: (a, b) => a.reward.name.localeCompare(b.reward.name),
    //   render: (_, record) => <p>{record.reward.name}</p>,
    // },
    // {
    //   title: "คะแนน",
    //   dataIndex: "point",
    //   key: "point",
    //   sorter: (a, b) => a.reward.point - b.reward.point,
    //   render: (_, record) => <p>{record.reward.point}</p>,
    // },
    // {
    //   title: "จำนวน",
    //   dataIndex: "quantity",
    //   key: "quantity",
    //   sorter: (a, b) => a.quantity - b.quantity,
    //   render: (_, record) => <p>{record.quantity}</p>,
    // },
    // {
    //   title: "วันที่",
    //   dataIndex: "date",
    //   key: "date",
    //   render: (_, record) => <p>{formatDate(record.createdAt)}</p>,
    //   sorter: (a, b) =>
    //     formatDate(a.createdAt).localeCompare(formatDate(b.createdAt)),
    // },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (_, record) => (
    //     <div className="flex">
    //       <p
    //         className="flex cursor-pointer hover:text-comp-blue-link pr-2 underline"
    //         onClick={showModal(true, record.id)}
    //       >
    //         <CheckBadgeIcon className="w-4 mr-0.5" />
    //         <span>Verify</span>
    //       </p>
    //     </div>
    //   ),
    // },
  ];

  // useEffect(() => {
  //   if (session?.user.id) {
  //     axios
  //     .get(`/api/cart?${session?.user.id}`)
  //     .then((response) => {
  //       const useCart = response.data.map((cart: any) => ({
  //         key: cart.id,
  //         id: cart.id,
  //         userId: cart.userId,
  //         item: {
  //           type: cart.item.type,
  //           price: cart.item.price,
  //           discount: cart.item.discount,
  //           amount: cart.item.amount,
  //           product: {
  //             name: cart.item.product.name,
  //             brandName: cart.item.product.brandName,
  //             price: cart.item.product.price,
  //             years: cart.item.product.year,
  //             imageProduct: {
  //               id: cart.item.product.imageProduct.id,
  //               url: cart.item.product.imageProduct.url
  //             }
  //           }
  //         }
  //       }));
  //       setCartData(useCart);

  //       // Calculate counts
  //       const normal = useCart.filter(
  //         (cart: { item: any }) => cart.item.type === "Normal"
  //       ).length;
  //       const back = useCart.filter(
  //         (cart: { item: any }) => cart.item.type === "Back"
  //       ).length;

  //       setNormalCount(normal);
  //       setBackCount(back);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching data: ", error);
  //     });
  //   }
  // }, [triggerCart]);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <Badge className="redeem-badge default-font" count={1} offset={[10, 1]}>
          <p>Normal Order</p>
        </Badge>
      ),
      children: (
        <DatatableSelect
          columns={columns}
          data={cartData.filter((cart) => cart.item.type === "Normal")}
        />
      ),
    },
    {
      key: "2",
      label: (
        <Badge className="redeem-badge default-font" count={2} offset={[10, 1]}>
          <p>Back Order</p>
        </Badge>
      ),
      children: (
        <DatatableSelect
          columns={columns}
          data={cartData.filter((cart) => cart.item.type === "Back")}
        />
      ),
    },
  ];

  const onChange = (key: string) => {
    if (key === "1") {
      setTriggerCart(false);
    } else if (key === "2") {
      setTriggerCart(true);
    }
  };
  return (
    <div className="px-12">
      <div className="flex pb-4">
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.25 10.0683C18.7717 10.0683 18.375 9.67161 18.375 9.19327V7.58327C18.375 6.35827 17.85 5.16828 16.94 4.33994C16.0183 3.49994 14.8283 3.11494 13.5683 3.23161C11.4683 3.42994 9.625 5.57661 9.625 7.81661V8.94828C9.625 9.42661 9.22833 9.82327 8.75 9.82327C8.27167 9.82327 7.875 9.42661 7.875 8.94828V7.80494C7.875 4.66661 10.4067 1.77328 13.405 1.48161C15.155 1.31828 16.835 1.86661 18.1183 3.04494C19.39 4.19994 20.125 5.85661 20.125 7.58327V9.19327C20.125 9.67161 19.7283 10.0683 19.25 10.0683Z"
            fill="black"
          />
          <path
            d="M17.4998 26.5417H10.4998C5.10979 26.5417 4.10645 24.0334 3.84979 21.595L2.97479 14.6067C2.84645 13.3467 2.79979 11.5384 4.02479 10.185C5.07479 9.01837 6.81312 8.45837 9.33312 8.45837H18.6665C21.1981 8.45837 22.9365 9.03004 23.9748 10.185C25.1881 11.5384 25.1531 13.3467 25.0248 14.5834L24.1498 21.595C23.8931 24.0334 22.8898 26.5417 17.4998 26.5417ZM9.33312 10.2084C7.36145 10.2084 6.00812 10.5934 5.31979 11.3634C4.74812 11.9934 4.56145 12.9617 4.71312 14.4084L5.58812 21.3967C5.78645 23.2634 6.29979 24.8034 10.4998 24.8034H17.4998C21.6998 24.8034 22.2131 23.275 22.4115 21.42L23.2865 14.4084C23.4381 12.985 23.2515 12.0167 22.6798 11.375C21.9915 10.5934 20.6381 10.2084 18.6665 10.2084H9.33312Z"
            fill="black"
          />
          <path
            d="M17.9899 15.3416C17.3365 15.3416 16.8115 14.8166 16.8115 14.175C16.8115 13.5333 17.3365 13.0083 17.9782 13.0083C18.6199 13.0083 19.1449 13.5333 19.1449 14.175C19.1449 14.8166 18.6315 15.3416 17.9899 15.3416Z"
            fill="black"
          />
          <path
            d="M9.82335 15.3416C9.17002 15.3416 8.64502 14.8166 8.64502 14.175C8.64502 13.5333 9.17002 13.0083 9.81169 13.0083C10.4534 13.0083 10.9784 13.5333 10.9784 14.175C10.9784 14.8166 10.465 15.3416 9.82335 15.3416Z"
            fill="black"
          />
        </svg>
        <p className="gotham-font text-2xl text-black gotham-black pl-2">
          Shopping <span className="gotham-thin font-bold	">Cart</span>
        </p>
      </div>
      {/* <div className="flex"> */}
        <div>
          <Tabs
            defaultActiveKey="1"
            items={items}
            onChange={onChange}
            className="redeem-tab"
          />
        </div>
        <div></div>

      </div>
    // </div>
  );
}
