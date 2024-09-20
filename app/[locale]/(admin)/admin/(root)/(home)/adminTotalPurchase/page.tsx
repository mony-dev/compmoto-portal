"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useForm,
  Controller,
  SubmitHandler,
  useFieldArray,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  totalPurchaseSchema,
  TotalPurchaseSchema,
} from "@lib-schemas/user/total-purchase-schema";
import {
  Button,
  Form,
  Input,
  Space,
  Row,
  Col,
  InputNumber,
  Modal,
  Select,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useCart } from "@components/Admin/Cartcontext";
import { usePathname, useRouter } from "next/navigation";
import { CheckCircleIcon, PowerIcon } from "@heroicons/react/24/outline";
import DatePickers from "@components/Admin/DatePickers";
import { toastError, toastSuccess } from "@lib-utils/helper";
import i18nConfig from "../../../../../../../i18nConfig";
import { useCurrentLocale } from "next-i18n-router/client";
import debounce from "lodash.debounce";
import dynamic from "next/dynamic";
import { SelectValue } from "antd/es/select";
interface Option {
  label: string;
  value: string;
}
export default function AdminTotalPurchase() {
  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const pathname = usePathname();
  const [form] = Form.useForm();
  const [id, setId] = useState(0);
  const router = useRouter();
  const Loading = dynamic(() => import("@components/Loading"));
  const [monthOptions, setMonthOptions] = useState<Option[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(""); // Default to "All" (empty string)

  const defaultValues = {
    year: "",
    month: "",
    resetDate: "",
    isActive: true,
    items: [
      { totalPurchaseAmount: 0, cn: 0, incentivePoint: 0, loyaltyPoint: 0 },
    ], // Ensure items start with one object
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<TotalPurchaseSchema>({
    defaultValues,
    resolver: zodResolver(totalPurchaseSchema),
  });

  const { fields, append, remove, replace } = useFieldArray({
    control, // Attach the field array to the form control
    name: "items", // Specify which part of the form this array refers to
  });

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

  const fetchActiveTotalPurchase = async () => {
    try {
      const response = await fetch("/api/adminTotalPurchase");
      const data = await response.json();

      if (data && data.totalPurchase) {
        // Set the basic form values
        console.log(data.totalPurchase.month.toString());
        setSelectedMonth(data.totalPurchase.month.toString());
        setValue("month", data.totalPurchase.month.toString());
        setValue("year", data.totalPurchase.year.toString());
        setValue("resetDate", data.totalPurchase.resetDate);
        setValue("isActive", data.totalPurchase.isActive);
        setValue("items", data.totalPurchase.items);
        setId(data.totalPurchase.id);
        // Manually update the field array using replace
        replace(
          data.totalPurchase.items.map((item: any) => ({
            totalPurchaseAmount: item.totalPurchaseAmount,
            cn: item.cn,
            incentivePoint: item.incentivePoint,
            loyaltyPoint: item.loyaltyPoint,
          }))
        );
      } else {
        setValue("month", "");
        setValue("year", "");
        setValue("resetDate", "");
        setValue("items", [
          { totalPurchaseAmount: 0, cn: 0, incentivePoint: 0, loyaltyPoint: 0 },
        ]);
      }
    } catch (error) {
      console.error("Error fetching active TotalPurchase:", error);
    }
  };

  // Debounce function for search input
  const debouncedFetchData = useCallback(
    debounce(() => {
      fetchActiveTotalPurchase();
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

  const onFinish: SubmitHandler<TotalPurchaseSchema> = async (values) => {
    console.log(values);
    try {
      if (id > 0) {
        const response = await fetch(`/api/adminTotalPurchase/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id, // Pass the ID to identify the record
            ...values, // Pass the form values
          }),
        });
        const result = await response.json();
        toastSuccess(t("Form updated successfully"));
      } else {
        const response = await fetch("/api/adminTotalPurchase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        const result = await response.json();
        toastSuccess(t("Form saved successfully"));
      }
    } catch (error) {
      toastError(t("Error saving data"));
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
          const response = await fetch(`/api/adminTotalPurchase/${id}`, {
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
            router.replace(`/${locale}/admin/adminTotalPurchase`);
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

  return (
    <div className="px-4">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow">
            {t("total purchase setting")}
          </p>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit(onFinish)}
          layout="horizontal"
          labelWrap
        >
          {/* Year and Reset Date */}
          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              <Form.Item
                name="month"
                label={t("month")}
                required
                tooltip={t("this_is_a_required_field")}
              >
                <Controller
                  control={control} // control from useForm()
                  name="month"
                  render={({ field }) => (
                    <Select
                      {...field}
                      showSearch
                      placeholder={t("Search a month")}
                      value={selectedMonth} // Default to current month
                      onChange={handleMonthChange} // Handle month change
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
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

          {/* Header for dynamic fields */}
          <Row
            gutter={16}
            className="mt-4 bg-[#ebebeb] py-4 font-medium"
            style={{
              borderTopRightRadius: "0.5rem",
              borderTopLeftRadius: "0.5rem",
            }}
          >
            <Col span={6}>
              <p>{t("totalPurchaseAmount")}</p>
            </Col>
            <Col span={4}>
              <p>{t("cn")}</p>
            </Col>
            <Col span={4}>
              <p>{t("incentivePoint")}</p>
            </Col>
            <Col span={4}>
              <p>{t("loyaltyPoint")}</p>
            </Col>
            <Col span={2}></Col> {/* Empty space for the remove icon */}
          </Row>

          {fields.map((field, index) => (
            <Row
              key={field.id}
              gutter={16}
              align="middle"
              className="py-4 bg-[#f0f8ff]"
            >
              <Col span={6}>
                <Controller
                  name={`items.${index}.totalPurchaseAmount`}
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
              <Col span={4}>
                <Controller
                  name={`items.${index}.cn`}
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
              <Col span={4}>
                <Controller
                  name={`items.${index}.incentivePoint`}
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
              <Col span={4}>
                <Controller
                  name={`items.${index}.loyaltyPoint`}
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      placeholder={t("loyaltyPoint")}
                      className="w-full"
                      step={0.01}
                      min={0}
                      addonAfter={t("point")}
                    />
                  )}
                />
              </Col>
              <Col span={2}>
                <MinusCircleOutlined onClick={() => remove(index)} />
              </Col>
            </Row>
          ))}

          {/* Add Item Button */}
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 16 }}
          >
            {errors.items && (
              <div className="text-red-500 mt-2 font-semibold">
                {errors.items.message && t("At least one item is required")}
              </div>
            )}
            <Button
              type="dashed"
              onClick={() =>
                append([
                  {
                    totalPurchaseAmount: 0,
                    cn: 0,
                    incentivePoint: 0,
                    loyaltyPoint: 0,
                  },
                ])
              }
              shape="circle"
              icon={<PlusOutlined />}
              size="large"
            />
          </div>

          <Form.Item className="flex justify-end">
            <Button
              className="bg-comp-red button-backend"
              type="primary"
              htmlType="submit"
              icon={<CheckCircleIcon className="w-4" />}
            >
              {t("submit")}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
