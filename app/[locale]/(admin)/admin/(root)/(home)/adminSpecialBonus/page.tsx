"use client";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useForm,
  Controller,
  SubmitHandler,
  useFieldArray,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Row, Col, InputNumber, Modal, Select } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useCart } from "@components/Admin/Cartcontext";
import { usePathname, useRouter } from "next/navigation";
import { CheckCircleIcon, PowerIcon } from "@heroicons/react/24/outline";
import DatePickers from "@components/Admin/DatePickers";
import { toastError, toastSuccess } from "@lib-utils/helper";
import i18nConfig from "../../../../../../../i18nConfig";
import { useCurrentLocale } from "next-i18n-router/client";
import {
  specialBonusSchema,
  SpecialBonusSchema,
} from "@lib-schemas/user/special-bonus-schema";
import axios from "axios";

type Brand = {
  id: number;
  name: string;
};

export default function adminSpecialBonus() {
  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);
  const { setI18nName } = useCart();
  const pathname = usePathname();
  const [form] = Form.useForm();
  const [id, setId] = useState(0);
  const router = useRouter();
  const [brandOptions, setBrandOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const defaultValues = {
    year: "",
    month: "",
    resetDate: "",
    isActive: true,
    items: [
      {
        totalPurchaseAmount: 0,
        cn: 0,
        incentivePoint: 0,
        brandId: null,
      },
    ], // Ensure items start with one object
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<SpecialBonusSchema>({
    defaultValues,
    resolver: zodResolver(specialBonusSchema),
  });

  const {
    fields: brandFields,
    append: appendBrand,
    remove: removeBrand,
    replace,
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
        console.log("fetch brand :", error.message);
        toastError(error.message);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchSpecialBonus = async () => {
      try {
        const response = await fetch("/api/adminSpecialBonus");
        const data = await response.json();

        if (data && data.specialBonus.brands.length > 0) {
          replace(
            data.specialBonus.brands.map((brand: any) => ({
              brandId: brand.brandId,
              items: brand.items.map((item: any) => ({
                totalPurchaseAmount: item.totalPurchaseAmount,
                cn: item.cn,
                incentivePoint: item.incentivePoint,
              })),
            }))
          );
        } else {
          setValue("brands", [
            {
              brandId: null,
              items: [{ totalPurchaseAmount: 0, cn: 0, incentivePoint: 0 }],
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching SpecialBonus:", error);
      }
    };

    fetchSpecialBonus();
  }, [id]);

  const onFinish: SubmitHandler<SpecialBonusSchema> = async (values) => {
    try {
      if (id > 0) {
        const response = await fetch(`/api/adminSpecialBonus/${id}`, {
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
        console.log("values", values);
        const response = await fetch("/api/adminSpecialBonus", {
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
                <DatePickers
                  placeholder={t("month")}
                  name="month"
                  control={control}
                  size="middle"
                  picker="month"
                  disabledDate={true}
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

          {brandFields.map((brandField, brandIndex) => (
            <div key={brandField.id} className="mb-8">
              <div
                className="flex place-items-baseline gap-4"
                style={{
                  backgroundColor: "#ffe8eb",
                  padding: "0.5rem",
                  borderTopRightRadius: "0.5rem",
                  borderTopLeftRadius: "0.5rem",
                }}
              >
                <Form.Item label={t("Select Brand")} className="w-4/12	mb-0">
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
                <MinusCircleOutlined onClick={() => removeBrand(brandIndex)} />
              </div>

              {/* Managing items for the specific brand */}
              <Form.List name={`brands.${brandIndex}.items`}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, itemIndex) => (
                      <Row
                        key={itemIndex}
                        gutter={16}
                        align="middle"
                        className="py-4 bg-[#f0f8ff]"
                        style={{ marginLeft: "0px", marginRight: "0px" }}
                      >
                        <Col span={6}>
                          <Controller
                            name={`brands.${brandIndex}.items.${itemIndex}.totalPurchaseAmount`}
                            control={control}
                            render={({ field }) => (
                              <InputNumber
                                {...field}
                                placeholder="Total Purchase Amount"
                                className="w-full"
                              />
                            )}
                          />
                        </Col>
                        <Col span={4}>
                          <Controller
                            name={`brands.${brandIndex}.items.${itemIndex}.cn`}
                            control={control}
                            render={({ field }) => (
                              <InputNumber
                                {...field}
                                placeholder="CN"
                                className="w-full"
                              />
                            )}
                          />
                        </Col>
                        <Col span={4}>
                          <Controller
                            name={`brands.${brandIndex}.items.${itemIndex}.incentivePoint`}
                            control={control}
                            render={({ field }) => (
                              <InputNumber
                                {...field}
                                placeholder="Incentive Point"
                                className="w-full"
                              />
                            )}
                          />
                        </Col>
                        <Col span={2}>
                          <MinusCircleOutlined
                            onClick={() => remove(itemIndex)}
                          />
                        </Col>
                      </Row>
                    ))}

                    {/* Button to add new item */}
                    <Button
                      type="dashed"
                      onClick={() =>
                        add({
                          totalPurchaseAmount: 0,
                          cn: 0,
                          incentivePoint: 0,
                        })
                      }
                      icon={<PlusOutlined />}
                      style={{ marginTop: 16 }}
                    >
                      {t("Add Item")}
                    </Button>
                  </>
                )}
              </Form.List>
            </div>
          ))}

          {/* Button to add new brand */}
          <Button
            type="dashed"
            onClick={() =>
              appendBrand({
                brandId: null,
                items: [
                  {
                    totalPurchaseAmount: 0,
                    cn: 0,
                    incentivePoint: 0,
                  },
                ],
              })
            }
            icon={<PlusOutlined />}
          >
            {t("Add Brand")}
          </Button>

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
