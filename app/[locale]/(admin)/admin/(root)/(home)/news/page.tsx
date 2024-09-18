"use client";

import { useTranslation } from "react-i18next";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toastError } from "@lib-utils/helper";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname } from "next/navigation";
import NoImage from "@public/images/no_image_rectangle.png";
import { BLACK_BG_COLOR } from "@components/Colors";
import { useCart } from "@components/Admin/Cartcontext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";
import dynamic from "next/dynamic";
const Loading = dynamic(() => import("@components/Loading"));
const NewsCard = dynamic(() => import("@components/Admin/news/NewsCard"));

interface MinisizeDataType {
  id: number;
  imageProfile: string;
  newsBanner: string;
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
const News = () => {
  const {
    formState: { errors },
  } = useForm();
  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);
  const { data: session, status } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [minisizeData, setMinisizeData] = useState<MinisizeDataType | null>(
    null
  );
  const [brandName, setBrandName] = useState("");
  const { setI18nName } = useCart();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [newsData, setNewsData] = useState<DataType[]>([]);
  const [loadingBaner, setLoadingBanner] = useState(false);

  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);
    const query = new URLSearchParams(window.location.search);
    const name = query.get("name");
    if (name) {
      setBrandName(name);
      fetchMinisizeData(name);
      //fetchPromotion(name);
    }
  }, [session]);

  const isActive = pathname.includes("admin/news");

  const fetchMinisizeData = async (name: string) => {
    try {
      setLoadingBanner(true);
      const response = await axios.get(`/api/adminMinisize?q=${name}`);
      if (response.data) {
        const minisize = response.data.minisizes.map(
          (data: MinisizeDataType) => ({
            id: data.id,
            imageProfile: data.imageProfile,
            newsBanner: data.newsBanner,
          })
        );
        minisize[0] && setMinisizeData(minisize[0]);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoadingBanner(false);
    }
  };
  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [currentPage, pageSize]);

  async function fetchData(currentPage: number, pageSize: number) {
    setLoading(true);
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
      setLoading(false);
    }
  }
  if (loadingBaner || loading) {
    return <Loading />;
  }

  return (
    <div className="px-4">
      <div className="mx-4 pb rounded-lg">
        <div
          className="pb-2"
          style={{
            background: `linear-gradient(90deg, #DD2C37 0%, #FCD00D 100%)`,
          }}
        >
          <Image
            className="w-full"
            alt="media"
            width={1000}
            height={1000}
            src={
              minisizeData
                ? minisizeData.newsBanner
                  ? minisizeData.newsBanner
                  : NoImage.src
                : NoImage.src
            }
          />
        </div>
        <nav
          className="flex justify-between flex default-font text-white text-sm nav-product"
          style={{
            background: `linear-gradient(90deg, ${BLACK_BG_COLOR} 0%, rgba(27, 27, 27, 0.9) 100%)`,
            boxShadow: "0px 4px 4px 0px #00000040",
          }}
        >
          <div className="flex gap-2 items-center  default-font">
            <Link
              className="hover:text-white text-white hover:bg-comp-red h-full"
              href={`/${locale}/admin/product?name=${brandName}`}
            >
              <div className="cursor-pointer h-full flex items-center px-4">
                {t("Product")}
              </div>
            </Link>

            <Link
              className={`cursor-pointer hover:bg-comp-red h-full flex items-center px-4 text-white ${
                isActive ? "bg-comp-red" : ""
              }`}
              href={`/${locale}/admin/news?name=${brandName}`}
            >
              {t("News and events")}
            </Link>
            <Link
              className="hover:text-white text-white hover:bg-comp-red h-full"
              href={`/${locale}/admin/media?name=${brandName}`}
            >
              <div className="cursor-pointer h-full flex items-center px-4">
                {t("Marketing")}
              </div>
            </Link>
          </div>
          <div>
            <Image
              className=""
              alt="minisize"
              width={176}
              height={176}
              src={
                minisizeData
                  ? minisizeData.imageProfile
                    ? minisizeData.imageProfile
                    : NoImage.src
                  : NoImage.src
              }
            />
          </div>
        </nav>
        <div className="flex py-8 items-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.6775 19.957C12.9523 20.0209 12.9775 20.3807 12.7099 20.4699L11.1299 20.9899C7.15985 22.2699 5.06985 21.1999 3.77985 17.2299L2.49985 13.2799C1.21985 9.30992 2.27985 7.20992 6.24985 5.92992L6.77385 5.75639C7.17671 5.62297 7.56878 6.02703 7.45438 6.43571C7.39768 6.63828 7.34314 6.84968 7.28985 7.06992L6.30985 11.2599C5.20985 15.9699 6.81985 18.5699 11.5299 19.6899L12.6775 19.957Z"
              fill="#292D32"
            />
            <path
              d="M17.1702 3.21001L15.5002 2.82001C12.1602 2.03001 10.1702 2.68001 9.00018 5.10001C8.70018 5.71001 8.46018 6.45001 8.26018 7.30001L7.28018 11.49C6.30018 15.67 7.59018 17.73 11.7602 18.72L13.4402 19.12C14.0202 19.26 14.5602 19.35 15.0602 19.39C18.1802 19.69 19.8402 18.23 20.6802 14.62L21.6602 10.44C22.6402 6.26001 21.3602 4.19001 17.1702 3.21001ZM15.2902 13.33C15.2002 13.67 14.9002 13.89 14.5602 13.89C14.5002 13.89 14.4402 13.88 14.3702 13.87L11.4602 13.13C11.0602 13.03 10.8202 12.62 10.9202 12.22C11.0202 11.82 11.4302 11.58 11.8302 11.68L14.7402 12.42C15.1502 12.52 15.3902 12.93 15.2902 13.33ZM18.2202 9.95001C18.1302 10.29 17.8302 10.51 17.4902 10.51C17.4302 10.51 17.3702 10.5 17.3002 10.49L12.4502 9.26001C12.0502 9.16001 11.8102 8.75001 11.9102 8.35001C12.0102 7.95001 12.4202 7.71001 12.8202 7.81001L17.6702 9.04001C18.0802 9.13001 18.3202 9.54001 18.2202 9.95001Z"
              fill="#292D32"
            />
          </svg>

          {locale === "en" ? (
            <svg
              className="my-2"
              width="194"
              height="18"
              viewBox="0 0 194 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.0700001 17V0.899999H2.692L11.317 12.032V0.899999H14.1V17H11.731L2.853 5.546V17H0.0700001ZM23.4849 17.276C19.9659 17.276 17.2519 14.723 17.2519 10.974V10.928C17.2519 7.455 19.7129 4.603 23.1859 4.603C27.0499 4.603 29.0049 7.639 29.0049 11.135C29.0049 11.388 28.9819 11.641 28.9589 11.917H20.0349C20.3339 13.895 21.7369 14.999 23.5309 14.999C24.8879 14.999 25.8539 14.493 26.8199 13.55L28.4529 14.999C27.3029 16.379 25.7159 17.276 23.4849 17.276ZM20.0119 10.077H26.2449C26.0609 8.283 25.0029 6.88 23.1629 6.88C21.4609 6.88 20.2649 8.191 20.0119 10.077ZM34.1368 17.092L30.2038 4.856H33.0558L35.4938 13.182L38.1848 4.81H40.5538L43.2678 13.182L45.7518 4.856H48.5348L44.5558 17.092H42.0718L39.3578 8.789L36.6208 17.092H34.1368ZM54.8524 17.23C53.1274 17.23 51.2184 16.609 49.7004 15.413L50.9424 13.527C52.2534 14.516 53.6794 15.022 54.9214 15.022C56.1174 15.022 56.8074 14.516 56.8074 13.711V13.665C56.8074 12.722 55.5194 12.4 54.0934 11.963C52.2994 11.457 50.2984 10.721 50.2984 8.398V8.352C50.2984 6.052 52.2074 4.649 54.6224 4.649C56.1404 4.649 57.7964 5.178 59.0844 6.029L57.9804 8.007C56.8074 7.294 55.5654 6.857 54.5534 6.857C53.4724 6.857 52.8514 7.363 52.8514 8.076V8.122C52.8514 8.996 54.1624 9.364 55.5884 9.824C57.3594 10.376 59.3604 11.181 59.3604 13.366V13.412C59.3604 15.965 57.3824 17.23 54.8524 17.23ZM79.2739 17H76.5139V15.505C75.6859 16.494 74.4209 17.253 72.5809 17.253C70.2809 17.253 68.2569 15.942 68.2569 13.504V13.458C68.2569 10.767 70.3499 9.479 73.1789 9.479C74.6509 9.479 75.5939 9.686 76.5369 9.985V9.755C76.5369 8.076 75.4789 7.156 73.5469 7.156C72.1899 7.156 71.1779 7.455 70.0739 7.915L69.3149 5.684C70.6489 5.086 71.9599 4.672 73.9379 4.672C77.5259 4.672 79.2739 6.558 79.2739 9.801V17ZM76.5829 12.607V11.917C75.8699 11.641 74.8809 11.434 73.7999 11.434C72.0519 11.434 71.0169 12.147 71.0169 13.32V13.366C71.0169 14.516 72.0519 15.16 73.3629 15.16C75.2029 15.16 76.5829 14.125 76.5829 12.607ZM82.5839 17V4.856H85.3669V6.742C86.1489 5.592 87.2759 4.603 89.1619 4.603C91.8989 4.603 93.4859 6.443 93.4859 9.272V17H90.7029V10.1C90.7029 8.214 89.7599 7.133 88.1039 7.133C86.4939 7.133 85.3669 8.26 85.3669 10.146V17H82.5839ZM101.861 17.253C99.0086 17.253 96.2256 14.976 96.2256 10.951V10.905C96.2256 6.88 98.9626 4.603 101.861 4.603C103.862 4.603 105.127 5.615 106.001 6.742V0.21H108.784V17H106.001V14.976C105.104 16.241 103.839 17.253 101.861 17.253ZM102.528 14.838C104.391 14.838 106.047 13.274 106.047 10.951V10.905C106.047 8.559 104.391 7.018 102.528 7.018C100.619 7.018 99.0316 8.49 99.0316 10.905V10.951C99.0316 13.297 100.642 14.838 102.528 14.838ZM119.472 17V0.899999H131.409V3.43H122.301V7.616H130.374V10.146H122.301V14.47H131.524V17H119.472ZM138.175 17.092L133.184 4.856H136.174L139.44 13.78L142.729 4.856H145.65L140.682 17.092H138.175ZM152.882 17.276C149.363 17.276 146.649 14.723 146.649 10.974V10.928C146.649 7.455 149.11 4.603 152.583 4.603C156.447 4.603 158.402 7.639 158.402 11.135C158.402 11.388 158.379 11.641 158.356 11.917H149.432C149.731 13.895 151.134 14.999 152.928 14.999C154.285 14.999 155.251 14.493 156.217 13.55L157.85 14.999C156.7 16.379 155.113 17.276 152.882 17.276ZM149.409 10.077H155.642C155.458 8.283 154.4 6.88 152.56 6.88C150.858 6.88 149.662 8.191 149.409 10.077ZM161.197 17V4.856H163.98V6.742C164.762 5.592 165.889 4.603 167.775 4.603C170.512 4.603 172.099 6.443 172.099 9.272V17H169.316V10.1C169.316 8.214 168.373 7.133 166.717 7.133C165.107 7.133 163.98 8.26 163.98 10.146V17H161.197ZM179.531 17.207C177.484 17.207 176.035 16.31 176.035 13.642V7.248H174.494V4.856H176.035V1.521H178.818V4.856H182.084V7.248H178.818V13.205C178.818 14.286 179.37 14.723 180.313 14.723C180.934 14.723 181.486 14.585 182.038 14.309V16.586C181.348 16.977 180.566 17.207 179.531 17.207ZM189.057 17.23C187.332 17.23 185.423 16.609 183.905 15.413L185.147 13.527C186.458 14.516 187.884 15.022 189.126 15.022C190.322 15.022 191.012 14.516 191.012 13.711V13.665C191.012 12.722 189.724 12.4 188.298 11.963C186.504 11.457 184.503 10.721 184.503 8.398V8.352C184.503 6.052 186.412 4.649 188.827 4.649C190.345 4.649 192.001 5.178 193.289 6.029L192.185 8.007C191.012 7.294 189.77 6.857 188.758 6.857C187.677 6.857 187.056 7.363 187.056 8.076V8.122C187.056 8.996 188.367 9.364 189.793 9.824C191.564 10.376 193.565 11.181 193.565 13.366V13.412C193.565 15.965 191.587 17.23 189.057 17.23Z"
                fill="url(#paint0_linear_185_10186)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_185_10186"
                  x1="-2"
                  y1="-6"
                  x2="194.838"
                  y2="26.9701"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop />
                  <stop offset="0.515625" stopColor="#DD2C37" />
                </linearGradient>
              </defs>
            </svg>
          ) : (
            <svg
              className="my-2"
              width="152"
              height="21"
              viewBox="0 0 152 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.532 20.276C4.35133 20.276 3.38533 20.0767 2.634 19.678C1.88267 19.2793 1.33067 18.7273 0.978 18.022C0.625333 17.3013 0.449 16.4733 0.449 15.538C0.449 14.7867 0.518 14.1733 0.656 13.698C0.809333 13.2073 1.001 12.801 1.231 12.479C1.461 12.157 1.68333 11.8657 1.898 11.605C2.128 11.3443 2.31967 11.0683 2.473 10.777C2.62633 10.4857 2.703 10.1253 2.703 9.696V9.121H0.265V6.821H2.772C3.72267 6.821 4.405 7.028 4.819 7.442C5.24833 7.84067 5.463 8.42333 5.463 9.19V9.351C5.463 9.93367 5.394 10.4243 5.256 10.823C5.118 11.2217 4.94167 11.582 4.727 11.904C4.52767 12.226 4.32067 12.548 4.106 12.87C3.90667 13.1767 3.738 13.5217 3.6 13.905C3.462 14.2883 3.393 14.7483 3.393 15.285C3.393 15.8677 3.46967 16.343 3.623 16.711C3.77633 17.079 4.014 17.355 4.336 17.539C4.658 17.7077 5.05667 17.792 5.532 17.792C6.02267 17.792 6.42133 17.7 6.728 17.516C7.05 17.3167 7.28767 17.033 7.441 16.665C7.59433 16.2817 7.671 15.8063 7.671 15.239V6.821H10.592V14.94C10.592 16.7493 10.1933 18.091 9.396 18.965C8.59867 19.839 7.31067 20.276 5.532 20.276ZM7.73802 5.119V0.587999H10.475V5.119H7.73802ZM19.1049 20V11.283C19.1049 10.547 18.9439 9.98733 18.6219 9.604C18.2999 9.22067 17.7939 9.029 17.1039 9.029C16.4292 9.029 15.8619 9.19 15.4019 9.512C14.9419 9.834 14.5585 10.225 14.2519 10.685L12.3889 9.006C12.8642 8.23933 13.5005 7.64133 14.2979 7.212C15.0952 6.76733 16.0842 6.545 17.2649 6.545C18.7982 6.545 19.9789 6.94367 20.8069 7.741C21.6349 8.523 22.0489 9.65767 22.0489 11.145V20H19.1049ZM29.526 20.276C28.33 20.276 27.295 20 26.421 19.448C25.547 18.8807 24.8954 18.0373 24.466 16.918L26.95 15.814C27.088 16.182 27.2567 16.5193 27.456 16.826C27.6554 17.1173 27.9084 17.3473 28.215 17.516C28.537 17.6847 28.9357 17.769 29.411 17.769C30.1777 17.769 30.7757 17.5083 31.205 16.987C31.6497 16.4503 31.872 15.6913 31.872 14.71V12.088C31.872 11.122 31.6497 10.3783 31.205 9.857C30.7757 9.32033 30.1777 9.052 29.411 9.052C28.7517 9.052 28.238 9.22833 27.87 9.581C27.502 9.91833 27.2414 10.3553 27.088 10.892L24.512 9.742C24.9107 8.74533 25.5317 7.96333 26.375 7.396C27.2337 6.82867 28.2764 6.545 29.503 6.545C31.251 6.545 32.585 7.12 33.505 8.27C34.425 9.40467 34.885 11.1143 34.885 13.399C34.885 15.6837 34.425 17.401 33.505 18.551C32.6004 19.701 31.274 20.276 29.526 20.276ZM47.3782 20C46.3815 20 45.6455 19.7547 45.1702 19.264C44.6948 18.758 44.4572 18.0527 44.4572 17.148V6.821H47.4012V17.539H49.4482V20H47.3782ZM40.7082 20C39.7268 20 38.9985 19.7547 38.5232 19.264C38.0478 18.758 37.8102 18.0527 37.8102 17.148V6.821H40.7312V17.539H42.8012V20H40.7082ZM58.729 20V11.559C58.729 10.731 58.522 10.1023 58.108 9.673C57.694 9.24367 57.027 9.029 56.107 9.029C55.3097 9.029 54.658 9.20533 54.152 9.558C53.6614 9.91067 53.255 10.317 52.933 10.777L51.116 9.121C51.5914 8.35433 52.2584 7.73333 53.117 7.258C53.991 6.78267 55.049 6.545 56.291 6.545C58.0544 6.545 59.3807 6.959 60.27 7.787C61.1747 8.615 61.627 9.84167 61.627 11.467V20H58.729ZM55.233 20C53.8837 20 52.8257 19.6703 52.059 19.011C51.2924 18.3363 50.909 17.3627 50.909 16.09C50.909 15.2773 51.0854 14.5873 51.438 14.02C51.806 13.4373 52.335 13.0003 53.025 12.709C53.7304 12.4023 54.5967 12.249 55.624 12.249H59.12V14.388H55.762C55.1334 14.388 54.6504 14.5107 54.313 14.756C53.9757 15.0013 53.807 15.3463 53.807 15.791V16.159C53.807 16.619 53.9604 16.9717 54.267 17.217C54.5737 17.447 55.0107 17.562 55.578 17.562H56.82V20H55.233ZM67.5157 12.364C66.6111 12.364 65.9057 12.1263 65.3997 11.651C64.9091 11.1757 64.6637 10.4473 64.6637 9.466V7.695L67.4697 7.672V9.811H71.7937V12.364H67.5157ZM67.5157 19.08C66.6111 19.08 65.9057 18.8423 65.3997 18.367C64.9091 17.8917 64.6637 17.1633 64.6637 16.182V14.411L67.4697 14.388V16.527H71.7937V19.08H67.5157ZM74.7803 20V16.458C74.7803 15.768 74.9107 15.1853 75.1713 14.71C75.432 14.2347 75.7693 13.8667 76.1833 13.606C76.5973 13.3453 77.0343 13.169 77.4943 13.077V12.962H74.3893V11.904C74.3893 10.754 74.6193 9.78033 75.0793 8.983C75.5393 8.18567 76.191 7.58 77.0343 7.166C77.8777 6.752 78.882 6.545 80.0473 6.545C81.918 6.545 83.321 7.028 84.2563 7.994C85.207 8.94467 85.6823 10.2787 85.6823 11.996V20H82.7383V11.858C82.7383 10.9227 82.5007 10.2097 82.0253 9.719C81.55 9.213 80.86 8.96 79.9553 8.96C79.066 8.96 78.3837 9.18233 77.9083 9.627C77.433 10.0563 77.1953 10.708 77.1953 11.582L76.4133 11.007H79.8863V13.031C79.1503 13.077 78.606 13.3377 78.2533 13.813C77.9007 14.273 77.7243 15.055 77.7243 16.159V20H74.7803ZM75.6784 5.119V2.934H85.4534V5.119H75.6784ZM91.8014 20L90.5364 14.664H88.8344V12.203H90.9274C91.5101 12.203 91.9471 12.3487 92.2384 12.64C92.5297 12.916 92.7674 13.445 92.9514 14.227L94.0094 18.528L92.3304 17.631H93.9634C94.3927 17.631 94.7607 17.516 95.0674 17.286C95.3894 17.056 95.6424 16.7033 95.8264 16.228C96.0104 15.7373 96.1024 15.1163 96.1024 14.365V11.904C96.1024 11.0147 95.8724 10.317 95.4124 9.811C94.9524 9.28967 94.2471 9.029 93.2964 9.029C92.4991 9.029 91.8474 9.19 91.3414 9.512C90.8507 9.81867 90.4444 10.202 90.1224 10.662L88.2594 8.983C88.7654 8.201 89.4324 7.603 90.2604 7.189C91.0884 6.75967 92.1081 6.545 93.3194 6.545C95.2667 6.545 96.7081 7.10467 97.6434 8.224C98.5787 9.328 99.0464 10.9917 99.0464 13.215C99.0464 14.7943 98.8471 16.09 98.4484 17.102C98.0651 18.0987 97.4747 18.8347 96.6774 19.31C95.8801 19.77 94.8604 20 93.6184 20H91.8014ZM101.958 20V16.458C101.958 15.768 102.088 15.1853 102.349 14.71C102.61 14.2347 102.947 13.8667 103.361 13.606C103.775 13.3453 104.212 13.169 104.672 13.077V12.962H101.567V11.904C101.567 10.754 101.797 9.78033 102.257 8.983C102.717 8.18567 103.369 7.58 104.212 7.166C105.055 6.752 106.06 6.545 107.225 6.545C109.096 6.545 110.499 7.028 111.434 7.994C112.385 8.94467 112.86 10.2787 112.86 11.996V20H109.916V11.858C109.916 10.9227 109.678 10.2097 109.203 9.719C108.728 9.213 108.038 8.96 107.133 8.96C106.244 8.96 105.561 9.18233 105.086 9.627C104.611 10.0563 104.373 10.708 104.373 11.582L103.591 11.007H107.064V13.031C106.328 13.077 105.784 13.3377 105.431 13.813C105.078 14.273 104.902 15.055 104.902 16.159V20H101.958ZM120.75 20.276C119.523 20.276 118.473 20.046 117.599 19.586C116.74 19.1107 116.004 18.4743 115.391 17.677L117.3 15.929C117.806 16.5577 118.343 17.033 118.91 17.355C119.477 17.6617 120.121 17.815 120.842 17.815C121.44 17.815 121.931 17.677 122.314 17.401C122.697 17.1097 122.889 16.7263 122.889 16.251C122.889 15.883 122.751 15.538 122.475 15.216C122.199 14.894 121.685 14.6793 120.934 14.572L120.106 14.434C119.232 14.296 118.488 14.0737 117.875 13.767C117.277 13.4603 116.817 13.054 116.495 12.548C116.188 12.0267 116.035 11.3903 116.035 10.639C116.035 9.70367 116.25 8.937 116.679 8.339C117.108 7.72567 117.683 7.27333 118.404 6.982C119.125 6.69067 119.907 6.545 120.75 6.545C121.823 6.545 122.751 6.729 123.533 7.097C124.315 7.465 124.967 8.00167 125.488 8.707L123.556 10.409C123.157 9.96433 122.72 9.61933 122.245 9.374C121.785 9.11333 121.264 8.983 120.681 8.983C120.098 8.983 119.631 9.121 119.278 9.397C118.941 9.673 118.772 10.0333 118.772 10.478C118.772 10.938 118.941 11.2983 119.278 11.559C119.631 11.8043 120.098 11.9653 120.681 12.042L121.647 12.18C123.058 12.364 124.07 12.7933 124.683 13.468C125.296 14.1427 125.603 15.0243 125.603 16.113C125.603 17.4317 125.158 18.459 124.269 19.195C123.38 19.9157 122.207 20.276 120.75 20.276ZM132.969 20.276C131.742 20.276 130.692 20.046 129.818 19.586C128.959 19.1107 128.223 18.4743 127.61 17.677L129.519 15.929C130.025 16.5577 130.562 17.033 131.129 17.355C131.696 17.6617 132.34 17.815 133.061 17.815C133.659 17.815 134.15 17.677 134.533 17.401C134.916 17.1097 135.108 16.7263 135.108 16.251C135.108 15.883 134.97 15.538 134.694 15.216C134.418 14.894 133.904 14.6793 133.153 14.572L132.325 14.434C131.451 14.296 130.707 14.0737 130.094 13.767C129.496 13.4603 129.036 13.054 128.714 12.548C128.407 12.0267 128.254 11.3903 128.254 10.639C128.254 9.70367 128.469 8.937 128.898 8.339C129.327 7.72567 129.902 7.27333 130.623 6.982C131.344 6.69067 132.126 6.545 132.969 6.545C134.042 6.545 134.97 6.729 135.752 7.097C136.534 7.465 137.186 8.00167 137.707 8.707L135.775 10.409C135.376 9.96433 134.939 9.61933 134.464 9.374C134.004 9.11333 133.483 8.983 132.9 8.983C132.317 8.983 131.85 9.121 131.497 9.397C131.16 9.673 130.991 10.0333 130.991 10.478C130.991 10.938 131.16 11.2983 131.497 11.559C131.85 11.8043 132.317 11.9653 132.9 12.042L133.866 12.18C135.277 12.364 136.289 12.7933 136.902 13.468C137.515 14.1427 137.822 15.0243 137.822 16.113C137.822 17.4317 137.377 18.459 136.488 19.195C135.599 19.9157 134.426 20.276 132.969 20.276ZM147.488 20.276C146.736 20.276 146.115 20.1687 145.625 19.954C145.149 19.724 144.758 19.4327 144.452 19.08C144.16 18.712 143.938 18.321 143.785 17.907H143.67V20H140.749V6.821H143.67V15.538C143.67 16.0287 143.8 16.435 144.061 16.757C144.337 17.079 144.682 17.3243 145.096 17.493C145.525 17.6463 145.977 17.723 146.453 17.723C147.25 17.723 147.833 17.4777 148.201 16.987C148.569 16.4963 148.753 15.7603 148.753 14.779V6.821H151.674V15.423C151.674 16.9717 151.321 18.1677 150.616 19.011C149.91 19.8543 148.868 20.276 147.488 20.276Z"
                fill="url(#paint0_linear_185_10228)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_185_10228"
                  x1="-1"
                  y1="-5"
                  x2="155.499"
                  y2="15.6248"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop />
                  <stop offset="0.515625" stopColor="#DD2C37" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </div>
        {loading ? (
          <Loading />
        ) : (
          <NewsCard
            newsData={newsData}
            total={total}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
            setPageSize={setPageSize}
            pageSize={pageSize}
          />
        )}
      </div>
    </div>
  );
};

export default News;
