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
  totalPurchaseSchema,
  TotalPurchaseSchema,
} from "@lib-schemas/user/total-purchase-schema";
import DatePickers from "../DatePickers";
import { SelectValue } from "antd/es/select";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import ModalAlert from "../ModalAlert";

type Props = {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  setTriggerTotalPurchase: (value: boolean) => void;
  totalPurchaseData?: any;
  triggerTotalPurchase: boolean;
  mode: string;
  title: string;
  id: number;
  setId: (value: number) => void;
};

export interface PurchaseItem {
  totalPurchaseAmount: number;
  cn: number;
  incentivePoint: number;
  loyaltyPoint: number;
}

export interface CustomerGroup {
  id: number;
  name: string;
}

export interface TotalPurchaseDataType {
  id: number;
  name: string;
  year: string;
  month: string;
  resetDate: string;
  isActive: boolean;
  customerGroupId: number;
  customerGroup: CustomerGroup[];
  items: PurchaseItem[];
}

interface Option {
  label: string;
  value: string;
}

const Hr = styled.hr`
  ${tw`bg-comp-gray-line mx-24`}
`;

const ModalTotalPurchase = ({
  isModalVisible,
  setIsModalVisible,
  setTriggerTotalPurchase,
  totalPurchaseData,
  triggerTotalPurchase,
  title,
  id,
  mode,
  setId,
}: Props) => {
  const defaultValues = {
    year: "",
    month: "",
    resetDate: "",
    isActive: true,
    items: [
      { totalPurchaseAmount: 0, cn: 0, incentivePoint: 0, loyaltyPoint: 0 },
    ],
  };

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = useForm<TotalPurchaseSchema>({
    defaultValues,
    resolver: zodResolver(totalPurchaseSchema(mode as "CREATE" | "EDIT")),
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

  const [triggerModal, setTriggerModal] = useState(false);
  const router = useRouter();
  const [editTotalPurchaseData, setEditTotalPurchaseData] =
    useState<TotalPurchaseDataType | null>(null);

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

  useEffect(() => {
    if (!isAlert) {
      resetMainForm();
    }
  }, [isAlert]);

  useEffect(() => {
    fetchCustomerGroup();
    fetchMonth();
  }, []);

  useEffect(() => {
    const totalPurchase = totalPurchaseData.find(
      (item: { id: number }) => item.id === id
    );
    if (totalPurchase && mode === "EDIT") {
      // Set form values
      setEditTotalPurchaseData(totalPurchase);
      setValue("name", totalPurchase.name.toString());
      setValue("customerGroupId", totalPurchase.customerGroupId);
      setSelectedMonth(totalPurchase.month.toString());
      setValue("month", totalPurchase.month.toString());
      setValue("year", totalPurchase.year.toString());
      setValue("resetDate", totalPurchase.resetDate);
      setValue("isActive", totalPurchase.isActive);
      setValue("items", totalPurchase.items);
      setId(totalPurchase.id);
      setGroupId(totalPurchase.customerGroupId);

      // Manually update the field array using replace
      replace(
        totalPurchase.items.map((item: any) => ({
          totalPurchaseAmount: item.totalPurchaseAmount,
          cn: item.cn,
          incentivePoint: item.incentivePoint,
          loyaltyPoint: item.loyaltyPoint,
        }))
      );
    } else {
      reset({
        name: "",
        month: "",
        year: "",
        resetDate: "",
        isActive: false,
        items: [
          { totalPurchaseAmount: 0, cn: 0, incentivePoint: 0, loyaltyPoint: 0 },
        ],
      });
    }
  }, [totalPurchaseData, id]);

  const resetForm = () => {
    reset({
      name: "",
      month: "",
      year: "",
      resetDate: "",
      isActive: false,
      customerGroupId: null,
      items: [
        { totalPurchaseAmount: 0, cn: 0, incentivePoint: 0, loyaltyPoint: 0 },
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
        items: [
          { totalPurchaseAmount: 0, cn: 0, incentivePoint: 0, loyaltyPoint: 0 },
        ],
      });
    }

  };

  const onSubmit: SubmitHandler<TotalPurchaseSchema> = async (values) => {
    if (mode === "EDIT" && editTotalPurchaseData) {
      try {
        const response = await fetch(`/api/adminTotalPurchase/${id}`, {
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
        setTriggerTotalPurchase(!triggerTotalPurchase);
        setTriggerModal(!triggerModal);
        toastSuccess(t("Total Purchase updated successfully"));
        router.replace(`/${locale}/admin/adminTotalPurchase`);
      } catch (error: any) {
        toastError(error.message);
      }
    } else {
      try {
        console.log(values)
        const response = await axios.post(`/api/adminTotalPurchase`, values, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setSelectedMonth("");
        resetForm();
        setTriggerTotalPurchase(!triggerTotalPurchase);
        setTriggerModal(!triggerModal);
        toastSuccess(t("Total Purchase created successfully"));
        router.replace(`/${locale}/admin/adminTotalPurchase`);
      } catch (error: any) {
        toastError(error.message);
      }
    }
  };

  const checkCustomerGroup = async (value: number) => {
    try {
      const params: any = {
        id: value
      };
      const response  = await axios.get(`/api/getListTotalPurchase/${value}`, { params });

      if (response.data.id !== id)
      setIsAllowed(response.data.found);
      setIsAlert(response.data.found);
      setCheckId(response.data.id);

    } catch (error: any) {
      toastError(error.message);
    }
  };

  const handleActive = (value: boolean) => {
    value && mode === "EDIT" &&
    checkCustomerGroup(groupId);
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
                <Input {...field} placeholder={t("name")} width={'100%'}/>
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
                    disabled={mode === "EDIT"}
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
                    disabled={mode === "EDIT"}
                  />
                )}
              />
            </Col>
            <Col span={6}>
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
                    disabled={mode === "EDIT"}
                  />
                )}
              />
            </Col>
            <Col span={6}>
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
                    disabled={mode === "EDIT"}
                  />
                )}
              />
            </Col>
            <Col span={2}>
            {mode === "EDIT" ? <MinusCircleOutlined/> : <MinusCircleOutlined onClick={() => remove(index)} />}
              
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
            disabled={mode === "EDIT"}
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
      {/* {isAllowed &&   */}
        <ModalAlert
          setIsAllowed={setIsAllowed}
          isAllowed={isAllowed}
          setIsModalVisible={setIsModalVisible}
          message={t('Error')}
          description={t('This customer group is already active Please select a different customer group or deactivate this one first')}
          resetMainForm={() => resetMainForm()}
          setIsAlert={setIsAlert}
          isAlert={isAlert}
        />
    </Modal>
  );
};

export default ModalTotalPurchase;
