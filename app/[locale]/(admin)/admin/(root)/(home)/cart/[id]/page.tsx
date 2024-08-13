"use client";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { toastError, toastSuccess } from "@lib-utils/helper";
import {
  Badge,
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Switch,
  Tabs,
  TabsProps,
  Tag,
  Tooltip,
} from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useCurrentLocale } from "next-i18n-router/client";
import { useTranslation } from "react-i18next";
import i18nConfig from "../../../../../../../../i18nConfig";
import { useSession } from "next-auth/react";
import DatatableSelect from "@components/Admin/DatatableSelect";
import { Image } from "antd";
import NoImage from "@public/images/no_img_cart.png";
import { Controller, useForm } from "react-hook-form";
import { useCart } from "@components/Admin/Cartcontext";

type CheckoutProps = {
  totalAmount: number;
  totalPrice: number;
  discountRate: number;
  cartData: any;
  selectedItems: any;
  selectedProductYear: any;
  getValues: any;
  calculateTotalPrice: any;
  calculateOriginalPrice: any;
  promotionText: string[];
};

interface YearDataType {
  year: string;
  isActive: boolean;
  discount: number;
}

interface CartDataType {
  key: number;
  id: number;
  type: string;
  price: number;
  discount: number;
  amount: number;
  product: {
    id: number;
    name: string;
    price: number;
    years: YearDataType[];
    image: string;
    minisizeId: number;
    brand: {
      id: Number;
      name: string;
    };
    imageProduct: any;
    promotion: any;
  };
}

