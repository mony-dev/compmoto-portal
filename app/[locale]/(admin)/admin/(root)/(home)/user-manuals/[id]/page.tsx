"use client";

import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useCurrentLocale } from "next-i18n-router/client";
import { useTranslation } from "react-i18next";
import i18nConfig from "../../../../../../../../i18nConfig";
import Image from "next/image";
import NoImage from "@public/images/no_img_cart.png";
import { useForm } from "react-hook-form";
import { useCart } from "@components/Admin/Cartcontext";
import { BLACK_BG_COLOR } from "@components/Colors";
import Link from "next/link";
import { Divider } from "antd";
import { formatDateDiffNumber } from "@lib-utils/helper";
import dynamic from "next/dynamic";
const Loading = dynamic(() => import("@components/Loading"));


interface DataType {
  id: number;
  key: number;
  name: string;
  content: string;
  createdAt: string;
}
const News = ({ params }: { params: { id: number } }) => {
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  const locale = useCurrentLocale(i18nConfig);

  const { t } = useTranslation();

  const [brandName, setBrandName] = useState("");
  const { setI18nName, cartItemCount, setCartItemCount } = useCart();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [newsData, setNewsData] = useState<DataType>();

  useEffect(() => {
    console.log("asdsd")
    const parts = pathname.split("/");
    const lastPart = parts[parts.length - 2];
    setI18nName(lastPart);
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
    const [newsResponse] = await Promise.all([
        axios.get(`/api/adminUserManual/${params.id}`),
    ]);
    console.log(newsResponse)
    setNewsData(newsResponse.data);
    } catch (error) {
    console.error("Error fetching data: ", error);
    setLoading(false);
    } finally {
    setLoading(false);

    }
  }
//   if (loading) {
//     return <Loading />;
//   }

  return (
    <div className="px-4">
      <div className="mx-4 pb rounded-lg">
        <h1 className="default-font text-3xl font-black">{newsData?.name}</h1>
        <p className="text-[#9f9f9f] gotham-font text-xs pt-1">
            {newsData?.createdAt && formatDateDiffNumber(newsData?.createdAt)}
        </p>
        <Divider style={{  borderColor: '#DD2C37' }}/>
        {newsData?.content && (
          <div dangerouslySetInnerHTML={{ __html: newsData.content }} />
        )}
      </div>
    </div>
  );
};

export default News;
