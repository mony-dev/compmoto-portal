"use client";
import { useEffect, useState } from "react";
import IconFooter from "@components/Admin/IconFooter";
import Image from "next/image";
import AccountMock from "@public/images/logo/account-mock.png";
import Star from "@public/images/star.png";
import "@fancyapps/ui/dist/carousel/carousel.css";
import Total from "@public/images/logo/total-order.png";
import BonusPoint from "@public/images/logo/bonus-point.png";
import Chart from "@public/images/logo/chart.png";
import News from "@public/images/logo/news.png";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import Link from "next/link";
import { formatDateRange } from "@lib-utils/helper";
const Carousel =
  typeof window !== "undefined" ? require("@fancyapps/ui").Carousel : null;

const Dashboard = () => {
  const locale = useCurrentLocale(i18nConfig);
  const { t } = useTranslation();
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

  const [starLevel, setStarLevel] = useState(0);
  const [payment, setPayment] = useState("");
  const [rewardPoint, setRewardPoint] = useState(0);
  const [lastedLogin, setLastedLogin] = useState("");
  const [rewardData, setRewardData] = useState<RewardDataType[]>([]);


  const { data: session, status } = useSession();
  useEffect(() => {
    if (Carousel) {
      new Carousel(document.getElementById("cardSlider"), {
        Navigation: {
          prevTpl:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M15 3l-9 9 9 9"/></svg>',
          nextTpl:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M9 3l9 9-9 9"/></svg>',
        },
        infinite: true,
        center: false,
        slidesPerPage: "auto",
        transition: false,
        Dots: false,
      });
    }

    axios
      .get(`/api/reward`)
      .then((response) => {
        const rewards = response.data.map((reward: RewardDataType) => {
          console.log(reward.startDate);
          return {
            id: reward.id,
            name: reward.name,
            point: reward.point,
            date: formatDateRange(reward.startDate, reward.endDate),
            image: reward.image,
          };
        });
        setRewardData(rewards);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  useEffect(() => {
    if (session?.user?.data?.CustPriceGroup) {
      if (session?.user.data.CustPriceGroup.includes("3STARS")) {
        setStarLevel(3);
      } else if (session?.user.data.CustPriceGroup.includes("5STARS")) {
        setStarLevel(5);
      } else if (session?.user.data.CustPriceGroup.includes("7STARS")) {
        setStarLevel(7);
      }
    }

    if (session?.user?.data?.PaymentTerms) {
      const number = session?.user?.data?.PaymentTerms[0];
      if (number) {
        let paymentTerm = number.match(/\d+/);
        paymentTerm && setPayment(paymentTerm[0]);
      }
    }

    if (session?.user?.data?.RewardPoint) {
      const reward = session?.user?.rewardPoint;
      if (reward) {
        setRewardPoint(reward);
      }
    }

    if (session?.user.latestUserLogCreatedAt) {
      const date = new Date(session?.user.latestUserLogCreatedAt);

      const day = date.getDate();
      const month = date.getMonth() + 1; // Months are zero-based in JS
      const year = date.getFullYear();

      const hours = date.getHours();
      const minutes = date.getMinutes();
      const formattedDate = `${day}/${month}/${year}, ${hours}.${minutes}`;
      setLastedLogin(formattedDate);
    }
  }, [session]);
  return (
    <div className="px-12">
      <div
        className="p-4 rounded-lg flex bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex border-r-2 border-dashed border-comp-line-gray items-center w-2/6">
          <Image
            className="rounded-lg w-fit	h-4/5"
            alt="logo"
            width={150}
            height={30}
            src={AccountMock.src}
          />
          <div className="ml-16 mr-4">
            <p className="default-font text-base leading-5 text-black">
              {session?.user.name}
            </p>
            <div className="flex space-x-2 pt-2">
              {[...Array(starLevel)].map((_, index) => (
                <Image
                  key={index}
                  width={20}
                  height={20}
                  src={Star.src}
                  alt="star"
                />
              ))}
            </div>
            <p className="default-font text-base leading-5 pt-2 text-comp-natural-base">
              ​ {t("lastest_login")} {lastedLogin}
            </p>
            <p className="default-font text-base leading-5 pt-2 text-comp-natural-base">
              คะแนนของคุณ{" "}
              <span className=" bg-comp-red-hover p-1 rounded">
                <span className="text-black">{`${rewardPoint}`} คะแนน</span> |{" "}
                <Link className="text-comp-red font-semibold" href={`/${locale}/admin/reward`}>แลกคะแนน</Link>
              </span>
              ​
            </p>
          </div>
        </div>
        <div className="ml-4">
          <p className="default-font font-medium text-xl text-black leading-7">
            รางวัล
          </p>
          <div className="max-w-5xl mx-auto">
            <div id="cardSlider" className="f-carousel pt-4">
              <div className="f-carousel__viewport px-12">
                {Array.from(
                  { length: Math.max(10, rewardData.length) },
                  (_, index) => rewardData[index % rewardData.length]
                ).map((reward, index) => (
                  <figure
                    key={index}
                    className="f-carousel__slide rounded-md border border-comp-red flex justify-start items-center bg-comp-red-hover"
                  >
                    {reward && (
                      <>
                        <div className="flex-shrink-0">
                          <Image
                            className="w-full rounded-lg py-1"
                            alt={reward.name}
                            width={50}
                            height={50}
                            src={reward.image}
                          />
                        </div>
                        <div className="pl-4">
                          <p className="text-comp-red leading-4 default-font">
                            {reward.name}
                          </p>
                          <p className="text-base default-font font-semibold text-comp-red">
                            {reward.point}
                            <span className="text-comp-red leading-4 font-normal pl-2">
                              คะแนน
                            </span>
                          </p>
                          <div className="text-comp-red leading-4 font-normal flex items-center">
                            <svg
                              width="14"
                              height="15"
                              viewBox="0 0 14 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M4.66669 1.66663V3.41663"
                                stroke="#DD2C37"
                                strokeWidth="0.875"
                                strokeMiterlimit="10"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M9.33331 1.66663V3.41663"
                                stroke="#DD2C37"
                                strokeWidth="0.875"
                                strokeMiterlimit="10"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M2.04169 5.80249H11.9584"
                                stroke="#DD2C37"
                                strokeWidth="0.875"
                                strokeMiterlimit="10"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12.25 5.45829V10.4166C12.25 12.1666 11.375 13.3333 9.33333 13.3333H4.66667C2.625 13.3333 1.75 12.1666 1.75 10.4166V5.45829C1.75 3.70829 2.625 2.54163 4.66667 2.54163H9.33333C11.375 2.54163 12.25 3.70829 12.25 5.45829Z"
                                stroke="#DD2C37"
                                strokeWidth="0.875"
                                strokeMiterlimit="10"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M9.15522 8.4915H9.16046"
                                stroke="#DD2C37"
                                strokeWidth="1.16667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M9.15522 10.2415H9.16046"
                                stroke="#DD2C37"
                                strokeWidth="1.16667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M6.99739 8.4915H7.00263"
                                stroke="#DD2C37"
                                strokeWidth="1.16667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M6.99739 10.2415H7.00263"
                                stroke="#DD2C37"
                                strokeWidth="1.16667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M4.83833 8.4915H4.84357"
                                stroke="#DD2C37"
                                strokeWidth="1.16667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M4.83833 10.2415H4.84357"
                                stroke="#DD2C37"
                                strokeWidth="1.16667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>

                            <span className="pl-2 text-xs"> {reward.date}</span>
                          </div>
                        </div>
                        <div className="cuts">
                          <div className="cut"></div>
                          <div className="cut"></div>
                          <div className="cut"></div>
                          <div className="cut"></div>
                          <div className="cut"></div>
                        </div>
                      </>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="mt-4 p-4 rounded-lg flex bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <IconFooter width={2000} height={600} src={Total.src} alt="logo" />
      </div>
      <div
        className="mt-4 p-4 rounded-lg flex bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        {/* <p className='default-font font-medium text-xl text-black leading-7'>ยอดสั่งซื้อรวม</p> */}
        <IconFooter width={2000} height={600} src={BonusPoint.src} alt="logo" />
      </div>
      <div
        className="mt-4 p-4 rounded-lg flex bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <IconFooter width={2000} height={600} src={Chart.src} alt="logo" />
      </div>
      <div
        className="mt-4 p-4 rounded-lg flex bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <IconFooter width={2000} height={600} src={News.src} alt="logo" />
      </div>
    </div>
  );
};

export default Dashboard;
