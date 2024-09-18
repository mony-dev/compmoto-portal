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

interface MinisizeDataType {
  id: number;
  imageProfile: string;
  newsBanner: string;
}
interface DataType {
  id: number;
  key: number;
  name: string;
  minisize: {
    id: number;
    name: string;
  };
  isActive: boolean;
  coverImg: string;
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
  const [minisizeData, setMinisizeData] = useState<MinisizeDataType | null>(
    null
  );
  const [brandName, setBrandName] = useState("");
  const { setI18nName, cartItemCount, setCartItemCount } = useCart();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [newsData, setNewsData] = useState<DataType>();
  const isActive = pathname.includes("admin/news");

  useEffect(() => {
    const parts = pathname.split("/");
    const lastPart = parts[parts.length - 2];
    setI18nName(lastPart);
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const query = new URLSearchParams(window.location.search);
    const name = query.get("name");
    if (name) {
      setBrandName(name);
      try {
        const [newsResponse] = await Promise.all([
          axios.get(`/api/adminNews/${params.id}`),
        ]);
        setMinisizeData(newsResponse.data.minisize);
        setNewsData(newsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    }
  }
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="px-4">
      <div className="mx-4 pb rounded-lg">
        <div
          className="pb-2"
          style={{
            background: `linear-gradient(90deg, #DD2C37 0%, #FCD00D 100%)`,
          }}
        >
          <Image
            className="w-full"
            alt="media"
            width={1000}
            height={1000}
            src={
              minisizeData
                ? minisizeData.newsBanner
                  ? minisizeData.newsBanner
                  : NoImage.src
                : NoImage.src
            }
          />
        </div>
        <nav
          className="flex justify-between flex default-font text-white text-sm nav-product"
          style={{
            background: `linear-gradient(90deg, ${BLACK_BG_COLOR} 0%, rgba(27, 27, 27, 0.9) 100%)`,
            boxShadow: "0px 4px 4px 0px #00000040",
          }}
        >
          <div className="flex gap-2 items-center  default-font">
            <Link
              className="hover:text-white text-white hover:bg-comp-red h-full"
              href={`/${locale}/admin/product?name=${brandName}`}
            >
              <div className="cursor-pointer h-full flex items-center px-4">
                {t("Product")}
              </div>
            </Link>

            <Link
              className={`cursor-pointer hover:bg-comp-red h-full flex items-center px-4 text-white ${
                isActive ? "bg-comp-red" : ""
              }`}
              href={`/${locale}/admin/news?name=${brandName}`}
            >
              {t("News and events")}
            </Link>
            <Link
              className="hover:text-white text-white hover:bg-comp-red h-full"
              href={`/${locale}/admin/media?name=${brandName}`}
            >
              <div className="cursor-pointer h-full flex items-center px-4">
                {t("Marketing")}
              </div>
            </Link>
          </div>
          <div>
            <Image
              className=""
              alt="minisize"
              width={176}
              height={176}
              src={
                minisizeData
                  ? minisizeData.imageProfile
                    ? minisizeData.imageProfile
                    : NoImage.src
                  : NoImage.src
              }
            />
          </div>
        </nav>
        <Divider style={{  borderColor: '#DD2C37' }}/>
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
