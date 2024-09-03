"use client";

import { Card, Divider, Input, Select, Tag, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toastError, toastSuccess } from "@lib-utils/helper";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import NoImage from "@public/images/no_image_rectangle.png";
import { BLACK_BG_COLOR } from "@components/Colors";
import { ColumnsType, TableProps } from "antd/es/table";
import Submenu from "@components/Admin/Submenu";
import DataTable from "@components/Admin/Datatable";
import { useCart } from "@components/Admin/Cartcontext";
import FilterTag from "@components/Admin/FilterTag";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Link from "next/link";
interface MinisizeDataType {
  id: number;
  imageProfile: string;
}

interface PromotionDataType {
  id: number;
  name: string;
  isActive: boolean;
  minisizeId: number;
  amount: number;
  productRedeem: string;
  userGroup: string;
  startDate: string;
  endDate: string;
  image: string;
}

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
  updatedAt: string;
  years: YearDataType[];
  lv1Id?: number;
  lv2Id?: number;
  lv3Id?: number;
  totalOrder: number;
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
    id: number;
  };
  imageProducts?: { url: string }[];
  lv1Name: string;
  lv2Name: string;
  lv3Name: string;
}

interface YearDataType {
  year: string;
  isActive: boolean;
  discount: number;
}

interface FilterType {
  id: string;
  label: string;
}

interface SelectedFilters {
  lv1?: FilterType;
  lv2?: FilterType;
  lv3?: FilterType;
  promotion?: FilterType;
}

const Media = () => {
  const {
    formState: { errors },
  } = useForm();
  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);
  const { cartItemCount, setCartItemCount } = useCart();
  const { data: session, status } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [promotiondData, setPromotionData] = useState<PromotionDataType[]>([]);
  const searchParams = useSearchParams();
  const [minisizeData, setMinisizeData] = useState<MinisizeDataType | null>(
    null
  );
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [productData, setProductData] = useState<DataType[]>([]);
  const [brandName, setBrandName] = useState("");
  const [selectedProductYear, setSelectedProductYear] = useState<{
    [key: number]: string | null;
  }>({});
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({});
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const pathname = usePathname();

  type OnChange = NonNullable<TableProps<DataType>["onChange"]>;
  type GetSingle<T> = T extends (infer U)[] ? U : never;
  type Sorts = GetSingle<Parameters<OnChange>[2]>;
  const [sortedInfo, setSortedInfo] = useState<Sorts>({});
  const [hoveredPromotionId, setHoveredPromotionId] = useState<number | null>(
    null
  );
  const dataTableRef = useRef<HTMLDivElement>(null);
  // Settings for the slider


  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);
    const query = new URLSearchParams(window.location.search);
    const name = query.get("name");
    if (name) {
        setBrandName(name)
        fetchMinisizeData(name);
        //fetchPromotion(name);
    }
  }, [session]);


  const fetchMinisizeData = async (name: string) => {
    try {
      const response = await axios.get(`/api/adminMinisize?q=${name}`);
      if (response.data) {
        const minisize = response.data.minisizes.map(
          (data: MinisizeDataType) => ({
            id: data.id,
            imageProfile: data.imageProfile,
          })
        );
        minisize[0] && setMinisizeData(minisize[0]);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };


  return (
    <div className="px-4">
      <div className="px-4 pb rounded-lg">
        <div className="promotion-card pb-4">
   
        </div>
        <nav
          className="flex justify-between flex default-font text-white text-sm mt-4"
          style={{
            background: `linear-gradient(90deg, ${BLACK_BG_COLOR} 0%, rgba(27, 27, 27, 0.9) 100%)`,
            boxShadow: "0px 4px 4px 0px #00000040",
          }}
        >
          <div className="flex gap-2 items-center">
            <div className="cursor-pointer hover:bg-comp-red h-full flex items-center px-4">
                <Link href={`/${locale}/admin/product?name=${brandName}`}>{t("Product")}</Link>
            </div>
            <div  className="cursor-pointer hover:bg-comp-red h-full flex items-center px-4">
                <Link href={`/${locale}/admin/media?name=${brandName}`}>{t("News and events")}</Link>
            </div>
            <div className="cursor-pointer hover:bg-comp-red h-full flex items-center px-4" >
                <Link href={`/${locale}/admin/media?name=${brandName}`}>{t("Marketing")}</Link>
            </div>
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
   
      </div>
    </div>
  );
};

export default Media;
