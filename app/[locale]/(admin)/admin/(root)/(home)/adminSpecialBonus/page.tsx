"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useForm,
  Controller,
  useFieldArray,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Row, Col, InputNumber, Select, Form, Modal, ColorPicker } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { usePathname, useRouter } from "next/navigation";
import {
  specialBonusSchema,
  SpecialBonusSchema,
} from "@lib-schemas/user/special-bonus-schema";
import axios from "axios";
import DatePickers from "@components/Admin/DatePickers";
import { PowerIcon } from "@heroicons/react/24/outline";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import { useCart } from "@components/Admin/Cartcontext";
import debounce from "lodash.debounce";
import dynamic from "next/dynamic";
import { SelectValue } from "antd/es/select";
const Loading = dynamic(() => import("@components/Loading"));

interface Option {
  label: string;
  value: string;
}

export default function AdminSpecialBonus() {
  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [monthOptions, setMonthOptions] = useState<Option[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(""); // Default to "All" (empty string)

  const [brandOptions, setBrandOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [id, setId] = useState(0);
  const defaultValues = {
    year: "",
    month: "",
    resetDate: "",
    isActive: true,
    brands: [
      {
        brandId: null,
        color: '',
        items: [{ totalPurchaseAmount: 0, cn: 0, incentivePoint: 0 }],
      },
    ],
  };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SpecialBonusSchema>({
    defaultValues,
    resolver: zodResolver(specialBonusSchema),
  });

  // Field array for brands
  const {
    fields: brandFields,
    append: appendBrand,
    remove: removeBrand,
    replace: replaceBrands,
  } = useFieldArray({
    control,
    name: "brands",
  });

  useEffect(() => {
    // Fetch available brands
    const fetchBrands = async () => {
      try {
        const { data } = await axios.get(`/api/brand`);
        const brands = data.brands.map((brand: any) => ({
          value: brand.id,
          label: brand.name,
        }));
        setBrandOptions(brands);
      } catch (error: any) {
        toastError(error.message);
      }
    };
    fetchBrands();
  }, []);

  const handleMonthChange = (value: SelectValue) => {
    setSelectedMonth(value?.toString() || ""); // Update selected month, allowing for the "All" option (empty string)
    value && setValue("month", value.toString());
  };

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
        value: option.key,
      }));
    } else {
      month = months.map((option) => ({
        label: option.th,
        value: option.key,
      }));
    }
    setMonthOptions(month);
  };

  const fetchSpecialBonus = async () => {
    setLoadPage(true);
    try {
      const response = await fetch("/api/adminSpecialBonus");
      const data = await response.json();
      if (data && data.specialBonus) {
        if (data.specialBonus.brands.length > 0) {
          setSelectedMonth(data.specialBonus.month.toString());
          setValue("month", data.specialBonus.month.toString());
          setValue("year", data.specialBonus.year.toString());
          setValue("resetDate", data.specialBonus.resetDate);
          setValue("isActive", data.specialBonus.isActive);
          setId(data.specialBonus.id);
          replaceBrands(
            data.specialBonus.brands.map((brand: any) => ({
              brandId: brand.brandId,
              color: brand.color,
              items: brand.items.map((item: any) => ({
                totalPurchaseAmount: item.totalPurchaseAmount,
                cn: item.cn,
                incentivePoint: item.incentivePoint,
              })),
            }))
          );
        } else {
          setValue("month", "");
          setValue("year", "");
          setValue("resetDate", "");
          setValue("brands", [
            {
              brandId: null,
              color: '',
              items: [{ totalPurchaseAmount: 0, cn: 0, incentivePoint: 0 }],
            },
          ]);
        }
      }else {
        setValue("month", "");
        setValue("year", "");
        setValue("resetDate", "");
        setValue("brands", [
          {
            brandId: null,
            color: '',
            items: [{ totalPurchaseAmount: 0, cn: 0, incentivePoint: 0 }],
          },
        ]);
      }
  
    } catch (error) {
      console.error("Error fetching SpecialBonus:", error);
    } finally {
      setLoadPage(false);
    }
  };

  // Debounce function for search input
  const debouncedFetchData = useCallback(
    debounce(() => {
      fetchSpecialBonus();
      fetchMonth();
    }, 500), // 500 ms debounce delay
    []
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
  }, [id]);


  const onFinish: SubmitHandler<SpecialBonusSchema> = async (values) => {
    try {
      if (id > 0) {
        // Update the record if `id` exists
        const response = await fetch(`/api/adminSpecialBonus/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            ...values,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          toastSuccess(t("Form updated successfully"));
        } else {
          toastError(t(result.message || "Error updating data"));
        }
      } else {
        // Create a new record if `id` is 0 or undefined
        const response = await fetch("/api/adminSpecialBonus", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const result = await response.json();

        if (response.ok) {
          toastSuccess(t("Form saved successfully"));
        } else {
          toastError(t(result.message || "Error saving data"));
        }
      }
    } catch (error) {
      toastError(t("Error saving data"));
      console.error("Error:", error);
    }
  };
  const handleReset = async () => {
    Modal.confirm({
      title: t("are_you_sure_you_want_to_reset_this_setting"),
      content: t("this_action_cannot_be_undone"),
      okText: t("yes"),
      okType: "danger",
      cancelText: t("cancel"),
      onOk: async () => {
        try {
          if (id < 0) {
            // You need the ID to update the record
            toastError(t("No setting available to reset"));
            return;
          }

          // Send the PUT request to update isActive to false
          const response = await fetch(`/api/adminSpecialBonus/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id, // Pass the ID to identify the record
              isActive: false, // Set isActive to false
            }),
          });

          const result = await response.json();

          if (response.ok) {
            setId(0);
            router.replace(`/${locale}/admin/adminSpecialBonus`);
            toastSuccess(t("Reset successfully"));
            // Optionally, refresh the form or update the UI after the status is updated
          } else {
            toastError(t("Error resetting status"));
          }
        } catch (error) {
          toastError(t("Error resetting status"));
        }
      },
    });
  };

  if (loadPage || !t) {
    return (
      <Loading/>
    );
  }
  return (
    <div className="px-4">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow">
            {t("special bonus setting")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onFinish)}>
          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
            <Form.Item
                name="month"
                label={t('month')}
                required
                tooltip={t('this_is_a_required_field')}
              >
                <Controller
                  control={control} // control from useForm()
                  name="month"
                  render={({ field }) => (
                    <Select
                    {...field} 
                    showSearch
                    placeholder={t('Search a month')}
                    value={selectedMonth} // Default to current month
                    onChange={handleMonthChange} // Handle month change
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={monthOptions}
                  />
                  )}
                />
                 </Form.Item>

              <Form.Item
                name="year"
                label={t("year")}
                required
                tooltip={t("this_is_a_required_field")}
              >
                <DatePickers
                  placeholder={t("year")}
                  name="year"
                  control={control}
                  size="middle"
                  picker="year"
                  disabledDate={true}
                />
              </Form.Item>

              {/* </Form.Item> */}
            </div>
            <div className="flex gap-2">
              <Form.Item
                name="resetDate"
                label={t("resetDate")}
                required
                tooltip={t("this_is_a_required_field")}
              >
                <DatePickers
                  placeholder={t("Start Date")}
                  name="resetDate"
                  control={control}
                  size="middle"
                />
              </Form.Item>
              <Button
                className="bg-comp-red button-backend ml-4"
                type="primary"
                icon={<PowerIcon className="w-4" />}
                disabled={!id}
                onClick={handleReset}
              >
                {t("Reset")}
              </Button>
            </div>
          </div>
          {brandFields.map((brandField, brandIndex) => (
            <div key={brandField.id} className="mb-8">
              {/* Brand Select */}
              <div
                className="flex place-items-baseline gap-4"
                style={{
                  backgroundColor: "#ffe8eb",
                  padding: "0.5rem",
                  borderTopRightRadius: "0.5rem",
                  borderTopLeftRadius: "0.5rem",
                }}
              >
                <Form.Item label={t("Select Brand")} className="w-4/12	mb-0" required>
                  <Controller
                    name={`brands.${brandIndex}.brandId`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder={t("Select Brand")}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={brandOptions}
                      />
                    )}
                  />
                </Form.Item>
                <Form.Item label={t("Select Color")} className="w-4/12	mb-0" required>
                  <Controller
                    name={`brands.${brandIndex}.color`}
                    control={control}
                    render={({ field }) => (
                      <ColorPicker {...field} defaultValue="#1677ff" showText allowClear  onChange={(color) => {
                        field.onChange(color ? color.toHexString() : "");
                    }} />
                    )}
                  />
                </Form.Item>
                <MinusCircleOutlined onClick={() => removeBrand(brandIndex)} />
              </div>
              

              {/* Items inside brand */}
              <Row
                gutter={16}
                className="bg-[#ebebeb] py-4 font-medium"
                style={{
                  // borderTopRightRadius: "0.5rem",
                  // borderTopLeftRadius: "0.5rem",
                  margin: '0px'
                }}
              >
                <Col span={6}>
                  <p>{t("totalPurchaseAmount")}</p>
                </Col>
                <Col span={6}>
                  <p>{t("cn")}</p>
                </Col>
                <Col span={6}>
                  <p>{t("incentivePoint")}</p>
                </Col>
              
                <Col span={2}></Col> {/* Empty space for the remove icon */}
              </Row>
              <ItemFields control={control} brandIndex={brandIndex} />
            </div>
          ))}

          <Button
            type="dashed"
            onClick={() =>
              appendBrand({
                brandId: null,
                color: '',
                items: [{ totalPurchaseAmount: 0, cn: 0, incentivePoint: 0 }],
              })
            }
            icon={<PlusOutlined />}
          >
            {t("Add Brand")}
          </Button>

          <div className="flex justify-end mt-4">
            <Button
              className="bg-comp-red button-backend"
              type="primary"
              htmlType="submit"
            >
              {t("Submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ItemFields({
  control,
  brandIndex,
}: {
  control: any;
  brandIndex: number;
}) {
  const { t } = useTranslation();

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: `brands.${brandIndex}.items`,
  });

  return (
    <>
      {itemFields.map((itemField, itemIndex) => (
        <Row key={itemField.id} gutter={16} align="middle" className="py-4 bg-[#f0f8ff]" style={{margin: '0px'}}>
          <Col span={6}>
            <Controller
              name={`brands.${brandIndex}.items.${itemIndex}.totalPurchaseAmount`}
              control={control}
              render={({ field }) => (
                <InputNumber
                      {...field}
                      placeholder={t("totalPurchaseAmount")}
                      className="w-full"
                      step={0.01}
                      min={0}
                      addonAfter={t("baht")}
                    />
              )}
            />
          </Col>
          <Col span={6}>
            <Controller
              name={`brands.${brandIndex}.items.${itemIndex}.cn`}
              control={control}
              render={({ field }) => (
                <InputNumber
                {...field}
                placeholder={t("cn")}
                className="w-full"
                step={0.01}
                min={0}
                addonAfter="%"
              />
              )}
            />
          </Col>
          <Col span={6}>
            <Controller
              name={`brands.${brandIndex}.items.${itemIndex}.incentivePoint`}
              control={control}
              render={({ field }) => (
                <InputNumber
                {...field}
                placeholder={t("incentivePoint")}
                className="w-full"
                step={0.01}
                min={0}
                addonAfter={t("point")}
              />
              )}
            />
          </Col>
          <Col span={2}>
            <MinusCircleOutlined onClick={() => removeItem(itemIndex)} />
          </Col>
        </Row>
      ))}

      <Button
        type="dashed"
        onClick={() =>
          appendItem({ totalPurchaseAmount: 0, cn: 0, incentivePoint: 0 })
        }
        icon={<PlusOutlined />}
        style={{ marginTop: 16 }}
      >
        {t("Add Item")}
      </Button>
    </>
  );
}
