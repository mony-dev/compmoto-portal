"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import DropdownFilter from "./DropdownFilter";
import i18nConfig from "../i18nConfig";
import { useCurrentLocale } from "next-i18n-router/client";
import dynamic from "next/dynamic";
import { Skeleton, Tag } from "antd";
const MixedBarLineChart = dynamic(
  () => import("@components/MixedBarLineChart")
);

interface Option {
  label: string;
  key: string | number;
  type: string;
}

interface SelectedItem {
  id: number | string;
  name: string;
  type: string;
}

const Chart: React.FC<{ userId: string }> = ({ userId }) => {
  const [brandOptions, setBrandOptions] = useState<Option[]>([]);
  const [sizeOptions, setSizeOptions] = useState<Option[]>([]);
  const [cateOptions, setCateOptions] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [monthOptions, setMonthOptions] = useState<Option[]>([]);
  const [yearOptions, setYearOptions] = useState<Option[]>([]);

  const [selectedBrands, setSelectedBrands] = useState<SelectedItem[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<SelectedItem[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<SelectedItem[]>(
    []
  );
  const [selectedProducts, setSelectedProducts] = useState<SelectedItem[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<SelectedItem[]>([]);
  const [selectedYears, setSelectedYears] = useState<SelectedItem[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50); // Default page size
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const locale = useCurrentLocale(i18nConfig);

  // Callback function to update selected filters
  const handleFilterChange = (selectedItems: SelectedItem[], type: string) => {
    switch (type) {
      case "brand":
        setSelectedBrands(selectedItems);
        break;
      case "size":
        setSelectedSizes(selectedItems);
        break;
      case "category":
        setSelectedCategories(selectedItems);
        break;
      case "product":
        setSelectedProducts(selectedItems);
        break;
      case "month":
        setSelectedMonths(selectedItems);
        break;
      case "year":
        setSelectedYears(selectedItems);
        break;
      default:
        break;
    }
  };

  // Fetch brands
  const fetchBrands = async () => {
    try {
      const { data } = await axios.get(`/api/adminBrand`, {
        params: {
          page: 1,
          pageSize: 50,
        },
      });
      const brands = data.data.map((brand: any) => ({
        key: brand.id,
        label: brand.name,
      }));
      setBrandOptions(brands);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  // Fetch sizes
  const fetchSizes = async () => {
    try {
      const { data } = await axios.get(`/api/size`);
      const sizes = data.data.map((size: any) => ({
        key: size.id,
        label: size.name,
      }));
      setSizeOptions(sizes);
    } catch (error: any) {
      console.error(error.message);
    }
  };
  //fetch catergory
  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`/api/getCategory`);
      setCateOptions(response.data);
    } catch (error) {
      console.error("Error fetching menu items: ", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/getProductByUser", {
        params: { userId, currentPage, pageSize },
      });
      setProducts(data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Months in English and Thai

  const fetchMonth = async () => {
    const months = [
      { en: "January", th: "มกราคม", key: "1" },
      { en: "February", th: "กุมภาพันธ์", key: "2" },
      { en: "March", th: "มีนาคม", key: "3" },
      { en: "April", th: "เมษายน", key: "4" },
      { en: "May", th: "พฤษภาคม", key: "5" },
      { en: "June", th: "มิถุนายน", key: "6" },
      { en: "July", th: "กรกฎาคม", key: "7" },
      { en: "August", th: "สิงหาคม", key: "8" },
      { en: "September", th: "กันยายน", key: "9" },
      { en: "October", th: "ตุลาคม", key: "10" },
      { en: "November", th: "พฤศจิกายน", key: "11" },
      { en: "December", th: "ธันวาคม", key: "12" },
    ];
    let month = [];
    if (locale === "en") {
      month = months.map((option) => ({
        label: option.en,
        key: option.key,
        type: "month",
      }));
    } else {
      month = months.map((option) => ({
        label: option.th,
        key: option.key,
        type: "month",
      }));
    }
    setMonthOptions(month);
  };

  // Fetch years from 2024 to the current year
  const fetchYear = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - 2024 + 1 },
      (v, i) => 2024 + i
    );

    const yearOptions = years.map((year) => ({
      label: year.toString(),
      key: year.toString(),
      type: "year",
    }));

    setYearOptions(yearOptions);
  };

  useEffect(() => {
    setLoading(true);
    fetchBrands();
    fetchSizes();
    fetchMenuItems();
    fetchProducts();
    fetchMonth();
    fetchYear();
    setLoading(false);
  }, []);

  const brandItems = brandOptions.map((option) => ({
    label: option.label,
    key: Number(option.key),
    type: "brand",
  }));

  const sizeItems = sizeOptions.map((option) => ({
    label: option.label,
    key: Number(option.key),
    type: "size",
  }));

  const cateItems = cateOptions.map((option) => ({
    label: option.label,
    key: Number(option.key),
    type: "category",
  }));
  const productItems = products.map((option) => ({
    label: option.label,
    key: Number(option.key),
    type: "product",
  }));

  const months = monthOptions.map((option) => ({
    label: option.label,
    key: Number(option.key),
    type: "month",
  }));

  const years = yearOptions.map((option) => ({
    label: option.label,
    key: Number(option.key),
    type: "year",
  }));

  const tagPlusStyle: React.CSSProperties = {
    background: "#E4E7EB",
    borderStyle: "none",
    borderColor: "E4E7EB",
    padding: "6px 12px",
    borderRadius: "10px",
    boxShadow: "0px 3.5px 5.5px 0px #0000000A",
    marginBottom: "8px",
  };

  const allSelectedItems = useMemo(
    () => [
      { type: "brand", selected: selectedBrands, options: brandOptions },
      { type: "size", selected: selectedSizes, options: sizeOptions },
      { type: "category", selected: selectedCategories, options: cateOptions },
      { type: "product", selected: selectedProducts, options: products },
      { type: "month", selected: selectedMonths, options: monthOptions },
      { type: "year", selected: selectedYears, options: yearOptions },
    ],
    [
      selectedBrands,
      selectedSizes,
      selectedCategories,
      selectedProducts,
      selectedMonths,
      selectedYears,
      brandOptions,
      sizeOptions,
      cateOptions,
      products,
      monthOptions,
      yearOptions,
    ]
  );

  const renderFilterTags = (
    selected: SelectedItem[],
    options: Option[],
    type: string,
    index: number
  ) => {
    if (selected.length === options.length) {
      return (
        <Tag
          key={index}
          closable
          onClose={() => handleFilterChange([], type)}
          style={tagPlusStyle}
          className="filter-tag mx-2 flex custom-filter items-center h-fit"
        >
          <div>
            <p className="text-xs text-comp-natural-base gotham-font">{type}</p>
            <p className="text-xs text-black gotham-font">All</p>
          </div>
        </Tag>
      );
    }

    return selected.map((filter, index) => (
      <Tag
        key={index}
        closable
        onClose={() =>
          handleFilterChange(
            selected.filter((f) => f.id !== filter.id),
            filter.type
          )
        }
        style={tagPlusStyle}
        className="filter-tag mx-2 flex custom-filter items-center h-fit"
      >
        <div>
          <p className="text-xs text-comp-natural-base gotham-font">
            {filter.type}
          </p>
          <p className="text-xs text-black gotham-font">{filter.name}</p>
        </div>
      </Tag>
    ));
  };
  return (
    <>
      {loading ? (
        <Skeleton active />
      ) : (
        <>
          {" "}
          <div
            className="mt-4 pb-4 rounded-lg bg-white col-span-2"
            style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
          >
            <div className="grid grid-cols-6 gap-1 chart-filter">
              <DropdownFilter
                items={brandItems}
                buttonTitle={t("brands")}
                selectedItems={selectedBrands} // Pass selected brands
                onFilterChange={(items) => handleFilterChange(items, "brand")}
              />
              <DropdownFilter
                items={sizeItems}
                buttonTitle={t("sizes")}
                selectedItems={selectedSizes} // Pass selected sizes
                onFilterChange={(items) => handleFilterChange(items, "size")}
              />
              <DropdownFilter
                items={cateItems}
                buttonTitle={t("categories")}
                selectedItems={selectedCategories} // Pass selected categories
                onFilterChange={(items) =>
                  handleFilterChange(items, "category")
                }
              />
              <DropdownFilter
                items={productItems}
                buttonTitle={t("productCode")}
                selectedItems={selectedProducts} // Pass selected products
                onFilterChange={(items) => handleFilterChange(items, "product")}
              />
              <DropdownFilter
                items={months}
                buttonTitle={t("month")}
                selectedItems={selectedMonths} // Pass selected months
                onFilterChange={(items) => handleFilterChange(items, "month")}
              />
              <DropdownFilter
                items={years}
                buttonTitle={t("year")}
                selectedItems={selectedYears} // Pass selected years
                onFilterChange={(items) => handleFilterChange(items, "year")}
              />
            </div>

            <div className="flex flex-wrap dropdown-tag pt-4">
              {allSelectedItems.map(({ selected, options, type }, index) =>
                renderFilterTags(selected, options, type, index)
              )}
            </div>
          </div>
          <MixedBarLineChart
            selectedFilters={allSelectedItems}
            userId={userId}
          />
        </>
      )}
    </>
  );
};

export default Chart;
