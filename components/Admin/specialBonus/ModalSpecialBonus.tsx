import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "@lib-utils/helper";
import {
  Button,
  Form,
  Input,
  Modal,
  Switch,
  Select,
  InputNumber,
  Row,
  Col,
  ColorPicker,
} from "antd";
import axios from "axios";
import { useCurrentLocale } from "next-i18n-router/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import tw from "twin.macro";
import i18nConfig from "../../../i18nConfig";
import {
  specialBonusSchema,
  SpecialBonusSchema,
} from "@lib-schemas/user/special-bonus-schema";
import DatePickers from "../DatePickers";
import { SelectValue } from "antd/es/select";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import ModalAlert from "../ModalAlert";

type Props = {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  setTriggerSpecialBonus: (value: boolean) => void;
  specialBonusData?: any;
  triggerSpecialBonus: boolean;
  mode: string;
  title: string;
  id: number;
  setId: (value: number) => void;
};

export interface BonusItem {
  totalPurchaseAmount: number;
  cn: number;
  incentivePoint: number;
  order: number;
  color: string;
  minisizeId: number;
}

export interface CustomerGroup {
  id: number;
  name: string;
}

export interface SpecialBonusDataType {
  id: number;
  name: string;
  year: string;
  month: string;
  resetDate: string;
  isActive: boolean;
  customerGroupId: number;
  customerGroup: CustomerGroup[];
  brands: BonusItem[];
}

interface Option {
  label: string;
  value: string;
}

const Hr = styled.hr`
  ${tw`bg-comp-gray-line mx-24`}
`;

