"use client";
import { useCallback, useEffect, useState } from "react";
import { Image, Skeleton } from "antd";
import Star from "@public/images/star.png";
import "@fancyapps/ui/dist/carousel/carousel.css";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import Link from "next/link";
import { formatEndDate, toastError } from "@lib-utils/helper";
import ModalProfile from "@components/Admin/profile/ModalProfile";
import { useCart } from "@components/Admin/Cartcontext";
import debounce from "lodash.debounce";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import NewsCard from "@components/Admin/news/NewsCard";
interface DataType {
  id: number;
  key: number;
  name: string;
  minisize: {
    id: number;
    name: string;
  };
  isActive: boolean;
  coverImg: string;
  content: string;
  createdAt: string;
}
const TotalPurchase = dynamic(() => import("@components/TotalPurchase"));
const SpecialBonus = dynamic(() => import("@components/SpecialBonus"));
const Chart = dynamic(() => import("@components/Chart"));
const PromotionSlide = dynamic(() => import("@components/PromotionSlide"));

const Carousel =
  typeof window !== "undefined" ? require("@fancyapps/ui").Carousel : null;

const Dashboard = () => {
  const locale = useCurrentLocale(i18nConfig);
  const { t } = useTranslation();
  const pathname = usePathname();
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
  const { data: session, status } = useSession();
  const [starLevel, setStarLevel] = useState(0);
  const [payment, setPayment] = useState("");
  const [rewardPoint, setRewardPoint] = useState(0);
  const [lastedLogin, setLastedLogin] = useState("");
  const [rewardData, setRewardData] = useState<RewardDataType[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [title, setTitle] = useState("แก้ไขรูปโปรไฟล์");
  const [triggerProfile, setTriggerProfile] = useState(false);
  // const [profileImage, setProfileImage] = useState("");
  const { setI18nName, setLoadPage, profileImage, setProfileImage } = useCart();
  const [loadReward, setLoadReward] = useState(false);
  const [loadNews, setLoadNews] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
const [newsData, setNewsData] = useState<DataType[]>([]);

  // Debounce function for search input
  const debouncedFetchData = useCallback(
    debounce(() => {
      fetchData();
      fetchReward();
      fetchNews();
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
  }, [session, triggerProfile]);

  async function fetchNews() {
    setLoadNews(true);
    try {
      const { data } = await axios.get(`/api/adminNews`, {
        params: {
          page: currentPage,
          pageSize: pageSize,
          isActive: true,
        },
      });

      const newsDataWithKeys = await Promise.all(
        data.news.map(async (news: DataType, index: number) => {
          return {
            ...news,
            key: index + 1 + (currentPage - 1) * pageSize,
          };
        })
      );

      setNewsData(newsDataWithKeys);
      setTotal(data.total);
    } catch (error: any) {
      toastError(error);
    } finally {
      setLoadNews(false);
    }
  }
  
  async function fetchReward() {
    setLoadReward(true);
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
        const validLocale: "en" | "th" = locale === "th" ? "th" : "en";

        const rewards = response.data.map((reward: RewardDataType) => {
          return {
            id: reward.id,
            name: reward.name,
            point: reward.point,
            date: formatEndDate(reward.startDate, reward.endDate, validLocale),
            image: reward.image,
          };
        });
        setRewardData(rewards);
        setLoadReward(false);
      })
      .catch((error) => {
        // console.error("Error fetching data: ", error);
      });
  }

  async function fetchData() {
    setLoadPage(true);
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

    try {
      const [userResponse] = await Promise.all([
        axios.get(`/api/users/${session?.user.id}`),
      ]);

      setProfileImage(userResponse.data.image);
    } catch (error) {
      // console.error("Error fetching data: ", error);
    } finally {
      setLoadPage(false);
    }
  }

  function showModal(isShow: boolean, idCate: number) {
    return () => {
      setIsModalVisible(isShow);
    };
  }
  return (
    <>
      <div className="px-4">
        <div
          className="p-4 rounded-lg flex bg-white"
          style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
        >
          <div className="flex justify-around border-r-2 border-dashed border-comp-line-gray items-center w-2/6 relative group">
            <div className="relative w-fit group-hover:blur-xs overflow-hidden rounded-full">
              <Image
                className="transition duration-300 ease-in-out"
                alt="User profile"
                width={150}
                height={150}
                src={profileImage ? profileImage : "error"}
                fallback="data:image/png;base64,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"
              />

              <div
                className="absolute rounded-lg inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-semibold cursor-pointer opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out"
                onClick={showModal(true, session?.user.id)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <p className="default-font text-base leading-5 text-black">
                {session?.user.name}
              </p>
              <div className="flex space-x-2 pt-2">
                {[...Array(starLevel)].map((_, index) => (
                  <Image width={20} height={20} src={Star.src} alt="star" />
                ))}
              </div>
              <p className="default-font text-base leading-5 pt-2 text-comp-natural-base">
                {t("lastest_login")} {lastedLogin}
              </p>
              <p className="default-font text-base leading-5 pt-2 text-comp-natural-base">
                {t("Your point")}
                <span className=" bg-comp-red-hover p-1 rounded">
                  <span className="text-black">
                    {`${rewardPoint}`} {t("Point")}
                  </span>{" "}
                  |{" "}
                  <Link
                    className="text-comp-red font-semibold"
                    href={`/${locale}/admin/reward`}
                  >
                    {t("claim a reward")}
                  </Link>
                </span>
              </p>
            </div>
          </div>
          <div className="ml-4">
            <p className="default-font font-black text-xl text-black leading-7">
              {t("Reward")}
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
                      {loadReward ? (
                        <>
                          <div className="flex items-center">
                            <Skeleton.Avatar
                              active={loadReward}
                              size="large"
                              shape="circle"
                            />
                            <div>
                              <Skeleton.Input
                                active={loadReward}
                                size="small"
                              />
                              <Skeleton.Input
                                active={loadReward}
                                size="small"
                              />
                              <Skeleton.Input
                                active={loadReward}
                                size="small"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        reward && (
                          <>
                            <div className="flex">
                              <Image
                                className="w-full rounded-lg py-1"
                                alt={reward.name}
                                width={60}
                                height={"100%"}
                                src={reward.image}
                              />
                            </div>
                            <Link
                              className="pl-4"
                              href={`/${locale}/admin/reward`}
                            >
                              <p className="text-comp-red leading-4 default-font">
                                {reward.name}
                              </p>
                              <p className="text-base default-font font-semibold text-comp-red">
                                {reward.point}
                                <span className="text-comp-red leading-4 font-normal pl-2">
                                  {t("Point")}
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

                                <span className="pl-2 text-xs">
                                  {reward.date}
                                </span>
                              </div>
                            </Link>
                            <div className="cuts">
                              <div className="cut"></div>
                              <div className="cut"></div>
                              <div className="cut"></div>
                              <div className="cut"></div>
                              <div className="cut"></div>
                            </div>
                          </>
                        )
                      )}
                    </figure>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="mt-4 p-4 rounded-lg bg-white "
          style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
        >
          <TotalPurchase userId={session?.user?.id} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div
            className="mt-4 p-4 rounded-lg bg-white col-span-2"
            style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
          >
            <SpecialBonus userId={session?.user?.id} />
          </div>
          <div
            className="mt-4 p-4 rounded-lg bg-white "
            style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
          >
            <PromotionSlide custPriceGroup={session?.user?.custPriceGroup} />
          </div>
        </div>
       
        <Chart userId={session?.user?.id}/>
        <div
            className="mt-4 p-4 rounded-lg bg-white col-span-2"
            style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
          >
            <NewsCard
            newsData={newsData}
            total={total}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
            setPageSize={setPageSize}
            pageSize={pageSize}
          />
            </div>
        
      </div>
      <ModalProfile
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        setTriggerProfile={setTriggerProfile}
        triggerProfile={triggerProfile}
        title={title}
      />
    </>
  );
};

export default Dashboard;
