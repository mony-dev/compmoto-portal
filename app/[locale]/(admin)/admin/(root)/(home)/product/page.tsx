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
import Loading from "@components/Loading";
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

const Product = () => {
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
  const [loadingMini, setLoadingMini] = useState(false);
  const [loadingPromo, setLoadingPromo] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };
  const handleSortChange = (value: string) => {
    // Handle sorting logic
    if (value === "descend" || value === "ascend") {
      setSortedInfo({
        order: value,
        columnKey: "price",
      });
    } else if (value === "new") {
      const sortedData = [...productData].sort((a, b) => {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);
        return dateB.getTime() - dateA.getTime();
      });
      setProductData(sortedData);
      setSortedInfo({});
    } else if (value === "popular") {
      const sortedData = [...productData].sort((a, b) => {
        return a.totalOrder - b.totalOrder;
      });
      setProductData(sortedData);
      setSortedInfo({});
    }
  };
  const handleTableChange: TableProps<DataType>["onChange"] = (pagination, filters, sorter) => {
    setSortedInfo(sorter as Sorts);
  };
  const fetchMinisizeData = async (name: string) => {
    try {
      setLoadingMini(true)
      const response = await axios.get(`/api/adminMinisize?q=${name}`);
      if (response.data) {
        const minisize = response.data.minisizes.map(
          (data: MinisizeDataType) => ({
            id: data.id,
            imageProfile: data.imageProfile,
          })
        )

        if (minisize[0]) {
          minisize[0] && setMinisizeData(minisize[0]);
          fetchPromotion(minisize[0].id);
        }
     
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoadingMini(false)
    }
  };

  const fetchProduct = async (
    name: string,
    filters = {} as SelectedFilters,
    promotionId?: number
  ) => {
    setBrandName(name);
    const simplifiedFilters = {
      lv1: filters.lv1?.id,
      lv2: filters.lv2?.id,
      lv3: filters.lv3?.id,
      promotionId,
      page: currentPage,
      pageSize: pageSize,
    };
    setLoadingProduct(true)
    axios
      .get(
        `/api/getProduct?q=${searchText}&brandName=${name}&sortBy=${sortBy}`,
        {
          params: simplifiedFilters,
        }
      )
      .then((response) => {
        const useProduct = response.data.products.map((product: DataType) => ({
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
          updatedAt: product.updatedAt,
          years: JSON.parse(
            product.years as unknown as string
          ) as YearDataType[],
          lv1Id: product.lv1Id,
          lv2Id: product.lv2Id,
          lv3Id: product.lv3Id,
          totalOrder: product.totalOrder,
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
            id: product?.promotion?.id,
          },
          imageProducts: product?.imageProducts,
          lv1Name: product.lv1Name,
          lv2Name: product.lv2Name,
          lv3Name: product.lv3Name,
        }));
        setProductData(useProduct);
        setTotal(response.data.total);
        setLoadingProduct(false)
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      })
  };

  const fetchPromotion = async (id: number, filters = {}) => {
    setLoadingPromo(true)
    const group = session?.user.custPriceGroup;
    id &&
      axios
        .get(`/api/getPromotion?group=${group}&minisizeId=${id}`)
        .then((response) => {
          const promotions = response.data.map(
            (promotion: PromotionDataType) => ({
              id: promotion.id,
              name: promotion.name,
              isActive: promotion.isActive,
              minisizeId: promotion.minisizeId,
              amount: promotion.amount,
              productRedeem: promotion.productRedeem,
              userGroup: promotion.userGroup,
              startDate: promotion.startDate,
              endDate: promotion.endDate,
              image: promotion?.image,
            })
          );
          setPromotionData(promotions);
          setLoadingPromo(false)
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
        });
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const name = query.get("name");
    if (name) {
      hoveredPromotionId
        ? fetchProduct(name, selectedFilters, hoveredPromotionId)
        : fetchProduct(name, selectedFilters);
    }
  }, [searchText, selectedFilters, sortBy, currentPage]);

  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);
    const query = new URLSearchParams(window.location.search);
    const name = query.get("name");
    if (name) {
      fetchMinisizeData(name);
    }
  }, []);

  useEffect(() => {
    const name = searchParams.get("name");
    if (name) {
      hoveredPromotionId
        ? fetchProduct(name, selectedFilters, hoveredPromotionId)
        : fetchProduct(name, selectedFilters);
      fetchMinisizeData(name);
    }
  }, [searchParams, selectedFilters]);

  const handleFilterChange = (
    filters: SelectedFilters, // Use the updated type
    promotionId?: number
  ) => {
    promotionId && setHoveredPromotionId(promotionId);
    setSelectedFilters(filters); // Store the full filter object (with labels)
    const query = new URLSearchParams(window.location.search);
    const name = query.get("name");
    if (name) {
      fetchProduct(name, filters, promotionId); // Pass promotionId to fetchProduct
    }

    // Scroll to the DataTable smoothly
    if (dataTableRef.current) {
      dataTableRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  const addToCart = async (
    product: DataType,
    type: "Normal" | "Back",
    discount: number = 0
  ) => {
    if (!session?.user) {
      toastError(t("Please login before adding to cart"));
      return;
    }
    const selectedYear = selectedProductYear[product.id];

    try {
      const findItem = await axios.get(`/api/cartItem`, {
        params: {
          productId: product.id,
          userId: session.user.id,
        },
      });
      const cartItem = await axios.post(
        `/api/cart`,
        {
          productId: product.id,
          amount: 1,
          type,
          price: product.price,
          discount,
          userId: session.user.id,
          year: selectedYear,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      findItem.data.count && setCartItemCount(cartItemCount + 1);
      toastSuccess(t("Added to cart successfully"));
    } catch (error: any) {
      toastError(error.message);
    }
  };

  const handleStatusClick = (product: DataType) => {
    const selectedYearData = product.years.find(
      (yearData) => yearData.year === selectedProductYear[product.id]
    );
    const discount = selectedYearData ? selectedYearData.discount : 0;

    if (product.portalStock > 0) {
      addToCart(product, "Normal", discount);
    } else {
      addToCart(product, "Back", discount);
    }
  };

  const SuccessIcon = (color: any) => (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.21 8.9599C19.54 8.2199 18.53 7.7899 17.13 7.6399V6.8799C17.13 5.5099 16.55 4.1899 15.53 3.2699C14.5 2.3299 13.16 1.8899 11.77 2.0199C9.37999 2.2499 7.36999 4.5599 7.36999 7.0599V7.6399C5.96999 7.7899 4.95999 8.2199 4.28999 8.9599C3.31999 10.0399 3.34999 11.4799 3.45999 12.4799L4.15999 18.0499C4.36999 19.9999 5.15999 21.9999 9.45999 21.9999H15.04C19.34 21.9999 20.13 19.9999 20.34 18.0599L21.04 12.4699C21.15 11.4799 21.18 10.0399 20.21 8.9599ZM11.91 3.4099C12.91 3.3199 13.86 3.6299 14.6 4.2999C15.33 4.9599 15.74 5.8999 15.74 6.8799V7.5799H8.75999V7.0599C8.75999 5.2799 10.23 3.5699 11.91 3.4099ZM12.25 18.5799C10.16 18.5799 8.45999 16.8799 8.45999 14.7899C8.45999 12.6999 10.16 10.9999 12.25 10.9999C14.34 10.9999 16.04 12.6999 16.04 14.7899C16.04 16.8799 14.34 18.5799 12.25 18.5799Z"
        fill={color.color}
      />
      <path
        d="M11.6799 16.64C11.4899 16.64 11.2999 16.57 11.1499 16.42L10.1599 15.43C9.86988 15.14 9.86988 14.66 10.1599 14.37C10.4499 14.08 10.9299 14.08 11.2199 14.37L11.6999 14.85L13.2999 13.37C13.5999 13.09 14.0799 13.11 14.3599 13.41C14.6399 13.71 14.6199 14.19 14.3199 14.47L12.1899 16.44C12.0399 16.57 11.8599 16.64 11.6799 16.64Z"
        fill={color.color}
      />
    </svg>
  );

  const ErrorIcon = (color: any) => (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.21 8.9599C19.54 8.2199 18.53 7.7899 17.13 7.6399V6.8799C17.13 5.5099 16.55 4.1899 15.53 3.2699C14.5 2.3299 13.16 1.8899 11.77 2.0199C9.37999 2.2499 7.36999 4.5599 7.36999 7.0599V7.6399C5.96999 7.7899 4.95999 8.2199 4.28999 8.9599C3.31999 10.0399 3.34999 11.4799 3.45999 12.4799L4.15999 18.0499C4.36999 19.9999 5.15999 21.9999 9.45999 21.9999H15.04C19.34 21.9999 20.13 19.9999 20.34 18.0599L21.04 12.4699C21.15 11.4799 21.18 10.0399 20.21 8.9599ZM11.91 3.4099C12.91 3.3199 13.86 3.6299 14.6 4.2999C15.33 4.9599 15.74 5.8999 15.74 6.8799V7.5799H8.75999V7.0599C8.75999 5.2799 10.23 3.5699 11.91 3.4099ZM12.25 18.5799C10.16 18.5799 8.45999 16.8799 8.45999 14.7899C8.45999 12.6999 10.16 10.9999 12.25 10.9999C14.34 10.9999 16.04 12.6999 16.04 14.7899C16.04 16.8799 14.34 18.5799 12.25 18.5799Z"
        fill={color.color}
      />
      <path
        d="M13.8501 15.3099L13.3201 14.7799L13.8201 14.2799C14.1101 13.9899 14.1101 13.5099 13.8201 13.2199C13.5301 12.9299 13.0501 12.9299 12.7601 13.2199L12.2601 13.7199L11.7301 13.1899C11.4401 12.8999 10.9601 12.8999 10.6701 13.1899C10.3801 13.4799 10.3801 13.9599 10.6701 14.2499L11.2001 14.7799L10.6501 15.3299C10.3601 15.6199 10.3601 16.0999 10.6501 16.3899C10.8001 16.5399 10.9901 16.6099 11.1801 16.6099C11.3701 16.6099 11.5601 16.5399 11.7101 16.3899L12.2601 15.8399L12.7901 16.3699C12.9401 16.5199 13.1301 16.5899 13.3201 16.5899C13.5101 16.5899 13.7001 16.5199 13.8501 16.3699C14.1401 16.0799 14.1401 15.6099 13.8501 15.3099Z"
        fill={color.color}
      />
    </svg>
  );

  const WarningIcon = (color: any) => (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.21 8.9599C19.54 8.2199 18.53 7.7899 17.13 7.6399V6.8799C17.13 5.5099 16.55 4.1899 15.53 3.2699C14.5 2.3299 13.16 1.8899 11.77 2.0199C9.37999 2.2499 7.36999 4.5599 7.36999 7.0599V7.6399C5.96999 7.7899 4.95999 8.2199 4.28999 8.9599C3.31999 10.0399 3.34999 11.4799 3.45999 12.4799L4.15999 18.0499C4.36999 19.9999 5.15999 21.9999 9.45999 21.9999H15.04C19.34 21.9999 20.13 19.9999 20.34 18.0599L21.04 12.4699C21.15 11.4799 21.18 10.0399 20.21 8.9599ZM11.91 3.4099C12.91 3.3199 13.86 3.6299 14.6 4.2999C15.33 4.9599 15.74 5.8999 15.74 6.8799V7.5799H8.75999V7.0599C8.75999 5.2799 10.23 3.5699 11.91 3.4099ZM12.25 18.5799C10.16 18.5799 8.45999 16.8799 8.45999 14.7899C8.45999 12.6999 10.16 10.9999 12.25 10.9999C14.34 10.9999 16.04 12.6999 16.04 14.7899C16.04 16.8799 14.34 18.5799 12.25 18.5799Z"
        fill={color.color}
      />
    </svg>
  );

  const getStatusValue = (record: DataType) => {
    if (record.portalStock === 0) return 0; // Out of stock
    if (record.portalStock > 100) return 2; // Available
    return 1; // Limited stock
  };

  const columns: ColumnsType<DataType> = [
    {
      title: t("Product Lists"),
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === "name" ? sortedInfo.order : null,
      render: (name: string) => {
        return (
          <>
            <div className="font-medium">{name}</div>
            <span className="text-comp-gray-text text-sm">
              {brandName.toLocaleUpperCase()}
            </span>
          </>
        );
      },
    },
    {
      title: t("Year Lot"),
      dataIndex: "years",
      key: "years",
      render: (years: YearDataType[], record) => (
        <div>
          {years.map((yearData, index) => (
            <Tooltip
              placement="top"
              title={`${yearData.discount}%`}
              key={index}
            >
              <Tag
                color={
                  yearData.isActive
                    ? selectedProductYear[record.id] === yearData.year
                      ? "#B8252E"
                      : "red"
                    : "#FFFFFF"
                }
                key={index}
                style={{
                  borderColor: yearData.isActive
                    ? selectedProductYear[record.id] === yearData.year
                      ? "#E4E7EB"
                      : "#B8252E"
                    : "#A6AEBB",
                  cursor: yearData.isActive ? "pointer" : "default",
                  color: yearData.isActive
                    ? selectedProductYear[record.id] === yearData.year
                      ? "#E4E7EB"
                      : "#B8252E"
                    : "#A6AEBB",
                }}
                onClick={() => {
                  if (yearData.isActive) {
                    setSelectedProductYear((prevSelected) => {
                      // Check if the currently clicked year is the same as the selected year
                      if (prevSelected[record.id] === yearData.year) {
                        // If yes, remove the selection (unset)
                        const updatedSelected = { ...prevSelected };
                        delete updatedSelected[record.id]; // Remove the selected year for this product
                        return updatedSelected;
                      } else {
                        // If not, set the new selection
                        return {
                          ...prevSelected,
                          [record.id]: yearData.year,
                        };
                      }
                    });
                  }
                }}
              >
                <span
                  className={`gotham-font ${
                    yearData.isActive
                      ? selectedProductYear[record.id] === yearData.year
                        ? "text-white font-semibold"
                        : "text-[#B8252E] font-semibold"
                      : "text-comp-gray-text font-normal"
                  }`}
                >
                  {yearData.year.slice(-2)}
                </span>
              </Tag>
            </Tooltip>
          ))}
        </div>
      ),
    },
    {
      title: t("Size"),
      dataIndex: "lv2Name",
      key: "lv2Name",
      defaultSortOrder: "descend",
      sorter: (a, b) => (a.lv2Name || "").localeCompare(b.lv2Name || ""),
      sortOrder: sortedInfo.columnKey === "lv2Name" ? sortedInfo.order : null,
    },
    {
      title: t("Rim"),
      dataIndex: "lv3Name",
      key: "lv3Name",
      defaultSortOrder: "descend",
      sorter: (a, b) => (a.lv3Name || "").localeCompare(b.lv3Name || ""),
      sortOrder: sortedInfo.columnKey === "lv3Name" ? sortedInfo.order : null,
    },
    {
      title: t("Price"),
      dataIndex: "price",
      key: "price",
      defaultSortOrder: sortBy === "asc" ? "ascend" : "descend",
      sorter: (a, b) => a.price - b.price,
      sortOrder: sortedInfo.columnKey === "price" ? sortedInfo.order : null,
      render: (price, record) => {
        const selectedYearData = record.years.find(
          (yearData) => yearData.year === selectedProductYear[record.id]
        );
        const discountedPrice =
          selectedYearData && selectedYearData.discount
            ? price - price * (selectedYearData.discount / 100)
            : price;
        return (
          <div className="font-medium">
            {selectedYearData && (
              <div className="">
                ฿{new Intl.NumberFormat("en-US").format(discountedPrice)}
              </div>
            )}
            <div
              className={
                selectedYearData
                  ? "line-through text-xs text-comp-gray-text"
                  : ""
              }
            >
              ฿{new Intl.NumberFormat("en-US").format(price)}
            </div>
          </div>
        );
      },
    },
    {
      title: t("Status"),
      key: "action",
      sorter: (a, b) => getStatusValue(a) - getStatusValue(b),
      sortOrder: sortedInfo.columnKey === "action" ? sortedInfo.order : null,
      render: (_, record) => {
        const backgroundColor =
          hoveredProduct === record.id && record.portalStock === 0
            ? "#DD2C37"
            : hoveredProduct === record.id && record.portalStock > 100
            ? "#1ba345"
            : hoveredProduct === record.id &&
              record.portalStock <= 100 &&
              record.portalStock > 0
            ? "#fec001"
            : record.portalStock === 0
            ? "#FFE8EB"
            : record.portalStock > 100
            ? "#D1EDDA"
            : record.portalStock <= 100 && record.portalStock > 0
            ? "#FFF2CC"
            : "#D1EDDA";
        const textColor =
          hoveredProduct === record.id && record.portalStock === 0
            ? "#FFFFFF"
            : hoveredProduct === record.id && record.portalStock > 100
            ? "#FFFFFF"
            : hoveredProduct === record.id &&
              record.portalStock <= 100 &&
              record.portalStock > 0
            ? "#FFFFFF"
            : record.portalStock === 0
            ? "#DD2C37"
            : record.portalStock > 100
            ? "#1BA345"
            : record.portalStock <= 100 && record.portalStock > 0
            ? "#FEC001"
            : "#FEC001";

        return (
          <Tag
            bordered={false}
            color="error"
            style={{
              backgroundColor: backgroundColor,
              color: textColor,
              display: "flex",
              alignItems: "center",
              borderRadius: "9999px",
              padding: "8px 8px",
              width: "80%",
              cursor: "pointer",
            }}
            onMouseEnter={() => setHoveredProduct(record.id)}
            onMouseLeave={() => setHoveredProduct(null)}
            onClick={() => handleStatusClick(record)}
          >
            {record.portalStock === 0 ? (
              <ErrorIcon
                color={hoveredProduct === record.id ? "#FFFFFF" : "#DD2C37"}
              />
            ) : record.portalStock > 100 ? (
              <SuccessIcon
                color={hoveredProduct === record.id ? "#FFFFFF" : "#1BA345"}
              />
            ) : (
              <WarningIcon
                color={hoveredProduct === record.id ? "#FFFFFF" : "#fec001"}
              />
            )}
            <p className="text-sm default-font">
              {record.portalStock === 0
                ? t("Out of Stock")
                : record.portalStock > 100
                ? t("Available")
                : t("Limited")}
            </p>
          </Tag>
        );
      },
    },
  ];

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  
  if (loadingMini || loadingProduct || loadingPromo) {
    return <Loading />;
  }
  
  return (
    
    <div className="px-4">
      <div className="px-4 pb rounded-lg">
        <div className="promotion-card pb-4">
          {promotiondData.length > 3 ? (
            <Slider {...sliderSettings}>
              {promotiondData.map((promotion, index) => (
                <Card
                  title={false}
                  bordered={false}
                  style={{ width: 300 }}
                  key={index}
                  className="rounded-lg"
                  onMouseEnter={() => setHoveredPromotionId(promotion.id)}
                  onMouseLeave={() => setHoveredPromotionId(null)}
                >
                  <div
                    className="flex-shrink-0"
                    style={{
                      flex: "1 0 auto",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "600px", // Set a fixed height for the image container
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      className="w-full rounded-lg"
                      alt={promotion.name}
                      width={1000}
                      height={1000}
                      src={promotion.image}
                      style={{
                        objectFit: "cover", // Cover the container
                        width: "100%", // Ensure it takes full width
                        height: "100%", // Ensure it takes full height
                      }}
                    />
                    {hoveredPromotionId === promotion.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "0.5rem"
                        }}
                      >
                        <button
                          style={{
                            backgroundColor: "#DD2C37",
                            padding: "8px 16px 8px 16px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            color: "white",
                          }}
                          // onClick={() => handleFilterChange(selectedFilters, promotion.id)}
                          onClick={() => {
                            handleFilterChange(
                              {
                                ...selectedFilters,
                                promotion: {
                                  id: promotion.id.toString(),
                                  label: promotion.name,
                                }, // Ensure promotion is added
                              },
                              promotion.id
                            );
                          }}
                        >
                          <div className="flex justify-between gap-2">
                            <span className="default-font">{t("see more")}</span>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8.5 12H14.5"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12.5 15L15.5 12L12.5 9"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </Slider>
          ) : (
            <div className="grid gap-x-8 gap-y-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ">
              {promotiondData.map((promotion, index) => (
                <Card
                  title={false}
                  bordered={false}
                  style={{ width: 300 }}
                  key={index}
                  className="rounded-lg"
                  onMouseEnter={() => setHoveredPromotionId(promotion.id)}
                  onMouseLeave={() => setHoveredPromotionId(null)}
                >
                  <div
                    className="flex-shrink-0"
                    style={{
                      flex: "1 0 auto",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "600px", // Set a fixed height for the image container
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      className="w-full rounded-lg"
                      alt={promotion.name}
                      width={1000}
                      height={1000}
                      src={promotion.image}
                      style={{
                        objectFit: "cover", // Cover the container
                        width: "100%", // Ensure it takes full width
                        height: "100%", // Ensure it takes full height
                      }}
                    />
                    {hoveredPromotionId === promotion.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "0.5rem"
                        }}
                      >
                        <button
                          style={{
                            backgroundColor: "#DD2C37",
                            padding: "8px 16px 8px 16px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            color: "white",
                          }}
                          // onClick={() => handleFilterChange(selectedFilters, promotion.id)}
                          onClick={() => {
                            handleFilterChange(
                              {
                                ...selectedFilters,
                                promotion: {
                                  id: promotion.id.toString(),
                                  label: promotion.name,
                                }, // Ensure promotion is added
                              },
                              promotion.id
                            );
                          }}
                        >
                          <div className="flex justify-between gap-2">
                            <span className="default-font">{t("see more")}</span>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8.5 12H14.5"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12.5 15L15.5 12L12.5 9"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        <nav
          className="flex justify-between flex default-font text-white text-sm mt-4 nav-product"
          style={{
            background: `linear-gradient(90deg, ${BLACK_BG_COLOR} 0%, rgba(27, 27, 27, 0.9) 100%)`,
            boxShadow: "0px 4px 4px 0px #00000040",
          }}
        >
          <div className="flex gap-4 items-center pl-4">
            {minisizeData && (
              <Submenu
                minisizeId={minisizeData.id}
                onFilterChange={handleFilterChange}
                t={t}
              />
            )}
            <Link  className="hover:text-white text-white cursor-pointer hover:bg-comp-red h-full flex items-center px-4 h-full" href={`/${locale}/admin/news?name=${brandName}`}>{t("News and events")}</Link>
            <Link  className="hover:text-white text-white cursor-pointer hover:bg-comp-red h-full flex items-center px-4 h-full" href={`/${locale}/admin/media?name=${brandName}`}>{t("Marketing")}</Link>
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
        {(selectedFilters.lv1 ||
          selectedFilters.lv2 ||
          selectedFilters.lv3 ||
          selectedFilters.promotion) && (
          <>
            <div className="flex pt-4 items-center gap-4">
              <p className="text-comp-text-filter default-font text-sm">
                {t("Filter")} :
              </p>
              <FilterTag
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
              />
            </div>
            <Divider style={{ borderColor: "#E4E7EB" }} dashed />
          </>
        )}
        <div className="flex justify-end items-center gap-4 sort-filter">
          <Input.Search
            placeholder={t("Search")}
            size="middle"
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: "200px", margin: "1rem 0 1rem 0" }}
          />
          <p className="text-comp-text-filter default-font text-sm">
            {t("Sort")}
          </p>
          <Select
            style={{ width: 120 }}
            allowClear
            options={[
              { value: "descend", label: t("High to Low") },
              { value: "ascend", label: t("Low to High") },
              { value: "popular", label: t("Popular") },
              { value: "new", label: t("New") },
            ]}
            onChange={handleSortChange}
          />
        </div>
        <div ref={dataTableRef}>
          <DataTable
            columns={columns}
            data={productData}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onChange={handleTableChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Product;