const ModalSpecialBonus = ({
  isModalVisible,
  setIsModalVisible,
  setTriggerSpecialBonus,
  specialBonusData,
  triggerSpecialBonus,
  title,
  id,
  mode,
  setId,
}: Props) => {
  const defaultValues = {
    year: "",
    month: "",
    resetDate: "",
    name: "",
    isActive: true,
    brands: [
      {
        minisizeId: null,
        color: "",
        items: [{ totalPurchaseAmount: 0, cn: 0, incentivePoint: 0 }],
      },
    ],
  };

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = useForm<SpecialBonusSchema>({
    defaultValues,
    resolver: zodResolver(specialBonusSchema(mode as "CREATE" | "EDIT")),
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

  const [triggerModal, setTriggerModal] = useState(false);
  const router = useRouter();
  const [editSpecialBonusData, setEditSpecialBonusData] =
    useState<SpecialBonusDataType | null>(null);

  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);
  const [monthOptions, setMonthOptions] = useState<Option[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [form] = Form.useForm();
  const [customerGroupOptions, setCustomerGroupOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [isAlert, setIsAlert] = useState<boolean>(false);
  const [groupId, setGroupId] = useState<number>(0);
  const [checkId, setCheckId] = useState<number>(0);

  const [minisizeOptions, setMinisizeOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [brandOptions, setBrandOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const fetchCustomerGroup = async () => {
    try {
      const response = await axios.get("/api/getListCustomerGroup");
      const customerGroups = response.data.customerGroups.map(
        (customerGroup: any) => ({
          value: customerGroup.id,
          label: customerGroup.name,
        })
      );
      setCustomerGroupOptions(customerGroups);
    } catch (error: any) {
      toastError(error.message);
    }
  };

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
  const fetchMinisize = async () => {
    try {
      const { data } = await axios.get(`/api/getMinisize`);
      const minisizes = data.minisizes.map((mini: any) => ({
        value: mini.id,
        label: mini.name,
      }));
      setMinisizeOptions(minisizes);
    } catch (error: any) {
      toastError(error.message);
    }
  };
  useEffect(() => {
    if (!isAlert) {
      resetMainForm();
    }
  }, [isAlert]);

  useEffect(() => {
    fetchCustomerGroup();
    fetchMonth();
    fetchBrands();
    fetchMinisize();
  }, []);

  useEffect(() => {
    const specialBonus = specialBonusData.find(
      (item: { id: number }) => item.id === id
    );
    if (specialBonus && mode === "EDIT") {
      // Set form values
      setEditSpecialBonusData(specialBonus);
      setValue("name", specialBonus.name.toString());
      setValue("customerGroupId", specialBonus.customerGroupId);
      setSelectedMonth(specialBonus.month.toString());
      setValue("month", specialBonus.month.toString());
      setValue("year", specialBonus.year.toString());
      setValue("resetDate", specialBonus.resetDate);
      setValue("isActive", specialBonus.isActive);
      replaceBrands(
        specialBonus.brands.map((brand: any) => ({
          // brandId: brand.brandId,
          minisizeId: brand.minisizeId,
          color: brand.color,
          items: brand.items.map((item: any) => ({
            totalPurchaseAmount: item.totalPurchaseAmount,
            cn: item.cn,
            incentivePoint: item.incentivePoint,
          })),
        }))
      );
      setId(specialBonus.id);
      setGroupId(specialBonus.customerGroupId);

      // Manually update the field array using replace
      // replace(
      //   totalPurchase.items.map((item: any) => ({
      //     totalPurchaseAmount: item.totalPurchaseAmount,
      //     cn: item.cn,
      //     incentivePoint: item.incentivePoint,
      //     loyaltyPoint: item.loyaltyPoint,
      //   }))
      // );
    } else {
      setValue("month", "");
      setValue("year", "");
      setValue("name", "");
      setValue("resetDate", "");
      setValue("brands", [
        {
          minisizeId: null,
          color: "",
          items: [{ totalPurchaseAmount: 0, cn: 0, incentivePoint: 0 }],
        },
      ]);
    }
  }, [specialBonusData, id]);

  const resetForm = () => {
    reset({
      name: "",
      month: "",
      year: "",
      resetDate: "",
      isActive: false,
      customerGroupId: null,
      brands: [
        {
          minisizeId: null,
          color: "",
          items: [{ totalPurchaseAmount: 0, cn: 0, incentivePoint: 0 }],
        },
      ],
    });
    setIsModalVisible(false);
    setId(0);
  };

  const resetMainForm = () => {
    if (mode === "EDIT") {
      checkId !== id && setValue("isActive", false);
    } else {
      reset({
        name: "",
        month: "",
        year: "",
        resetDate: "",
        isActive: false,
        customerGroupId: null,
        brands: [
          {
            minisizeId: null,
            color: "",
            items: [{ totalPurchaseAmount: 0, cn: 0, incentivePoint: 0 }],
          },
        ],
      });
    }
  };

  const onSubmit: SubmitHandler<SpecialBonusSchema> = async (values) => {
    if (mode === "EDIT" && editSpecialBonusData) {
      try {
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
        setSelectedMonth("");
        resetForm();
        setTriggerSpecialBonus(!triggerSpecialBonus);
        setTriggerModal(!triggerModal);
        toastSuccess("Special Bonus updated successfully");
        router.replace(`/${locale}/admin/adminSpecialBonus`);
      } catch (error: any) {
        toastError(error.message);
      }
    } else {
      try {
        const response = await axios.post(`/api/adminSpecialBonus`, values, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setSelectedMonth("");
        resetForm();
        setTriggerSpecialBonus(!triggerSpecialBonus);
        setTriggerModal(!triggerModal);
        toastSuccess("Special Bonus created successfully");
        router.replace(`/${locale}/admin/adminSpecialBonus`);
      } catch (error: any) {
        toastError(error.message);
      }
    }
  };

  const checkCustomerGroup = async (value: number) => {
    try {
      const params: any = {
        id: value,
      };
      const response = await axios.get(`/api/getListSpecialBonus/${value}`, {
        params,
      });

      if (response.data.id !== id) setIsAllowed(response.data.found);
      setIsAlert(response.data.found);
      setCheckId(response.data.id);
    } catch (error: any) {
      toastError(error.message);
    }
  };

  const handleActive = (value: boolean) => {
    value && mode === "EDIT" && checkCustomerGroup(groupId);
  };

  return (
    <Modal
      title={title}
      open={isModalVisible}
      onCancel={() => resetForm()}
      footer={false}
      width={"700px"}
    >
      <Form
        form={form}
        onFinish={handleSubmit(onSubmit)}
        layout="horizontal"
        labelWrap
      >
        <div className="grid grid-cols-4 grid-rows-3 gap-2">
          <Form.Item
            name="customerGroupId"
            label={t("customerGroup")}
            className="switch-backend basis-1/2 col-span-2"
            required
            help={errors.customerGroupId?.message}
            validateStatus={errors.customerGroupId ? "error" : ""}
          >
            <Controller
              control={control}
              name="customerGroupId"
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  placeholder={t("Select a Customer Group")}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  disabled={mode === "EDIT"}
                  options={customerGroupOptions}
                  onChange={(value) => {
                    field.onChange(value);
                    checkCustomerGroup(value);
                  }}
                />
              )}
            />
          </Form.Item>
          <Form.Item
            name="resetDate"
            label={t("resetDate")}
            required={mode !== "EDIT"}
            className="col-span-2"
          >
            <DatePickers
              placeholder={t("Reset Date")}
              name="resetDate"
              control={control}
              size="middle"
              disabled={mode === "EDIT"}
            />
          </Form.Item>
          <Form.Item
            className="col-span-3"
            name="name"
            label={t("name")}
            required
          >
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input {...field} placeholder={t("name")} width={"100%"} />
              )}
            />
          </Form.Item>
          <Form.Item
            className="col-span-2"
            name="month"
            label={t("month")}
            required
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
                  disabled={mode === "EDIT"}
                />
              )}
            />
          </Form.Item>
          <Form.Item
            name="year"
            label={t("year")}
            required={mode !== "EDIT"}
          >
            <DatePickers
              placeholder={t("year")}
              name="year"
              control={control}
              size="middle"
              picker="year"
              disabledDate={true}
              disabled={mode === "EDIT"}
            />
          </Form.Item>
          <Form.Item
            name="isActive"
            label={false}
            className="col-start-4 row-start-2 row-span-2 switch-backend basis-1/2 pl-2 content-center active-box"
          >
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  {...field}
                  className="flex justify-self-center"
                  checkedChildren={t("active")}
                  unCheckedChildren={t("inactive")}
                  defaultChecked
                  checked={field.value}
                  onChange={(checked) => {
                    field.onChange(checked);
                    if (mode === "EDIT") {
                      handleActive(checked); // only trigger on CREATE
                    }
                  }}
                />
              )}
            />
          </Form.Item>
        </div>
        {/* Header for dynamic fields */}
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
              <Form.Item
                label={t("Select Minisize")}
                className="w-4/12	mb-0"
                required
              >
                <Controller
                  name={`brands.${brandIndex}.minisizeId`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder={t("Select Minisize")}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={minisizeOptions}
                    />
                  )}
                />
              </Form.Item>
              <Form.Item
                label={t("Select Color")}
                className="w-4/12	mb-0"
                required
              >
                <Controller
                  name={`brands.${brandIndex}.color`}
                  control={control}
                  render={({ field }) => (
                    <ColorPicker
                      {...field}
                      defaultValue="#1677ff"
                      showText
                      allowClear
                      onChange={(color) => {
                        field.onChange(color ? color.toHexString() : "");
                      }}
                    />
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
                margin: "0px",
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
              minisizeId: null,
              color: "",
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
      </Form>
      {/* {isAllowed &&   */}
      <ModalAlert
        setIsAllowed={setIsAllowed}
        isAllowed={isAllowed}
        setIsModalVisible={setIsModalVisible}
        message={t("Error")}
        description={t(
          "This customer group is already active Please select a different customer group or deactivate this one first"
        )}
        resetMainForm={() => resetMainForm()}
        setIsAlert={setIsAlert}
        isAlert={isAlert}
      />
    </Modal>
  );
};

export default ModalSpecialBonus;

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
        <Row
          key={itemField.id}
          gutter={16}
          align="middle"
          className="py-4 bg-[#f0f8ff]"
          style={{ margin: "0px" }}
        >
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
