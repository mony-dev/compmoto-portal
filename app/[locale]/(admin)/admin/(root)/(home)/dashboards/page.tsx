"use client";
import { useCallback, useEffect, useState } from "react";
import { Image, Skeleton, Tag } from "antd";
import Star from "@public/images/star.png";
import "@fancyapps/ui/dist/carousel/carousel.css";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import Link from "next/link";
import { formatEndDate } from "@lib-utils/helper";
import ModalProfile from "@components/Admin/profile/ModalProfile";
import { useCart } from "@components/Admin/Cartcontext";
import debounce from "lodash.debounce";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Carousel as FancyCarousel } from "@fancyapps/ui";
import { User } from "@prisma/client";
import NewsCard from "@components/Admin/news/NewsCard";
const Loading = dynamic(() => import("@components/Loading"));
// const ManualList = dynamic(() => import("@components/ManualList"));

const TotalPurchase = dynamic(() => import("@components/TotalPurchase"));
const SpecialBonus = dynamic(() => import("@components/SpecialBonus"));
const Chart = dynamic(() => import("@components/Chart"));
const PromotionSlide = dynamic(() => import("@components/PromotionSlide"));
// const HalfPieChart = dynamic(() => import("@components/HalfPieChart"));

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
  interface RankDataType {
    rank: number | string;
  }
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
  const { setI18nName, loadPage, setLoadPage, profileImage, setProfileImage } =
    useCart();
  const [loadReward, setLoadReward] = useState(false);
  const [userData, setUserData] = useState<User>();
  const [loadNews, setLoadNews] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [newsData, setNewsData] = useState<DataType[]>([]);
  const [total, setTotal] = useState(0);
  const [rank, setRank] = useState(null);
  const [loadRank, setLoadRank] = useState(false);
  const [balance, setBalance] = useState(0);
  const [mini, setMini] = useState<any[]>([]);

  // Debounce function for search input
  const debouncedFetchData = useCallback(
    debounce(() => {
      setLoadPage(true);
      fetchData();
      fetchReward();
      fetchNews(currentPage, pageSize);
      fetchRank();
      setLoadPage(false);
      fetchMinisizeForSpecial();
    }, 500), // 500 ms debounce delay
    [currentPage, pageSize]
  );

  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);

    debouncedFetchData();

    return () => {
      debouncedFetchData.cancel();
    };
  }, [triggerProfile, debouncedFetchData]);

  async function fetchMinisizeForSpecial() {
    try {
      const { data } = await axios.get(`/api/getMinisizeSpecialBonus`);
      setMini(data.minisizes);
    } catch (error: any) {
    } 
  }

  async function fetchRank() {
    setLoadRank(true);
    try {
      const [ranking] = await Promise.all([
        axios.get(`/api/invoice/${session?.user.id}/ranking`)      
        .then((response) => {
          setRank(response.data.rank);
        })
      ]);
    } catch (error) {
      // console.error("Error fetching data: ", error);
    } 
  }

  async function fetchReward() {
    setLoadReward(true);
    axios
      .get(`/api/reward`)
      .then(async (response) => {
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
        await setRewardData(rewards);
        setLoadReward(false);
      })
      .catch((error) => {});
  }

  async function fetchNews(currentPage: number, pageSize: number) {
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
      // toastError(error);
    } finally {
      setLoadNews(false);
    }
  }

  // async function fetchNews() {
  //   setLoadNews(true);
  //   axios
  //     .get(`/api/news`)
  //     .then((response) => {
  //       const validLocale: "en" | "th" = locale === "th" ? "th" : "en";

  //       const rewards = response.data.map((reward: RewardDataType) => {
  //         return {
  //           id: reward.id,
  //           name: reward.name,
  //           point: reward.point,
  //           date: formatEndDate(reward.startDate, reward.endDate, validLocale),
  //           image: reward.image,
  //         };
  //       });
  //       setRewardData(rewards);
  //       setLoadReward(false);
  //     })
  //     .catch((error) => {});
  // }
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      document.getElementById("cardSlider")
    ) {
      new FancyCarousel(document.getElementById("cardSlider"), {
        Navigation: {
          prevTpl:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M15 3l-9 9 9 9"/></svg>',
          nextTpl:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M9 3l9 9-9 9"/></svg>',
        },
        infinite: false,
        center: false,
        slidesPerPage: "auto",
        transition: false,
        Dots: false,
      });
    }
  }, [rewardData]);

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
    if (session?.user.data.CreditLimitLCY && session?.user.data.BalanceDueLCY) {
      const credit = session?.user.data.CreditLimitLCY[0];
      const balance = session?.user.data.BalanceDueLCY[0];
      console.log("credit", credit)
      console.log("balance", balance)
      if (credit && balance) {
        const result = Number(credit) - Number(balance)
        console.log("result", result)
        result > 0 && setBalance(result);
      }
    }

    if (session?.user.latestUserLogCreatedAt) {
      const date = new Date(session?.user.latestUserLogCreatedAt);

      const day = date.getDate();
      const month = date.getMonth() + 1; // Months are zero-based in JS
      const year = date.getFullYear();

      const hours = date.getHours();
      const minutes = date.getMinutes();
      const formattedDate = `${day}/${month}/${year}, ${hours}:${minutes}`;
      setLastedLogin(formattedDate);
    }

    try {
      const [userResponse] = await Promise.all([
        axios.get(`/api/users/${session?.user.id}`),
      ]);
      setUserData(userResponse.data);
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

  if (loadPage || !t || !session) {
    return <Loading />;
  }
  return (
    <>
      <div className="px-4 grid grid-cols-6 gap-4">
        <div
          className="col-span-6 rounded-lg bg-white mt-2 mx-auto w-full"
          style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
        >
          <div className=" grid grid-cols-6">
            <div className="col-span-2 mx-auto w-full">
              <div className="flex justify-between gap-4 items-center px-8 border-r-2 border-[#E4E7EB] border-dashed mr-4 py-2">
                <div className="group-hover:blur-xs overflow-hidden pt-4 pb-2 profile-img">
                  <Image
                    className="transition duration-300 ease-in-out rounded-full border border-[#DD2C37]"
                    alt="User profile"
                    width={100}
                    height={100}
                    src={profileImage ? profileImage : "error"}
                    onClick={showModal(true, session?.user.id)}
                    fallback="data:image/png;base64,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"
                    preview={{
                      visible: false, // Show preview based on index

                      mask: (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6 rounded-full"
                            onClick={showModal(true, session?.user.id)}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                            />
                          </svg>
                        </>
                      ),
                    }}
                  />
                </div>
                <div>
                  <p className="mb-0 text-base text-black">
                    {session?.user.name}{" "}
                  </p>
                  <p className="mb-0 text-base text-black">
                    {t('Ranking total')} : <Tag bordered={false} color="gold">
                      <span className="text-base default-font">{t("Ranking No")} {rank}</span>
                    </Tag>
                  </p>
                  <p className="mb-0 text-base text-black">
                    Credit Limited : {balance}
                  </p>
                  <p className="mb-0 text-base text-[#7A8699]">
                    {" "}
                    {t("Your point")}{" "}
                    <Tag color="#F4B9BC">
                      <div className="text-black text-base">
                        {`${rewardPoint}`} {t("point")}
                      </div>
                    </Tag>
                  </p>
                  <p className="mb-0 text-base text-[#7A8699]">
                    {" "}
                    {t("lastest_login")} : {lastedLogin}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="col-span-3 mx-auto w-full py-2">
                <div className="col-span-3 rounded mx-auto w-full py-1 flex items-center gap-4">
                  <h1 className="text-xl font-semibold	default-font">
                    {t("Reward")}
                  </h1>
                </div>
                {rewardData.length >= 5 ?  <div
                  id="cardSlider"
                  className="f-carousel pt-2"
                >
                  <div className="f-carousel__viewport">
                    {Array.from(
                       { length: Math.max(10, rewardData.length) },
                      // { length: rewardData.length > 5 ? Math.max(10, rewardData.length) : rewardData.length},
                      (_, index) => rewardData[index % rewardData.length]
                    ).map((reward, index) => (
                      <figure
                        key={index}
                        className="f-carousel__slide py-4 rounded-2xl border hover:border-comp-red flex justify-start items-center bg-white hover:bg-comp-red-hover"
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
                                  className="w-full rounded-full py-1"
                                  alt={reward.name}
                                  width={60}
                                  height={"100%"}
                                  src={reward.image}
                                />
                              </div>
                              <Link
                                className="pl-4 1xl:pl-1"
                                href={`/${locale}/admin/reward`}
                              >
                                <p className="text-comp-red leading-4 default-font text-sm">
                                  {reward.name}
                                </p>
                                <p className="text-sm default-font font-semibold text-comp-red">
                                  {reward.point}
                                  <span className="text-comp-red leading-4 font-normal pl-2">
                                    {t("Point")}
                                  </span>
                                </p>
                                {/* <div className="text-comp-red leading-4 font-normal flex items-center">
                                <span className="text-xs">{reward.date}</span>
                              </div> */}
                              </Link>
                            </>
                          )
                        )}
                      </figure>
                    ))}
                  </div>
                </div> : rewardData.length >= 1 && rewardData.length < 5 ? <><div
                    id="cardSlider"
                    className="f-carousel pt-2"
                  >
                    <div className="f-carousel__viewport">
                      {Array.from(
                        { length: rewardData.length },
                        // { length: rewardData.length > 5 ? Math.max(10, rewardData.length) : rewardData.length},
                        (_, index) => rewardData[index % rewardData.length]
                      ).map((reward, index) => (
                        <figure
                          key={index}
                          className="f-carousel__slide py-4 rounded-2xl border hover:border-comp-red flex justify-start items-center bg-white hover:bg-comp-red-hover"
                        >
                          {loadReward ? (
                            <>
                              <div className="flex items-center">
                                <Skeleton.Avatar
                                  active={loadReward}
                                  size="large"
                                  shape="circle" />
                                <div>
                                  <Skeleton.Input
                                    active={loadReward}
                                    size="small" />
                                  <Skeleton.Input
                                    active={loadReward}
                                    size="small" />
                                  <Skeleton.Input
                                    active={loadReward}
                                    size="small" />
                                </div>
                              </div>
                            </>
                          ) : (
                            reward && (
                              <>
                                <div className="flex">
                                  <Image
                                    className="w-full rounded-full py-1"
                                    alt={reward.name}
                                    width={60}
                                    height={"100%"}
                                    src={reward.image} />
                                </div>
                                <Link
                                  className="pl-4 1xl:pl-1"
                                  href={`/${locale}/admin/reward`}
                                >
                                  <p className="text-comp-red leading-4 default-font text-sm">
                                    {reward.name}
                                  </p>
                                  <p className="text-sm default-font font-semibold text-comp-red">
                                    {reward.point}
                                    <span className="text-comp-red leading-4 font-normal pl-2">
                                      {t("Point")}
                                    </span>
                                  </p>
                                  {/* <div className="text-comp-red leading-4 font-normal flex items-center">
                        <span className="text-xs">{reward.date}</span>
                      </div> */}
                                </Link>
                              </>
                            )
                          )}
                        </figure>
                      ))}
                    </div>
                  </div></> : ''}

               
              </div>
            </div>
          </div>

          {/* <div
            className="col-span-3 rounded-lg bg-white mt-2 mx-auto w-full"
            style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
          >
            <div>
              <ManualList type="news" />
            </div>
          </div> */}
        </div>
        <div
          className="mt-4 p-4 col-span-6 rounded-lg bg-white"
          style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
        >
          <TotalPurchase userId={session?.user?.id} />
        </div>
        <div
          className="mt-4 p-4 col-span-4 rounded-lg bg-white"
          style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
        >
          <SpecialBonus userId={session?.user?.id} mini={mini}/>
        </div>
        <div
          className="mt-4 p-4 col-span-2 rounded-lg bg-white"
          style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
        >
          <PromotionSlide custPriceGroup={session?.user?.custPriceGroup} />
        </div>
        <div className="mt-4 py-4 col-span-6 rounded-lg">
          <Chart userId={session?.user?.id} />
        </div>
        {loadNews ? (
          <div className="mt-4 py-4 col-span-6 rounded-lg text-center">
            <Loading />
          </div>
        ) : (
          <div className="mt-4 py-4 col-span-6 rounded-lg">
            <div
              className="mt-4 pb-4 rounded-lg bg-white col-span-2 p-4"
              style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
            >
              <h5 className="text-black default-font text-xl font-black pb-4">
                {t("News")}
              </h5>
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
        )}
      </div>
      <ModalProfile
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        setTriggerProfile={setTriggerProfile}
        triggerProfile={triggerProfile}
        title={title}
        user={userData}
      />
    </>
  );
};

export default Dashboard;
