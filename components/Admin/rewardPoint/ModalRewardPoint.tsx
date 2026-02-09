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
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import tw from "twin.macro";
import i18nConfig from "../../../i18nConfig";
import DatePickers from "../DatePickers";
import { SelectValue } from "antd/es/select";
import ModalAlert from "../ModalAlert";
import {
  RewardPointSchema,
  rewardPointSchema,
} from "@lib-schemas/user/reward-point-schema";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

type Props = {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  setTriggerRewardPoint: (value: boolean) => void;
  rewardPointData?: any;
  triggerRewardPoint: boolean;
  mode: string;
  title: string;
  id: number;
  setId: (value: number) => void;
};

export interface CustomerGroup {
  id: number;
  name: string;
}

export interface RewardPointDataType {
  id: number;
  name: string;
  year: string;
  month: string;
  resetDate: string;
  isActive: boolean;
  customerGroupId: number;
  customerGroup: CustomerGroup[];
  totalPurchaseId: number;
  specialBonusId: number;
  totalPurchaseName?: number;
  specialBonusName?: number;
}

interface Option {
  label: string;
  value: string;
}

const Hr = styled.hr`
  ${tw`bg-comp-gray-line mx-24`}
`;

const ModalRewardPoint = ({
  isModalVisible,
  setIsModalVisible,
  setTriggerRewardPoint,
  rewardPointData,
  triggerRewardPoint,
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
  };

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = useForm<RewardPointSchema>({
    defaultValues,
    resolver: zodResolver(rewardPointSchema(mode as "CREATE" | "EDIT")),
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
  const [editRewardPointData, setEditRewardPointData] =
    useState<RewardPointDataType | null>(null);

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

  const [totalPurchaseActive, setTotalPurchaseActive] = useState<{
    id: string;
    name: string;
  } | null>({ id: "", name: "" });
  const [specialBonusActive, setSpecialBonusActive] = useState<{
    id: string;
    name: string;
  } | null>({ id: "", name: "" });
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
    const rewardPoint = rewardPointData.find(
      (item: { id: number }) => item.id === id
    );
    if (rewardPoint && mode === "EDIT") {
      // Set form values
      setEditRewardPointData(rewardPoint);
      setValue("name", rewardPoint.name.toString());
      setValue("customerGroupId", rewardPoint.customerGroupId);
      setValue("totalPurchaseId", rewardPoint.totalPurchaseId);
      setValue("specialBonusId", rewardPoint.specialBonusId);
      setSelectedMonth(rewardPoint.month.toString());
      setValue("month", rewardPoint.month.toString());
      setValue("year", rewardPoint.year.toString());
      setValue("resetDate", rewardPoint.resetDate);
      setValue("isFinalize", rewardPoint.isFinalize);
      setValue("expenses", rewardPoint.expenses);
      setValue("point", rewardPoint.point);
      setValue("totalPurchaseName", rewardPoint.totalPurchase.name);
      setValue("specialBonusName", rewardPoint.specialBonus.name);
      setId(rewardPoint.id);
      setGroupId(rewardPoint.customerGroupId);
    } else {
      reset({
        name: "",
        month: "",
        year: "",
        resetDate: "",
        isFinalize: false,
      });
    }
  }, [rewardPointData, id]);

  const resetForm = () => {
    reset({
      name: "",
      month: "",
      year: "",
      resetDate: "",
      isFinalize: false,
      customerGroupId: null,
      totalPurchaseId: null,
      specialBonusId: null,
    });
    setIsModalVisible(false);
    setId(0);
  };

  const resetMainForm = () => {
    if (mode === "EDIT") {
      checkId !== id && setValue("isFinalize", false);
    } else {
      reset({
        name: "",
        month: "",
        year: "",
        resetDate: "",
        isFinalize: false,
        customerGroupId: null,
        totalPurchaseId: null,
        specialBonusId: null,
      });
    }
  };

  const onSubmit: SubmitHandler<RewardPointSchema> = async (values) => {
    if (mode === "EDIT" && editRewardPointData) {
      try {
        const response = await fetch(`/api/adminRewardPoint/${id}`, {
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
        setTriggerRewardPoint(!triggerRewardPoint);
        setTriggerModal(!triggerModal);
        toastSuccess(t("Reward Point updated successfully"));
        router.replace(`/${locale}/admin/adminRewardPoint`);
      } catch (error: any) {
        toastError(error.message);
      }
    } else {
      try {
        const response = await axios.post(`/api/adminRewardPoint`, values, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setSelectedMonth("");
        resetForm();
        setTriggerRewardPoint(!triggerRewardPoint);
        setTriggerModal(!triggerModal);
        toastSuccess(t("Reward Point created successfully"));
        router.replace(`/${locale}/admin/adminRewardPoint`);
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
      const response = await axios.get(`/api/getListRewardPoint/${value}`, {
        params,
      });

      if (response.data.id !== id) setIsAllowed(response.data.found);
      setIsAlert(response.data.found);
      setCheckId(response.data.id);
      setTotalPurchaseActive(response.data.totalPurchase ?? null);
      setSpecialBonusActive(response.data.specialBonus ?? null);
      if (response.data.totalPurchase && response.data.specialBonus) {
        setValue("totalPurchaseId", response.data.totalPurchase.id);
        setValue("specialBonusId", response.data.specialBonus.id);
        setValue("totalPurchaseName", response.data.totalPurchase.name);
        setValue("specialBonusName", response.data.specialBonus.name);
      }
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
        <div className="grid grid-cols-4 grid-rows-5 gap-2">
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
            name="expenses"
            label={t("expenses")}
            required
            className="col-span-2"
          >
            <Controller
              control={control}
              name="expenses"
              render={({ field }) => (
                <InputNumber
                  {...field}
                  placeholder={t("expenses")}
                  className="w-full"
                  disabled={mode === "EDIT"}
                  step={1}
                  min={0}
                  addonAfter={t("baht")}
                  formatter={(value) =>
                    value ? `${Number(value).toLocaleString()}` : ""
                  }
                />
              )}
            />
          </Form.Item>
          <Form.Item
            name="point"
            label={t("point")}
            required
            className="col-span-2"
          >
            <Controller
              control={control}
              name="point"
              render={({ field }) => (
                <InputNumber
                  {...field}
                  placeholder={t("point")}
                  className="w-full"
                  step={1}
                  min={0}
                  disabled={mode === "EDIT"}
                />
              )}
            />
          </Form.Item>
          <Form.Item
            className="col-span-2"
            name="totalPurchaseName"
            label={t("Total Purchase")}
          >
            <Controller
              control={control}
              disabled
              name="totalPurchaseName"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder={t("Total Purchase")}
                  width={"100%"}
                />
              )}
            />
          </Form.Item>
          <Form.Item
            className="col-span-2"
            name="specialBonusName"
            label={t("Special Bonus")}
          >
            <Controller
              control={control}
              disabled
              name="specialBonusName"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder={t("Special Bonus")}
                  width={"100%"}
                />
              )}
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
            name="isFinalize"
            label={false}
            className="col-start-4 row-start-4 row-span-2 switch-backend basis-1/2 pl-2 content-center active-box"
          >
            <Controller
              control={control}
              name="isFinalize"
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
    
      {totalPurchaseActive && specialBonusActive ? (
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
      ) : (
        <ModalAlert
          setIsAllowed={setIsAllowed}
          isAllowed={(totalPurchaseActive === null || specialBonusActive === null)}
          setIsModalVisible={setIsModalVisible}
          message={t("Error")}
          description={
            !totalPurchaseActive && specialBonusActive
              ? t(
                  "This customer group is no total purchase Please select a different customer group or create total purchase for this customer group"
                )
              : !specialBonusActive && totalPurchaseActive
              ? t(
                  "This customer group is no special bonus Please select a different customer group or create special bonus for this customer group"
                )
              : t(
                  "This customer group is no total purchase and special bonus Please select a different customer group or create total purchase and special bonus for this customer group"
                )
          }
          resetMainForm={() => resetMainForm()}
          setIsAlert={setIsAlert}
          isAlert={isAlert}
          setTotalPurchaseActive={setTotalPurchaseActive}
          setSpecialBonusActive={setSpecialBonusActive}

        />
      )}
    </Modal>
  );
};

export default ModalRewardPoint;
