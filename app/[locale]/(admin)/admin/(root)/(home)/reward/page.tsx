"use client";
import dynamic from "next/dynamic";
import debounce from "lodash.debounce";
import {
  Button,
  Card,
  Divider,
  Empty,
  Form,
  InputNumber,
  Space,
  Tooltip,
} from "antd";
import { useTranslation } from "react-i18next";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  formatDate,
  formatDateRange,
  toastError,
  toastSuccess,
} from "@lib-utils/helper";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@components/Admin/Cartcontext";
import ShowAlbum from "@components/Admin/ShowAlbum";
const Loading = dynamic(() => import("@components/Loading"));

interface RewardDataType {
  id: number;
  name: string;
  point: number;
  startDate: string;
  endDate: string;
  image: string;
  file: string;
  date: string;
}

interface RewardUserDataType {
  id: number;
  createdAt: string;
  quantity: number;
  reward: {
    id: number;
    name: string;
    point: number;
    startDate: string;
    endDate: string;
    image: string;
    file: string;
    date: string;
  };
}
const Reward = () => {
  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  const locale = useCurrentLocale(i18nConfig);
  const { t } = useTranslation();
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const { data: session, status } = useSession();
  const [rewardData, setRewardData] = useState<RewardDataType[]>([]);
  const router = useRouter();
  const [rewardUserData, setRewardUserData] = useState<RewardUserDataType[]>(
    []
  );
  const [trigger, setTrigger] = useState(false);
  const pathname = usePathname();
  const [userPoint, setUserPoint] = useState(0);

  // Debounce function for search input
  const debouncedFetchData = useCallback(
    debounce(() => {
      fetchData();
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
  }, [debouncedFetchData]);

  const fetchRewardUserData = async () => {
    try {
      const { data } = await axios.get(`/api/rewardUser`, {
        params: {
          userId: session?.user.id,
          page: 1,
          pageSize: 50,
        },
      });
      const [userResponse] = await Promise.all([
        axios.get(`/api/users/${session?.user.id}`)
      ]);

      setUserPoint(userResponse.data.rewardPoint)
      
      if (data) {
        setRewardUserData(data.rewardUsers);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  async function fetchData() {
    setLoadPage(true);
    try {
      const [redeemResponse] = await Promise.all([
        axios.get(`/api/reward`)
      ]);

      const userRewardWithKeys = redeemResponse.data.map((reward: RewardDataType) => ({
        ...reward,
        date: formatDateRange(reward.startDate, reward.endDate),
      }));

      setRewardData(userRewardWithKeys);
    } catch (error: any) {
      toastError(error);
    } finally {
      setLoadPage(false);
    }
  }

  useEffect(() => {
    if (session?.user.id) {
      fetchRewardUserData();
    }
  }, [session, trigger]);

  const onSubmit = async (data: any, rewardId: any, point: number) => {
    const key = `amount_${rewardId}`;
    const amount = data[key];
    if (!amount) {
      toastError(t("Amount cannot be zero"));
      return;
    }
    if (userPoint < point * amount) {
      toastError(t("Your point not enough"));
      return;
    }

    if (session?.user.id) {
      try {
        const redeem = await axios.post(
          `/api/rewardUser`,
          {
            userId: session?.user.id,
            rewardId: rewardId,
            quantity: amount,
            isComplete: false,
            point: point * amount,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setTrigger((prev) => !prev);
        toastSuccess(t("Redeem successfully"));

        router.replace(`/${locale}/admin/reward`);
      } catch (error: any) {
        toastError(error.message);
      }
    } else {
      toastError(t("Please login before redeem"));
    }
  };

  const handleIncrement = (name: string) => {
    const currentValue = getValues(name) || 0;
    setValue(name, currentValue + 1);
  };

  const handleDecrement = (name: string) => {
    const currentValue = getValues(name) || 0;
    if (currentValue > 0) {
      setValue(name, currentValue - 1);
    }
  };
  if (loadPage || !t) {
    return <Loading />;
  }
  return (
    <div className="px-4">
      <div className="p-4 rounded-lg">
        <Divider orientation="left" style={{ borderColor: "#DD2C37" }}>
          <h1 className="text-3xl default-font">{t("my_travel_trip")} </h1>
        </Divider>
        <div className="default-font text-sm text-black font-medium">
          <p className="leading-5 pt-2 ">
            {t("your_point")}
            <span className=" bg-comp-red-hover p-1 rounded">
              <span className="text-black">
                {`${userPoint}`} {t("Point")}
              </span>
            </span>
          </p>
        </div>
        {rewardData.length > 0 ? (
          <div className="grid gap-x-8 gap-y-4 grid-cols-4 py-4 reward-card">
            {rewardData.map((reward, index) => (
              <Card
                title={false}
                bordered={false}
                style={{ width: '100%', boxShadow:'0px 4px 16px 0px rgba(0, 0, 0, 0.16)' }}
                key={index}
                className="rounded-lg"
                actions={[
                  <Tooltip
                    placement="top"
                    title={t("Download itinerary file")}
                    arrow={true}
                  >
                    <Link href={{ pathname: reward.file }} target="_blank">
                      <div className="flex justify-center text-sm dedault-font">
                        <p className="pr-2 text-comp-red default-font">
                          {t("Detail")}
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
                <div className="flex-shrink-0">
                  <Image
                    className="w-full rounded-lg py-1"
                    alt={reward.name}
                    width={200}
                    height={200}
                    src={reward.image}
                  />
                </div>
                <div className="flex justify-between pt-4">
                  <p className="text-base default-font font-semibold	">
                    {t("travel_trip")}
                  </p>
                  <p className="text-xl default-font text-comp-red">
                    {reward.point} {t("Point")}
                  </p>
                </div>
                <p className="text-sm default-font">{reward.name}</p>
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
                    {" "}
                    {reward.date}
                  </span>
                </div>
                <p className="default-font text-sm text-comp-natural-base pt-8 pb-4">
                  {t("Amount")}
                </p>
                <Form
                  key={reward.id}
                  name={`form_${reward.id}`}
                  onFinish={handleSubmit((data) =>
                    onSubmit(data, reward.id, reward.point)
                  )}
                  layout="inline"
                  className="reward-modal"
                >
                  <Space>
                    <Form.Item
                      name={`amount_${reward.id}`}
                      label={false}
                      required
                      tooltip={t("This is a required field")}
                      help={
                        errors[`amount_${reward.id}`] &&
                        t("Please enter reward point")
                      }
                      validateStatus={
                        errors[`amount_${reward.id}`] ? "error" : ""
                      }
                    >
                      <Controller
                        control={control}
                        name={`amount_${reward.id}`}
                        render={({ field }) => (
                          <div className="flex custom-input-number">
                            <InputNumber
                              {...field}
                              min={0}
                              step={1} // Set the step value to control increment/decrement
                              disabled={true} // Disable the input field
                              className="w-full"
                            />
                            <Button
                              className="bg-comp-disable-input border-none rounded-none minus-icon"
                              icon={
                                <MinusIcon className="w-4 text-comp-natural-base" />
                              }
                              onClick={() =>
                                handleDecrement(`amount_${reward.id}`)
                              }
                            />
                            <Button
                              className="bg-comp-disable-input border-none rounded-none plus-icon"
                              icon={<PlusIcon className="w-4 text-comp-red" />}
                              onClick={() =>
                                handleIncrement(`amount_${reward.id}`)
                              }
                            />
                          </div>
                        )}
                      />
                    </Form.Item>

                    <Form.Item className="flex justify-end">
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="bg-comp-red-reward button-backend default-font"
                      >
                        {t("Redeem")}
                      </Button>
                    </Form.Item>
                  </Space>
                </Form>
              </Card>
            ))}
          </div>
        ) : (
          <Empty className="py-12" />
        )}
        <Divider orientation="left" style={{ borderColor: "#DD2C37" }}>
          <h1 className="text-3xl default-font">{t("Reward Redemption")}</h1>
        </Divider>
        {rewardUserData.length > 0 ? (
          <div className="grid gap-x-8 gap-y-4 grid-cols-4 py-4 redeem-card">
            {rewardUserData.map((reward, index) => (
              <Card
                title={false}
                bordered={false}
                style={{ width: '100%', boxShadow:' 0px 4px 16px 0px rgba(0, 0, 0, 0.16)'
                }}
                key={index}
                className="rounded-lg"
                actions={[
                  <Tooltip
                    placement="top"
                    title={t("Download itinerary file")}
                    arrow={true}
                  >
                    <Link
                      href={{ pathname: reward.reward.file }}
                      target="_blank"
                    >
                      <div className="flex justify-center text-sm dedault-font">
                        <p className="pr-2 text-comp-natural-base default-font">
                          {t("Redeemed")}
                        </p>{" "}
                      </div>
                    </Link>
                  </Tooltip>,
                ]}
              >
                <div className="flex-shrink-0">
                  <Image
                    className="w-full rounded-lg py-1"
                    alt={reward?.reward.name}
                    width={200}
                    height={200}
                    src={reward.reward.image}
                  />
                </div>
                <div className="flex justify-between pt-4">
                  <p className="text-base default-font font-semibold	">
                    {t("travel_trip")}
                  </p>
                  <p className="text-xl default-font text-comp-red">
                    {reward.reward.point} {t("Point")}
                  </p>
                </div>
                <p className="text-sm default-font">{reward.reward.name}</p>
                <div className="flex justify-between pt-4">
                  <p className="text-base default-font font-semibold	">
                    {t("Amount")}
                  </p>
                  <p className="text-base default-font font-semibold">
                    {reward.quantity} {t("Ticket")}
                  </p>
                </div>
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
                    {" "}
                    {formatDate(reward.createdAt)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Empty className="py-12" />
        )}
      </div>
      <Divider/>
      <ShowAlbum/>
    </div>
  );
};

export default Reward;
