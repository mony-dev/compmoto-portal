import { zodResolver } from "@hookform/resolvers/zod";
import {
  rewardUserSchema,
  RewardUserSchema,
} from "@lib-schemas/user/reward-user-schema";
import {
  formatDate,
  formatDateRange,
  toastError,
  toastSuccess,
} from "@lib-utils/helper";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Switch,
  Tooltip,
  Image,
} from "antd";
import axios from "axios";
import { useCurrentLocale } from "next-i18n-router/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import tw from "twin.macro";
import i18nConfig from "../../../i18nConfig";

type Props = {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  setTriggerReward: (value: boolean) => void;
  rewardUserData?: any;
  triggerReward: boolean;
  mode: string;
  title: string;
  id: number;
};

interface RewardDataType {
  key: number;
  id: number;
  quantity: number;
  createdAt: string;
  isComplete: boolean;
  user: {
    custNo: string;
    id: number;
    contactName: string;
  };
  reward: {
    name: string;
    point: number;
    image: string;
    file: string;
    startDate: string;
    endDate: string;
  };
}

const Hr = styled.hr`
  ${tw`bg-comp-gray-line mx-24`}
`;
const ModalVerify = ({
  isModalVisible,
  setIsModalVisible,
  setTriggerReward,
  rewardUserData,
  triggerReward,
  title,
  id,
}: Props) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<RewardUserSchema>({
    resolver: zodResolver(rewardUserSchema),
  });
  const [trigger, setTrigger] = useState(false);
  const [verifyData, setVerifyData] = useState<RewardDataType | null>(null);
  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);

  useEffect(() => {
    const verify = rewardUserData.find(
      (item: { id: number }) => item.id === id
    );
    setVerifyData(verify);
    verify && setValue("isComplete", verify.isComplete);
  }, [rewardUserData, trigger, id]);

  const onSubmit: SubmitHandler<RewardUserSchema> = async (values) => {
    try {
      const response = await axios.put(`/api/rewardUser/${id}`, values, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setIsModalVisible(false);
      toastSuccess("Category updated successfully");
      router.replace(`/${locale}/admin/adminRewardOrder`);
    } catch (error: any) {
      toastError(error.message);
    }
    setTriggerReward(!triggerReward);
    setTrigger(!trigger);
  };

  return (
    <>
      <Modal
        title={title}
        open={isModalVisible}
        // onOk={false}
        onCancel={() => {
          setIsModalVisible(false);
          setTrigger(!trigger);
        }}
        footer={false}
      >
        <div className="flex w-full py-2">
          <label className="basis-3/12">รหัสลูกค้า</label>
          <Input
            value={verifyData?.user?.custNo || ""}
            name="custNo"
            disabled
          />
        </div>
        <div className="flex w-full pb-2">
          <label className="basis-3/12">ชื่อ</label>
          <Input
            name="name"
            value={verifyData?.user?.contactName || ""}
            disabled
          />
        </div>
        <div className="flex w-full pb-2">
          <label className="basis-3/12">รางวัลที่แลก</label>
          <Input
            name="reward"
            disabled
            value={verifyData?.reward?.name || ""}
          />
        </div>
        <div className="flex w-full pb-2">
          <label className="basis-3/12">คะแนนที่ใช้</label>
          <Input
            name="point"
            disabled
            value={verifyData?.reward?.point || ""}
            suffix={"คะแนน"}
          />
        </div>
        <div className="flex w-full">
          <label className="basis-3/12">วันที่แลก</label>
          <Input
            name="createdDate"
            disabled
            value={
              verifyData?.createdAt ? formatDate(verifyData?.createdAt) : ""
            }
          />
        </div>
        <hr className="my-6"></hr>
        <div className="flex justify-center">
          <Form
            form={form}
            name="vertical"
            onFinish={handleSubmit(onSubmit)}
            layout="inline"
            className="grow justify-between"
          >
            <Form.Item
              name="isComplete"
              label="สถานะ"
              className="switch-backend"
            >
              <Controller
                control={control}
                name="isComplete"
                render={({ field }) => (
                  <Switch
                    {...field}
                    checkedChildren="ตรวจสอบแล้ว"
                    unCheckedChildren="กำลังตรวจสอบ"
                    defaultChecked={false}
                    disabled={verifyData?.isComplete}
                  />
                )}
              />
            </Form.Item>
            {!verifyData?.isComplete && (
              <Form.Item className="flex justify-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-comp-red button-backend"
                >
                  Submit
                </Button>
              </Form.Item>
            )}
          </Form>
        </div>
        <div className="reward-card flex justify-center">
          <Card
            title={false}
            bordered={false}
            style={{ width: 300 }}
            className="rounded-lg"
            actions={[
              <Tooltip
                placement="top"
                title={"Download itinerary  file"}
                arrow={true}
              >
                <Link
                  href={{ pathname: verifyData?.reward.file }}
                  target="_blank"
                >
                  <div className="flex justify-center text-sm dedault-font">
                    <p className="pr-2 text-comp-red default-font">
                      รายละเอียด
                    </p>{" "}
                    <svg
                      className="self-center"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.66669 1.16699V2.91699"
                        stroke="#DD2C37"
                        strokeWidth="0.875"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.33331 1.16699V2.91699"
                        stroke="#DD2C37"
                        strokeWidth="0.875"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12.25 4.95866V9.91699C12.25 11.667 11.375 12.8337 9.33333 12.8337H4.66667C2.625 12.8337 1.75 11.667 1.75 9.91699V4.95866C1.75 3.20866 2.625 2.04199 4.66667 2.04199H9.33333C11.375 2.04199 12.25 3.20866 12.25 4.95866Z"
                        stroke="#DD2C37"
                        strokeWidth="0.875"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4.66669 6.41699H9.33335"
                        stroke="#DD2C37"
                        strokeWidth="0.875"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4.66669 9.33301H7.00002"
                        stroke="#DD2C37"
                        strokeWidth="0.875"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </Link>
              </Tooltip>,
            ]}
          >
            <div className="text-center">
              <Image
                className="w-full rounded-lg py-1"
                alt={verifyData?.reward.name}
                width={200}
                height={200}
                src={verifyData?.reward.image}
              />
            </div>
            <div className="flex justify-between pt-4">
              <p className="text-base default-font font-semibold	">
                {t("travel_trip")}
              </p>
              <p className="text-xl default-font text-comp-red">
                {verifyData?.reward.point} คะแนน
              </p>
            </div>
            <p className="text-sm default-font">{verifyData?.reward.name}</p>
            <div className="text-sm default-font leading-4 font-normal flex items-center pt-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.66669 3.35645C4.42752 3.35645 4.22919 3.15811 4.22919 2.91895V1.16895C4.22919 0.929779 4.42752 0.731445 4.66669 0.731445C4.90585 0.731445 5.10419 0.929779 5.10419 1.16895V2.91895C5.10419 3.15811 4.90585 3.35645 4.66669 3.35645Z"
                  fill="#7A8699"
                />
                <path
                  d="M9.33331 3.35645C9.09415 3.35645 8.89581 3.15811 8.89581 2.91895V1.16895C8.89581 0.929779 9.09415 0.731445 9.33331 0.731445C9.57248 0.731445 9.77081 0.929779 9.77081 1.16895V2.91895C9.77081 3.15811 9.57248 3.35645 9.33331 3.35645Z"
                  fill="#7A8699"
                />
                <path
                  d="M4.95839 8.45835C4.88256 8.45835 4.80673 8.44086 4.73673 8.41169C4.66089 8.38253 4.60256 8.34168 4.54423 8.28918C4.43923 8.17835 4.37506 8.03252 4.37506 7.87502C4.37506 7.79919 4.39256 7.72335 4.42173 7.65335C4.4509 7.58335 4.49173 7.51919 4.54423 7.46086C4.60256 7.40836 4.66089 7.36751 4.73673 7.33834C4.94673 7.25084 5.20923 7.29752 5.37256 7.46086C5.47756 7.57169 5.54173 7.72335 5.54173 7.87502C5.54173 7.91002 5.53589 7.95086 5.53006 7.99169C5.52423 8.02669 5.51256 8.06169 5.49506 8.09669C5.48339 8.13169 5.4659 8.16668 5.44256 8.20168C5.42506 8.23085 5.39589 8.26001 5.37256 8.28918C5.26173 8.39418 5.11006 8.45835 4.95839 8.45835Z"
                  fill="#7A8699"
                />
                <path
                  d="M7.00002 8.45997C6.92419 8.45997 6.84835 8.44248 6.77835 8.41331C6.70252 8.38414 6.64419 8.3433 6.58585 8.2908C6.48085 8.17996 6.41669 8.03413 6.41669 7.87663C6.41669 7.8008 6.43419 7.72497 6.46335 7.65497C6.49252 7.58497 6.53335 7.52081 6.58585 7.46247C6.64419 7.40997 6.70252 7.36913 6.77835 7.33996C6.98835 7.24663 7.25085 7.29914 7.41419 7.46247C7.51919 7.57331 7.58335 7.72497 7.58335 7.87663C7.58335 7.91163 7.57752 7.95248 7.57169 7.99331C7.56585 8.02831 7.55419 8.0633 7.53669 8.0983C7.52502 8.1333 7.50752 8.1683 7.48419 8.2033C7.46669 8.23247 7.43752 8.26163 7.41419 8.2908C7.30335 8.3958 7.15169 8.45997 7.00002 8.45997Z"
                  fill="#7A8699"
                />
                <path
                  d="M9.04165 8.45997C8.96581 8.45997 8.88998 8.44248 8.81998 8.41331C8.74415 8.38414 8.68581 8.3433 8.62748 8.2908C8.60415 8.26163 8.58081 8.23247 8.55748 8.2033C8.53415 8.1683 8.51665 8.1333 8.50498 8.0983C8.48748 8.0633 8.47581 8.02831 8.46998 7.99331C8.46415 7.95248 8.45831 7.91163 8.45831 7.87663C8.45831 7.72497 8.52248 7.57331 8.62748 7.46247C8.68581 7.40997 8.74415 7.36913 8.81998 7.33996C9.03581 7.24663 9.29248 7.29914 9.45581 7.46247C9.56081 7.57331 9.62498 7.72497 9.62498 7.87663C9.62498 7.91163 9.61915 7.95248 9.61331 7.99331C9.60748 8.02831 9.59581 8.0633 9.57831 8.0983C9.56665 8.1333 9.54915 8.1683 9.52581 8.2033C9.50831 8.23247 9.47915 8.26163 9.45581 8.2908C9.34498 8.3958 9.19331 8.45997 9.04165 8.45997Z"
                  fill="#7A8699"
                />
                <path
                  d="M4.95839 10.5012C4.88256 10.5012 4.80673 10.4837 4.73673 10.4545C4.66673 10.4253 4.60256 10.3845 4.54423 10.332C4.43923 10.2212 4.37506 10.0695 4.37506 9.91783C4.37506 9.842 4.39256 9.76616 4.42173 9.69616C4.4509 9.62033 4.49173 9.55617 4.54423 9.50367C4.76006 9.28784 5.15673 9.28784 5.37256 9.50367C5.47756 9.61451 5.54173 9.76617 5.54173 9.91783C5.54173 10.0695 5.47756 10.2212 5.37256 10.332C5.26173 10.437 5.11006 10.5012 4.95839 10.5012Z"
                  fill="#7A8699"
                />
                <path
                  d="M7.00002 10.5012C6.84835 10.5012 6.69669 10.437 6.58585 10.332C6.48085 10.2212 6.41669 10.0695 6.41669 9.91783C6.41669 9.842 6.43419 9.76616 6.46335 9.69616C6.49252 9.62033 6.53335 9.55617 6.58585 9.50367C6.80169 9.28784 7.19835 9.28784 7.41419 9.50367C7.46669 9.55617 7.50752 9.62033 7.53669 9.69616C7.56585 9.76616 7.58335 9.842 7.58335 9.91783C7.58335 10.0695 7.51919 10.2212 7.41419 10.332C7.30335 10.437 7.15169 10.5012 7.00002 10.5012Z"
                  fill="#7A8699"
                />
                <path
                  d="M9.04168 10.5002C8.89001 10.5002 8.73834 10.436 8.62751 10.331C8.57501 10.2785 8.53418 10.2144 8.50501 10.1385C8.47584 10.0685 8.45834 9.99269 8.45834 9.91686C8.45834 9.84103 8.47584 9.76519 8.50501 9.69519C8.53418 9.61936 8.57501 9.5552 8.62751 9.5027C8.76168 9.36853 8.96584 9.30435 9.15251 9.34519C9.19334 9.35102 9.22834 9.36269 9.26334 9.38019C9.29834 9.39185 9.33334 9.40937 9.36834 9.4327C9.39751 9.4502 9.42668 9.47937 9.45584 9.5027C9.56084 9.61353 9.62501 9.76519 9.62501 9.91686C9.62501 10.0685 9.56084 10.2202 9.45584 10.331C9.34501 10.436 9.19334 10.5002 9.04168 10.5002Z"
                  fill="#7A8699"
                />
                <path
                  d="M11.9583 5.73828H2.04167C1.80251 5.73828 1.60417 5.53995 1.60417 5.30078C1.60417 5.06161 1.80251 4.86328 2.04167 4.86328H11.9583C12.1975 4.86328 12.3958 5.06161 12.3958 5.30078C12.3958 5.53995 12.1975 5.73828 11.9583 5.73828Z"
                  fill="#7A8699"
                />
                <path
                  d="M9.33339 13.2731H4.66673C2.53756 13.2731 1.31256 12.0481 1.31256 9.91895V4.96061C1.31256 2.83145 2.53756 1.60645 4.66673 1.60645H9.33339C11.4626 1.60645 12.6876 2.83145 12.6876 4.96061V9.91895C12.6876 12.0481 11.4626 13.2731 9.33339 13.2731ZM4.66673 2.48145C2.99839 2.48145 2.18756 3.29228 2.18756 4.96061V9.91895C2.18756 11.5873 2.99839 12.3981 4.66673 12.3981H9.33339C11.0017 12.3981 11.8126 11.5873 11.8126 9.91895V4.96061C11.8126 3.29228 11.0017 2.48145 9.33339 2.48145H4.66673Z"
                  fill="#7A8699"
                />
              </svg>

              <span className="pl-2 text-xs text-comp-natural-base">
                {verifyData?.reward.startDate && verifyData?.reward.endDate
                  ? formatDateRange(
                      verifyData?.reward.startDate,
                      verifyData?.reward.endDate
                    )
                  : ""}
              </span>
            </div>
          </Card>
        </div>
      </Modal>
    </>
  );
};

export default ModalVerify;