const Cart = ({ params }: { params: { id: number } }) => {
  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  const locale = useCurrentLocale(i18nConfig);
  const [cartData, setCartData] = useState<CartDataType[]>([]);
  const [triggerCart, setTriggerCart] = useState(false);
  const [reloadItem, setReloadItem] = useState(false);
  const [normalCount, setNormalCount] = useState(0);
  const [backCount, setBackCount] = useState(0);
  const { data: session, status } = useSession();
  const [selectedProductYear, setSelectedProductYear] = useState<{
    [key: number]: string | null;
  }>({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const discountRate = session?.user?.custPriceGroup === "5STARS" ? 5 : 7;
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const { t } = useTranslation();
  const [promotionText, setPromotionText] = useState<string[]>([]);

  const recalculateTotals = (selectedRows: CartDataType[] = []) => {
    let newTotalAmount = 0;
    let newTotalPrice = 0;

    selectedRows.forEach((record) => {
      const amount = getValues(`amount_${record.id}`) || 0;
      const yearToUse = selectedProductYear[record.id]; // Use the latest state here
      newTotalAmount += amount;
      newTotalPrice += calculateTotalPrice(record, amount, yearToUse);
      checkPromotion();
    });

    setTotalAmount(newTotalAmount);
    setTotalPrice(newTotalPrice);
  };

  const calculateTotalPrice = (
    record: CartDataType,
    amount: number,
    selectedYear: string | null = null
  ) => {
    let totalPrice = record.product.price * amount;

    // Use the passed `selectedYear` if available, otherwise fallback to state
    const yearToUse = selectedYear || selectedProductYear[record.id];
    if (yearToUse) {
      const yearData = record.product.years.find(
        (year) => year.year === yearToUse
      );
      if (yearData && yearData.isActive) {
        const discount = yearData.discount || 0;
        totalPrice -= (totalPrice * discount) / 100;
      }
    }

    return totalPrice;
  };

  const calculateOriginalPrice = (record: CartDataType, amount: number) => {
    let originalPrice = record.product.price * amount;
    return originalPrice;
  };

  const checkPromotion = () => {
    if (!session?.user?.custPriceGroup) return;

    // Initialize an object to group products by promotion
    const promotionGroups: {
      [key: number]: {
        totalAmount: number;
        productRedeem: string;
        amount: number;
      };
    } = {};

    // Iterate through the selected items
    selectedItems.forEach((itemId) => {
      const record = cartData.find((item) => item.id === itemId);
      if (record && record.product.promotion) {
        const promotion = record.product.promotion;

        // Check if the promotion belongs to the same user group and minisize
        if (
          promotion.userGroup === session?.user?.custPriceGroup &&
          promotion.minisizeId === record.product.minisizeId
        ) {
          // Calculate the amount for the current product
          const amount = getValues(`amount_${record.id}`);

          // If the promotion already exists in the group, accumulate the amount
          if (promotionGroups[promotion.id]) {
            promotionGroups[promotion.id].totalAmount += amount;
          } else {
            // Otherwise, create a new entry for this promotion
            promotionGroups[promotion.id] = {
              totalAmount: amount,
              productRedeem: promotion.productRedeem,
              amount: promotion.amount,
            };
          }
        }
      }
    });
    // Create an array to store the promotion texts that meet the criteria
    const validPromotionTexts: string[] = [];

    // Iterate through the grouped promotions and check the condition
    Object.values(promotionGroups).forEach((group) => {
      if (group.totalAmount >= group.amount) {
        validPromotionTexts.push(group.productRedeem);
      }
    });
    // Update the promotionText state with the valid promotions
    setPromotionText(validPromotionTexts);
  };
  const handleIncrement = (name: string, record: CartDataType) => {
    const currentValue = getValues(`amount_${record.id}`) || 0;

    const newValue = currentValue + 1;
    setValue(name, newValue);
    // Update the total price
    const totalPrice = calculateTotalPrice(record, newValue);
    let originalPrice = calculateOriginalPrice(record, newValue);

    updatePriceDisplay(record.id, totalPrice, originalPrice);
    recalculateTotals(
      cartData.filter((item) => selectedItems.includes(item.id))
    );
    checkPromotion();
  };

  const handleDecrement = (name: string, record: CartDataType) => {
    const currentValue = getValues(`amount_${record.id}`) || 0;
    if (currentValue > 0) {
      const newValue = currentValue - 1;
      setValue(name, newValue);

      if (newValue === 0) {
        removeItem(record); // Call removeItem if the new value is 0
      } else {
        // Update the total price only if the value is not zero
        const totalPrice = calculateTotalPrice(record, newValue);
        let originalPrice = calculateOriginalPrice(record, newValue);
        updatePriceDisplay(record.id, totalPrice, originalPrice);
        recalculateTotals(
          cartData.filter((item) => selectedItems.includes(item.id))
        );
        checkPromotion();
      }
    }
  };

  const removeItem = (record: CartDataType) => {
    Modal.confirm({
      title: "Are you sure you want to delete this product?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`/api/cart/${record.id}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          setReloadItem(!reloadItem);
          router.replace(`/${locale}/admin/cart/${session?.user.id}`);
          toastSuccess("Product deleted successfully");
        } catch (error: any) {
          toastError(error.response.data.message);
        }
      },
    });
  };

  useEffect(() => {
    // Recalculate totals whenever selectedProductYear or selectedItems change
    recalculateTotals(
      cartData.filter((item) => selectedItems.includes(item.id))
    );
  }, [selectedProductYear, selectedItems]);

  const updatePriceDisplay = (
    productId: number,
    totalPrice: number,
    originalPrice: number
  ) => {
    const priceElement = document.querySelector(
      `.total-price[data-id='${productId}']`
    );
    if (priceElement) {
      priceElement.textContent = `฿${totalPrice.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    const originalElement = document.querySelector(
      `.original-price[data-id='${productId}']`
    );
    if (originalElement) {
      originalElement.textContent = `฿${originalPrice.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  };
  const handleYearClick = (
    yearData: { isActive: any; year: any },
    record: CartDataType
  ) => {
    if (yearData.isActive) {
      const newSelectedYear = yearData.year;

      setSelectedProductYear((prevSelectedProductYear) => {
        const updatedYearSelection = {
          ...prevSelectedProductYear,
          [record.id]: newSelectedYear,
        };

        // Update the total and original price for this specific product using the new year
        const amount = getValues(`amount_${record.id}`) || 0;
        const totalPrice = calculateTotalPrice(record, amount, newSelectedYear);
        const originalPrice = calculateOriginalPrice(record, amount);

        updatePriceDisplay(record.id, totalPrice, originalPrice);

        // Return the updated year selection
        return updatedYearSelection;
      });
    }
  };
  const rowSelection = {
    selectedRowKeys: selectedItems,
    onChange: (selectedRowKeys: React.Key[], selectedRows: CartDataType[]) => {
      setSelectedItems(selectedRowKeys.map((key) => Number(key)));
      recalculateTotals(selectedRows); // Recalculate totals based on selected items
    },
    getCheckboxProps: (record: CartDataType) => ({
      disabled: record.product.name === "Disabled Product", // Example condition to disable selection
      name: record.product.name,
    }),
  };

  const columns: ColumnsType<CartDataType> = [
    {
      title: (
        <p>
          All{" "}
          <span className="count-items">
            ({triggerCart ? backCount : normalCount} items )
          </span>
        </p>
      ),
      dataIndex: "image",
      key: "image",
      render: (_, record) => (
        <Image
          className="border border-comp-gray-layout rounded-xl"
          alt="product cart"
          width={60}
          height={60}
          src={
            record.product.image
              ? record.product.image
              : record.product.imageProduct
              ? record.product.imageProduct[0]
                ? record.product.imageProduct[0].url
                : NoImage.src
              : NoImage.src
          }
        />
      ),
    },
    {
      title: false,
      dataIndex: "productName",
      key: "productName",
      defaultSortOrder: "descend",
      render: (_, record) => {
        const selectedYearData = record.product.years.find(
          (yearData) => yearData.year === selectedProductYear[record.id]
        );
        return (
          <>
            <Tooltip title={record.product.name}>
              <div className="font-medium">
                {record.product.name.length > 20
                  ? `${record.product.name.substring(0, 30)}...`
                  : record.product.name}
              </div>
            </Tooltip>
            <span className="text-comp-gray-text text-sm">
              {record.product.brand.name.toLocaleUpperCase()}
            </span>
            <p
              className="text-comp-red-price text-xl inter-bold-font pt-2 total-price"
              data-id={record.id}
            >
              ฿
              {calculateTotalPrice(record, record.amount).toLocaleString(
                "en-US",
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}
            </p>
            {selectedProductYear[record.id] && selectedYearData?.isActive && (
              <div
                className={
                  "line-through text-xs text-comp-gray-text original-price"
                }
                data-id={record.id}
              >
                ฿
                {calculateOriginalPrice(record, record.amount).toLocaleString(
                  "en-US",
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}
              </div>
            )}
          </>
        );
      },
    },
    {
      title: false,
      dataIndex: "years",
      key: "years",
      render: (_, record) => (
        <div className="flex items-center force-bottom">
          <p className="gotham-font text-sm text-text-gray-hover pr-2 ">Year</p>
          <div>
            {record.product.years.map((yearData: any, index: number) => (
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
                    cursor: yearData.isActive ? "pointer" : "not-allowed",
                    color: yearData.isActive
                      ? selectedProductYear[record.id] === yearData.year
                        ? "#E4E7EB"
                        : "#B8252E"
                      : "#A6AEBB",
                  }}
                  onClick={() => handleYearClick(yearData, record)}
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
        </div>
      ),
    },
    {
      title: false,
      dataIndex: "addCart",
      key: "addCart",
      defaultSortOrder: "descend",
      render: (_, record) => (
        <>
          <div
            className="flex justify-end pb-4 items-center cursor-pointer hover:underline"
            onClick={() => removeItem(record)}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.1253 4.2063C13.1128 4.2063 13.094 4.2063 13.0753 4.2063C9.76903 3.87505 6.46903 3.75005 3.20028 4.0813L1.92528 4.2063C1.66278 4.2313 1.43153 4.0438 1.40653 3.7813C1.38153 3.5188 1.56903 3.2938 1.82528 3.2688L3.10028 3.1438C6.42528 2.8063 9.79403 2.93755 13.169 3.2688C13.4253 3.2938 13.6128 3.52505 13.5878 3.7813C13.569 4.02505 13.3628 4.2063 13.1253 4.2063Z"
                fill="black"
                fillOpacity="0.3"
              />
              <path
                d="M5.31296 3.575C5.28796 3.575 5.26296 3.575 5.23171 3.56875C4.98171 3.525 4.80671 3.28125 4.85046 3.03125L4.98796 2.2125C5.08796 1.6125 5.22546 0.78125 6.68171 0.78125H8.31921C9.78171 0.78125 9.91921 1.64375 10.013 2.21875L10.1505 3.03125C10.1942 3.2875 10.0192 3.53125 9.76921 3.56875C9.51296 3.6125 9.26921 3.4375 9.23171 3.1875L9.09421 2.375C9.00671 1.83125 8.98796 1.725 8.32546 1.725H6.68796C6.02546 1.725 6.01296 1.8125 5.91921 2.36875L5.77546 3.18125C5.73796 3.4125 5.53796 3.575 5.31296 3.575Z"
                fill="black"
                fillOpacity="0.3"
              />
              <path
                d="M9.50649 14.2187H5.49399C3.31274 14.2187 3.22524 13.0125 3.15649 12.0375L2.75024 5.74374C2.73149 5.48749 2.93149 5.26249 3.18774 5.24374C3.45024 5.23124 3.66899 5.42499 3.68774 5.68124L4.09399 11.975C4.16274 12.925 4.18774 13.2812 5.49399 13.2812H9.50649C10.819 13.2812 10.844 12.925 10.9065 11.975L11.3127 5.68124C11.3315 5.42499 11.5565 5.23124 11.8127 5.24374C12.069 5.26249 12.269 5.48124 12.2502 5.74374L11.844 12.0375C11.7752 13.0125 11.6877 14.2187 9.50649 14.2187Z"
                fill="black"
                fillOpacity="0.3"
              />
              <path
                d="M8.5373 10.7812H6.45605C6.1998 10.7812 5.9873 10.5688 5.9873 10.3125C5.9873 10.0563 6.1998 9.84375 6.45605 9.84375H8.5373C8.79356 9.84375 9.00605 10.0563 9.00605 10.3125C9.00605 10.5688 8.79356 10.7812 8.5373 10.7812Z"
                fill="black"
                fillOpacity="0.3"
              />
              <path
                d="M9.0625 8.28125H5.9375C5.68125 8.28125 5.46875 8.06875 5.46875 7.8125C5.46875 7.55625 5.68125 7.34375 5.9375 7.34375H9.0625C9.31875 7.34375 9.53125 7.55625 9.53125 7.8125C9.53125 8.06875 9.31875 8.28125 9.0625 8.28125Z"
                fill="black"
                fillOpacity="0.3"
              />
            </svg>
            <p className="text-[#a2a2a2] text-xs pl-1">Delete</p>
          </div>
          <Form
            key={record.id}
            name={`form_${record.id}`}
            layout="inline"
            className="add-cart-form"
          >
            <Space className="force-bottom">
              <Form.Item
                name={`amount_${record.id}`}
                label={false}
                required
                tooltip="This is a required field"
                help={
                  errors[`amount_${record.id}`] && "Please enter reward point"
                }
                validateStatus={errors[`amount_${record.id}`] ? "error" : ""}
              >
                <Controller
                  control={control}
                  name={`amount_${record.id}`}
                  render={({ field }) => (
                    <div className="flex custom-input-number justify-center border-year">
                      <Button
                        className="minus-icon-cart"
                        icon={<MinusIcon className="w-6 text-black" />}
                        onClick={() =>
                          handleDecrement(`amount_${record.id}`, record)
                        }
                      />
                      <InputNumber
                        {...field}
                        min={0}
                        step={1}
                        disabled={true}
                        className="w-full text-lg"
                        value={getValues(`amount_${record.id}`)}
                      />

                      <Button
                        className="plus-icon-cart"
                        icon={<PlusIcon className="w-6 text-black" />}
                        onClick={() =>
                          handleIncrement(`amount_${record.id}`, record)
                        }
                      />
                    </div>
                  )}
                />
              </Form.Item>
            </Space>
          </Form>
        </>
      ),
    },
  ];

  useEffect(() => {
    axios
      .get(`/api/cart/${params.id}`)
      .then((response) => {
        const useCart = response.data.items.map((item: any) => ({
          key: item.id,
          id: item.id,
          type: item.type,
          price: item.price,
          discount: item.discount,
          amount: item.amount,
          product: {
            id: item.product.id,
            name: item.product.name,
            brandName: item.product.brandName,
            price: item.product.price,
            minisizeId: item.product.minisizeId,
            years: JSON.parse(
              item.product.years as unknown as string
            ) as YearDataType[],
            image: item.product.image,
            brand: {
              id: item.product.brand.id,
              name: item.product.brand.name,
            },
            imageProduct: item.product.imageProducts,
            promotion: item.product.promotion,
          },
        }));
        setCartData(useCart);
        // Calculate counts
        const normal = useCart.filter(
          (cart: { type: string; item: any }) => cart.type === "Normal"
        ).length;
        const back = useCart.filter(
          (cart: { type: string; item: any }) => cart.type === "Back"
        ).length;

        setNormalCount(normal);
        setBackCount(back);

        // Automatically select the active year
        const defaultSelectedYears: { [key: number]: string | null } = {};
        useCart.forEach((cartItem: any) => {
          const activeYear = cartItem.product.years.find(
            (year: { isActive: boolean; discount: number }) =>
              year.discount === cartItem.discount
          );
          if (activeYear) {
            defaultSelectedYears[cartItem.id] = activeYear.year;
          }
          setValue(`amount_${cartItem.id}`, cartItem.amount);
        });
        setSelectedProductYear(defaultSelectedYears);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, [reloadItem]);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <Badge
          className="redeem-badge default-font"
          count={normalCount}
          offset={[10, 1]}
        >
          <p>Normal Order</p>
        </Badge>
      ),
      children: (
        <div className="grid grid-rows-2 grid-flow-col gap-4">
          <div className="row-start-1 row-end-4">
            <DatatableSelect
              rowSelection={rowSelection}
              columns={columns}
              data={cartData.filter((cart) => cart.type === "Normal")}
            />
          </div>
          <Checkout
            totalAmount={totalAmount}
            totalPrice={totalPrice}
            discountRate={discountRate}
            cartData={cartData}
            selectedItems={selectedItems}
            selectedProductYear={selectedProductYear}
            getValues={getValues}
            calculateTotalPrice={calculateTotalPrice}
            calculateOriginalPrice={calculateOriginalPrice}
            promotionText={promotionText}
          />
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <Badge
          className="redeem-badge default-font"
          count={backCount}
          offset={[10, 1]}
        >
          <p>Back Order</p>
        </Badge>
      ),
      children: (
        <div className="grid grid-rows-2 grid-flow-col gap-4">
          <div className="row-start-1 row-end-4">
            <DatatableSelect
              rowSelection={rowSelection}
              columns={columns}
              data={cartData.filter((cart) => cart.type === "Back")}
            />
          </div>
          <Checkout
            totalAmount={totalAmount}
            totalPrice={totalPrice}
            discountRate={discountRate}
            cartData={cartData}
            selectedItems={selectedItems}
            selectedProductYear={selectedProductYear}
            getValues={getValues}
            calculateTotalPrice={calculateTotalPrice}
            calculateOriginalPrice={calculateOriginalPrice}
            promotionText={promotionText}
          />
        </div>
      ),
    },
  ];

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const onChange = (key: string) => {
    clearSelection();
    if (key === "1") {
      setTriggerCart(false);
    } else if (key === "2") {
      setTriggerCart(true);
    }
  };
  return (
    <div className="px-12">
      <div className="flex">
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
  );
};

const Checkout: React.FC<CheckoutProps> = ({
  totalAmount,
  totalPrice,
  discountRate,
  cartData,
  selectedItems,
  selectedProductYear,
  getValues,
  calculateOriginalPrice,
  calculateTotalPrice,
  promotionText,
}) => {
  const subDiscount = discountRate;
  const calDiscount = totalPrice * (subDiscount / 100);
  const afterDiscount = totalPrice - calDiscount;
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useCurrentLocale(i18nConfig);
  const { cartItemCount, setCartItemCount } = useCart();

  const onSubmit = async () => {
    if (!session?.user?.id) {
      toastError("Please login before checkout");
      return;
    }

    // Filter the selected items
    const selectedCartItems = cartData.filter((item: any) =>
      selectedItems.includes(item.id)
    );
    if (selectedCartItems.length === 0) {
      toastError("No items selected for checkout");
      return;
    }

    try {
      // Prepare the order data
      let joinedString = "";
      if (promotionText) {
        joinedString = promotionText.join(", ");
      }
      const orderData = {
        userId: session?.user.id,
        totalAmount: totalAmount,
        totalPrice: totalPrice - totalPrice * (discountRate / 100),
        subTotal: totalPrice,
        groupDiscount: discountRate,
        type: selectedCartItems[0].type, // Assuming all items have the same type
        externalDocument: joinedString,
      };

      // Send the request to create an order
      const { data: createdOrder } = await axios.post("/api/order", orderData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Prepare the order items data
      const orderItemsData = selectedCartItems.map(
        (item: {
          product: { years: any[]; id: any };
          id: string | number;
          type: any;
        }) => {
          const selectedYearData = item.product.years.find(
            (yearData) => yearData.year === selectedProductYear[item.id]
          );

          return {
            cartId: item.id,
            orderId: createdOrder.id,
            productId: item.product.id,
            amount: getValues(`amount_${item.id}`),
            type: item.type,
            price: calculateOriginalPrice(item, getValues(`amount_${item.id}`)),
            year: selectedYearData?.year
              ? parseInt(selectedYearData.year)
              : null,
            discount: selectedYearData?.discount || 0,
            discountPrice:
              (calculateTotalPrice(item, getValues(`amount_${item.id}`)) *
                (selectedYearData?.discount || 0)) /
              100,
          };
        }
      );

      // Send the request to create order items
      const res = await axios.post(
        "/api/orderItem",
        { items: orderItemsData },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setCartItemCount(cartItemCount - res.data.count);

      toastSuccess("Order placed successfully");
      if (selectedCartItems[0].type == "normal") {
        router.replace(`/${locale}/admin/normal-order`);
      } else {
        router.replace(`/${locale}/admin/back-order`);
      }
    } catch (error: any) {
      toastError(error.message);
    }
  };

  return (
    <div className="bg-white row-end-2 row-span-1 p-4 rounded-lg checkout-box">
      <p className="gotham-font text-black text-base pt-4 font-medium">
        Order summary
      </p>
      <Divider />
      {promotionText && promotionText.length > 0 && (
        <>
          <div className="flex justify-between promotion-text">
            <p className="text-sm">Promotion</p>
            <p className="text-sm">{promotionText.join(", ")}</p>
          </div>
          <Divider />
        </>
      )}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm">Sub Total</p>
          <p className="text-xs text-text-gray-hover sub-amount">
            ({totalAmount} items)
          </p>
        </div>
        <div className="text-base font-base sub-total">
          ฿
          {totalPrice.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
      <Divider />
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm">Discount</p>
          <p className="text-xs text-comp-red sub-discount">({subDiscount}%)</p>
        </div>
        <div className="text-base font-base text-comp-red cal-discount">
          ฿
          {calDiscount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
      <Divider />
      <div className="flex justify-between">
        <div>
          <p>Total</p>
        </div>
        <div className="text-base font-medium after-discount">
          ฿
          {afterDiscount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
      <div className="button-full">
        <Form.Item>
          <Button
            onClick={() => onSubmit()}
            type="primary"
            htmlType="submit"
            className="gotham-font bg-comp-red-price button-backend w-full mt-4 p-6 flex justify-between text-base font-medium"
          >
            <p>Checkout</p>
            <p className="after-discount">
              ฿
              {afterDiscount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </Button>
        </Form.Item>
      </div>
    </div>
  );
};

export default Cart;