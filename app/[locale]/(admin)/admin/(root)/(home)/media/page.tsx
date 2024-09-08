"use client";

import {
  Radio,
  RadioChangeEvent,
} from "antd";

import { useTranslation } from "react-i18next";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { formatDateDiff, toastError, toastSuccess } from "@lib-utils/helper";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import NoImage from "@public/images/no_image_rectangle.png";
import { BLACK_BG_COLOR } from "@components/Colors";
import { ColumnsType, TableProps } from "antd/es/table";
import Submenu from "@components/Admin/Submenu";
import DataTable from "@components/Admin/Datatable";
import { useCart } from "@components/Admin/Cartcontext";
import FilterTag from "@components/Admin/FilterTag";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Link from "next/link";
import MediaGrid from "@components/Admin/media/MediaGrid";
import Loading from "@components/Loading";
interface MinisizeDataType {
  id: number;
  imageProfile: string;
  mediaBanner: string;
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
  type: string;
  coverImg: string;
  url?: string;
  duration?: string;
  createdAt: string;
}
const Media = () => {
  const {
    formState: { errors },
  } = useForm();
  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);
  const { data: session, status } = useSession();
  const [minisizeData, setMinisizeData] = useState<MinisizeDataType | null>(
    null
  );
  const [brandName, setBrandName] = useState("");
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const pathname = usePathname();

  type OnChange = NonNullable<TableProps<DataType>["onChange"]>;
  type GetSingle<T> = T extends (infer U)[] ? U : never;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [mediaData, setMediaData] = useState<DataType[]>([]);
  const [type, setType] = useState<"File" | "Video" | "Image">("Video");
  const [loading, setLoading] = useState(false);

  // Settings for the slider

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

  const isActive = pathname.includes("admin/media");

  const fetchMinisizeData = async (name: string) => {
    try {
      const response = await axios.get(`/api/adminMinisize?q=${name}`);
      if (response.data) {
        const minisize = response.data.minisizes.map(
          (data: MinisizeDataType) => ({
            id: data.id,
            imageProfile: data.imageProfile,
            mediaBanner: data.mediaBanner,
          })
        );
        minisize[0] && setMinisizeData(minisize[0]);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchData(type, currentPage, pageSize);
  }, [type, currentPage, pageSize]);

  // Function to fetch the image size from Cloudinary based on its public ID
  const fetchImageSize = async (publicId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/upload`, { params: { publicId } });
      return response.data.result.bytes; // Returns file size in bytes
    } catch (error) {
      console.error("Error fetching Cloudinary metadata: ", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Extract the public ID from the Cloudinary URL
  const extractPublicIdFromUrl = (url: string) => {
    const parts = url.split('/');
    const fileNameWithExtension = parts[parts.length - 1];
    return fileNameWithExtension.split('.')[0]; // Remove extension
  };

  async function fetchData(type: string = "", currentPage: number, pageSize: number) {
    setLoadPage(true);
    try {
      const { data } = await axios.get(`/api/adminMedia`, {
        params: {
          type,
          page: currentPage,
          pageSize: pageSize,
          isActive: true,
        },
      });
  
      const mediaDataWithKeys = await Promise.all(
        data.medias.map(async (media: DataType, index: number) => {
          const publicId = extractPublicIdFromUrl(media.coverImg);
          const fileSize = media.type == "File" ? await fetchImageSize(publicId) : "Unknown"
  
          return {
            ...media,
            key: index + 1 + (currentPage - 1) * pageSize,
            size: fileSize ? `${(fileSize / 1024).toFixed(2)} KB` : "Unknown",
          };
        })
      );
  
      setMediaData(mediaDataWithKeys);
      setTotal(data.total);
    } catch (error: any) {
      toastError(error);
    } finally {
      setLoadPage(false);
    }
  }
  const changeTab = (e: RadioChangeEvent) => {
    const selectedType = e.target.value;
    setType(selectedType);
  };


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
                ? minisizeData.mediaBanner
                  ? minisizeData.mediaBanner
                  : NoImage.src
                : NoImage.src
            }
          />
        </div>
        <nav
          className="flex justify-between flex default-font text-white text-sm"
          style={{
            background: `linear-gradient(90deg, ${BLACK_BG_COLOR} 0%, rgba(27, 27, 27, 0.9) 100%)`,
            boxShadow: "0px 4px 4px 0px #00000040",
          }}
        >
          <div className="flex gap-2 items-center default-font">
            <div className="cursor-pointer hover:bg-comp-red h-full flex items-center px-4 text-white">
              <Link
                className="hover:text-white text-white"
                href={`/${locale}/admin/product?name=${brandName}`}
              >
                {t("Product")}
              </Link>
            </div>
            <div className="cursor-pointer hover:bg-comp-red h-full flex items-center px-4 text-white">
              <Link
                className="hover:text-white text-white"
                href={`/${locale}/admin/news?name=${brandName}`}
              >
                {t("News and events")}
              </Link>
            </div>
            <div
              className={`cursor-pointer hover:bg-comp-red h-full flex items-center px-4 text-white ${
                isActive ? "bg-comp-red" : ""
              }`}
            >
              <Link
                className="hover:text-white text-white"
                href={`/${locale}/admin/media?name=${brandName}`}
              >
                {t("Marketing")}
              </Link>
            </div>
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
              d="M19.4345 4.03448C19.5668 4.2424 19.3401 4.48461 19.0998 4.43C18.6298 4.29 18.1098 4.22 17.5798 4.22H14.2796C14.1223 4.22 13.9743 4.14605 13.8798 4.02037L12.7298 2.49C12.589 2.29044 12.7221 2 12.9664 2H15.7198C17.2808 2 18.6559 2.81073 19.4345 4.03448Z"
              fill="#292D32"
            />
            <path
              d="M20.14 6.54C19.71 6.23 19.22 6 18.69 5.87C18.33 5.77 17.96 5.72 17.58 5.72H13.86C13.28 5.72 13.24 5.67 12.93 5.26L11.53 3.4C10.88 2.53 10.37 2 8.74 2H6.42C3.98 2 2 3.98 2 6.42V17.58C2 20.02 3.98 22 6.42 22H17.58C20.02 22 22 20.02 22 17.58V10.14C22 8.65 21.27 7.34 20.14 6.54ZM14.39 16.34H9.6C9.21 16.34 8.91 16.03 8.91 15.64C8.91 15.26 9.21 14.94 9.6 14.94H14.39C14.78 14.94 15.09 15.26 15.09 15.64C15.09 16.03 14.78 16.34 14.39 16.34Z"
              fill="#292D32"
            />
          </svg>

          {locale === "en" ? (
            <svg
              className=""
              width="190"
              height="18"
              viewBox="0 0 190 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.705 17.23C5.244 17.23 2.921 16.379 0.989 14.654L2.691 12.63C4.232 13.964 5.773 14.723 7.774 14.723C9.522 14.723 10.626 13.918 10.626 12.699V12.653C10.626 11.503 9.982 10.882 6.992 10.192C3.565 9.364 1.633 8.352 1.633 5.385V5.339C1.633 2.579 3.933 0.669999 7.13 0.669999C9.476 0.669999 11.339 1.383 12.972 2.694L11.454 4.833C10.005 3.752 8.556 3.177 7.084 3.177C5.428 3.177 4.462 4.028 4.462 5.086V5.132C4.462 6.374 5.198 6.926 8.28 7.662C11.684 8.49 13.455 9.709 13.455 12.377V12.423C13.455 15.436 11.086 17.23 7.705 17.23ZM22.2329 17.276C18.5299 17.276 15.7929 14.447 15.7929 10.997V10.951C15.7929 7.478 18.5529 4.603 22.2789 4.603C26.0049 4.603 28.7419 7.432 28.7419 10.905V10.951C28.7419 14.401 25.9819 17.276 22.2329 17.276ZM22.2789 14.861C24.5329 14.861 25.9589 13.09 25.9589 10.997V10.951C25.9589 8.812 24.4179 7.041 22.2329 7.041C20.0019 7.041 18.5759 8.789 18.5759 10.905V10.951C18.5759 13.067 20.1169 14.861 22.2789 14.861ZM37.1881 17.276C33.5771 17.276 30.9091 14.447 30.9091 10.997V10.951C30.9091 7.501 33.5771 4.603 37.2111 4.603C39.5111 4.603 40.9371 5.454 42.0641 6.696L40.3391 8.559C39.4881 7.662 38.5911 7.041 37.1881 7.041C35.1641 7.041 33.6921 8.789 33.6921 10.905V10.951C33.6921 13.113 35.1871 14.861 37.3261 14.861C38.6371 14.861 39.6031 14.24 40.4771 13.343L42.1561 14.999C40.9601 16.333 39.5571 17.276 37.1881 17.276ZM44.7618 2.993V0.347999H47.7518V2.993H44.7618ZM44.8768 17V4.856H47.6598V17H44.8768ZM61.4858 17H58.7258V15.505C57.8978 16.494 56.6328 17.253 54.7928 17.253C52.4928 17.253 50.4688 15.942 50.4688 13.504V13.458C50.4688 10.767 52.5618 9.479 55.3908 9.479C56.8628 9.479 57.8058 9.686 58.7488 9.985V9.755C58.7488 8.076 57.6908 7.156 55.7588 7.156C54.4018 7.156 53.3898 7.455 52.2858 7.915L51.5268 5.684C52.8608 5.086 54.1718 4.672 56.1498 4.672C59.7378 4.672 61.4858 6.558 61.4858 9.801V17ZM58.7948 12.607V11.917C58.0818 11.641 57.0928 11.434 56.0118 11.434C54.2638 11.434 53.2288 12.147 53.2288 13.32V13.366C53.2288 14.516 54.2638 15.16 55.5748 15.16C57.4148 15.16 58.7948 14.125 58.7948 12.607ZM64.9569 17V0.21H67.7399V17H64.9569ZM78.2724 17V4.856H81.0554V6.696C81.8374 5.615 82.8954 4.603 84.7584 4.603C86.5064 4.603 87.7254 5.454 88.3694 6.742C89.3584 5.454 90.6464 4.603 92.4864 4.603C95.1314 4.603 96.7414 6.282 96.7414 9.249V17H93.9584V10.1C93.9584 8.168 93.0614 7.133 91.4974 7.133C89.9794 7.133 88.8984 8.191 88.8984 10.146V17H86.1154V10.077C86.1154 8.191 85.1954 7.133 83.6544 7.133C82.1134 7.133 81.0554 8.283 81.0554 10.169V17H78.2724ZM105.693 17.276C102.174 17.276 99.4599 14.723 99.4599 10.974V10.928C99.4599 7.455 101.921 4.603 105.394 4.603C109.258 4.603 111.213 7.639 111.213 11.135C111.213 11.388 111.19 11.641 111.167 11.917H102.243C102.542 13.895 103.945 14.999 105.739 14.999C107.096 14.999 108.062 14.493 109.028 13.55L110.661 14.999C109.511 16.379 107.924 17.276 105.693 17.276ZM102.22 10.077H108.453C108.269 8.283 107.211 6.88 105.371 6.88C103.669 6.88 102.473 8.191 102.22 10.077ZM119.022 17.253C116.17 17.253 113.387 14.976 113.387 10.951V10.905C113.387 6.88 116.124 4.603 119.022 4.603C121.023 4.603 122.288 5.615 123.162 6.742V0.21H125.945V17H123.162V14.976C122.265 16.241 121 17.253 119.022 17.253ZM119.689 14.838C121.552 14.838 123.208 13.274 123.208 10.951V10.905C123.208 8.559 121.552 7.018 119.689 7.018C117.78 7.018 116.193 8.49 116.193 10.905V10.951C116.193 13.297 117.803 14.838 119.689 14.838ZM129.462 2.993V0.347999H132.452V2.993H129.462ZM129.577 17V4.856H132.36V17H129.577ZM146.186 17H143.426V15.505C142.598 16.494 141.333 17.253 139.493 17.253C137.193 17.253 135.169 15.942 135.169 13.504V13.458C135.169 10.767 137.262 9.479 140.091 9.479C141.563 9.479 142.506 9.686 143.449 9.985V9.755C143.449 8.076 142.391 7.156 140.459 7.156C139.102 7.156 138.09 7.455 136.986 7.915L136.227 5.684C137.561 5.086 138.872 4.672 140.85 4.672C144.438 4.672 146.186 6.558 146.186 9.801V17ZM143.495 12.607V11.917C142.782 11.641 141.793 11.434 140.712 11.434C138.964 11.434 137.929 12.147 137.929 13.32V13.366C137.929 14.516 138.964 15.16 140.275 15.16C142.115 15.16 143.495 14.125 143.495 12.607ZM165.086 2.993V0.347999H168.076V2.993H165.086ZM157.013 17V7.248H155.472V4.925H157.013V4.051C157.013 2.694 157.358 1.682 158.002 1.038C158.646 0.393999 159.543 0.0719986 160.739 0.0719986C161.705 0.0719986 162.372 0.21 162.993 0.393999V2.74C162.441 2.556 161.958 2.441 161.36 2.441C160.302 2.441 159.75 3.016 159.75 4.281V4.948H162.97V7.248H159.796V17H157.013ZM165.201 17V4.856H167.984V17H165.201ZM171.781 17V0.21H174.564V17H171.781ZM183.767 17.276C180.248 17.276 177.534 14.723 177.534 10.974V10.928C177.534 7.455 179.995 4.603 183.468 4.603C187.332 4.603 189.287 7.639 189.287 11.135C189.287 11.388 189.264 11.641 189.241 11.917H180.317C180.616 13.895 182.019 14.999 183.813 14.999C185.17 14.999 186.136 14.493 187.102 13.55L188.735 14.999C187.585 16.379 185.998 17.276 183.767 17.276ZM180.294 10.077H186.527C186.343 8.283 185.285 6.88 183.445 6.88C181.743 6.88 180.547 8.191 180.294 10.077Z"
                fill="url(#paint0_linear_185_10869)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_185_10869"
                  x1="0"
                  y1="-6"
                  x2="191.155"
                  y2="25.0432"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop />
                  <stop offset="0.515625" stopColor="#DD2C37" />
                </linearGradient>
              </defs>
            </svg>
          ) : (
            <svg
              className="mb-2"
              width="116"
              height="27"
              viewBox="0 0 116 27"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.924 26V17.628C7.924 16.8 7.717 16.1713 7.303 15.742C6.889 15.3127 6.22967 15.098 5.325 15.098C4.52767 15.098 3.876 15.2743 3.37 15.627C2.87933 15.9797 2.473 16.386 2.151 16.846L0.311 15.19C0.786333 14.4233 1.45333 13.8023 2.312 13.327C3.186 12.8517 4.23633 12.614 5.463 12.614C6.30633 12.614 7.06533 12.7443 7.74 13.005C8.41467 13.2503 8.92833 13.6567 9.281 14.224C9.787 14.5 10.1703 14.937 10.431 15.535C10.6917 16.133 10.822 16.915 10.822 17.881V26H7.924ZM4.451 26C3.08633 26 2.02067 25.6703 1.254 25.011C0.502667 24.3363 0.127 23.3627 0.127 22.09C0.127 21.262 0.303333 20.5643 0.656 19.997C1.024 19.4143 1.56833 18.9773 2.289 18.686C3.00967 18.3947 3.90667 18.249 4.98 18.249H8.315V20.388H4.957C4.32833 20.388 3.84533 20.5107 3.508 20.756C3.186 21.0013 3.025 21.3463 3.025 21.791V22.159C3.025 22.6343 3.17067 22.987 3.462 23.217C3.76867 23.447 4.20567 23.562 4.773 23.562H6.015V26H4.451ZM9.902 15.098L8.706 14.316V13.626C8.706 13.1047 8.844 12.7213 9.12 12.476C9.396 12.2307 9.787 12.108 10.293 12.108H12.225V14.316H9.902V15.098ZM1.04071 11.119V8.934H8.37771V6.542H10.8157V8.244C10.8157 9.22533 10.5704 9.95367 10.0797 10.429C9.60438 10.889 8.90671 11.119 7.98671 11.119H1.04071ZM4.97371 9.348V6.542H7.31971V9.348H4.97371ZM8.43755 4.53V0.827H10.8065V4.53H8.43755ZM19.5487 26.276C17.862 26.276 16.528 25.8313 15.5467 24.942C14.5807 24.0373 14.0977 22.7953 14.0977 21.216V21.055C14.0977 20.1503 14.32 19.468 14.7647 19.008C15.2247 18.548 15.8764 18.318 16.7197 18.318H19.1117V20.618H16.9267V21.101C16.9267 22.0363 17.1414 22.7417 17.5707 23.217C18.0154 23.677 18.6747 23.907 19.5487 23.907C20.4227 23.907 21.082 23.6617 21.5267 23.171C21.9714 22.665 22.1937 21.9367 22.1937 20.986V18.134C22.1937 17.1527 21.9637 16.386 21.5037 15.834C21.0437 15.2667 20.369 14.983 19.4797 14.983C18.759 14.983 18.1764 15.1593 17.7317 15.512C17.3024 15.8493 16.9727 16.2863 16.7427 16.823L14.2127 15.558C14.6574 14.5767 15.3244 13.833 16.2137 13.327C17.103 12.8057 18.1764 12.545 19.4337 12.545C21.3657 12.545 22.8224 13.1353 23.8037 14.316C24.785 15.4967 25.2757 17.1527 25.2757 19.284C25.2757 21.5227 24.7927 23.2477 23.8267 24.459C22.876 25.6703 21.45 26.276 19.5487 26.276ZM28.1739 26V22.458C28.1739 21.768 28.3042 21.1853 28.5649 20.71C28.8255 20.2347 29.1629 19.8667 29.5769 19.606C29.9909 19.3453 30.4279 19.169 30.8879 19.077V18.962H27.7829V17.904C27.7829 16.754 28.0129 15.7803 28.4729 14.983C28.9329 14.1857 29.5845 13.58 30.4279 13.166C31.2712 12.752 32.2755 12.545 33.4409 12.545C35.3115 12.545 36.7145 13.028 37.6499 13.994C38.6006 14.9447 39.0759 16.2787 39.0759 17.996V26H36.1319V17.858C36.1319 16.9227 35.8942 16.2097 35.4189 15.719C34.9435 15.213 34.2535 14.96 33.3489 14.96C32.4595 14.96 31.7772 15.1823 31.3019 15.627C30.8265 16.0563 30.5889 16.708 30.5889 17.582L29.8069 17.007H33.2799V19.031C32.5439 19.077 31.9995 19.3377 31.6469 19.813C31.2942 20.273 31.1179 21.055 31.1179 22.159V26H28.1739ZM47.518 26V17.283C47.518 16.547 47.357 15.9873 47.035 15.604C46.713 15.2207 46.207 15.029 45.517 15.029C44.8423 15.029 44.275 15.19 43.815 15.512C43.355 15.834 42.9716 16.225 42.665 16.685L40.802 15.006C41.2773 14.2393 41.9136 13.6413 42.711 13.212C43.5083 12.7673 44.4973 12.545 45.678 12.545C47.2113 12.545 48.392 12.9437 49.22 13.741C50.048 14.523 50.462 15.6577 50.462 17.145V26H47.518ZM58.3761 26.276C57.1495 26.276 56.0991 26.046 55.2251 25.586C54.3665 25.1107 53.6305 24.4743 53.0171 23.677L54.9261 21.929C55.4321 22.5577 55.9688 23.033 56.5361 23.355C57.1035 23.6617 57.7475 23.815 58.4681 23.815C59.0661 23.815 59.5568 23.677 59.9401 23.401C60.3235 23.1097 60.5151 22.7263 60.5151 22.251C60.5151 21.883 60.3771 21.538 60.1011 21.216C59.8251 20.894 59.3115 20.6793 58.5601 20.572L57.7321 20.434C56.8581 20.296 56.1145 20.0737 55.5011 19.767C54.9031 19.4603 54.4431 19.054 54.1211 18.548C53.8145 18.0267 53.6611 17.3903 53.6611 16.639C53.6611 15.7037 53.8758 14.937 54.3051 14.339C54.7345 13.7257 55.3095 13.2733 56.0301 12.982C56.7508 12.6907 57.5328 12.545 58.3761 12.545C59.4495 12.545 60.3771 12.729 61.1591 13.097C61.9411 13.465 62.5928 14.0017 63.1141 14.707L61.1821 16.409C60.7835 15.9643 60.3465 15.6193 59.8711 15.374C59.4111 15.1133 58.8898 14.983 58.3071 14.983C57.7245 14.983 57.2568 15.121 56.9041 15.397C56.5668 15.673 56.3981 16.0333 56.3981 16.478C56.3981 16.938 56.5668 17.2983 56.9041 17.559C57.2568 17.8043 57.7245 17.9653 58.3071 18.042L59.2731 18.18C60.6838 18.364 61.6958 18.7933 62.3091 19.468C62.9225 20.1427 63.2291 21.0243 63.2291 22.113C63.2291 23.4317 62.7845 24.459 61.8951 25.195C61.0058 25.9157 59.8328 26.276 58.3761 26.276ZM70.5029 26C69.2762 26 68.2872 25.7777 67.5359 25.333C66.7999 24.8883 66.2632 24.1677 65.9259 23.171C65.6039 22.1743 65.4429 20.8557 65.4429 19.215C65.4429 16.915 65.8339 15.2283 66.6159 14.155C67.3979 13.0817 68.5095 12.545 69.9509 12.545L71.3999 14.339H71.4459L72.8949 12.545C73.6615 12.545 74.3515 12.6983 74.9649 13.005C75.5782 13.2963 76.0612 13.7563 76.4139 14.385C76.7665 14.9983 76.9429 15.7957 76.9429 16.777V26H73.9989V17.352C73.9989 16.8307 73.9605 16.4167 73.8839 16.11C73.8225 15.8033 73.7075 15.581 73.5389 15.443C73.3855 15.2897 73.1709 15.2053 72.8949 15.19L71.4459 16.846H71.3999L69.9739 15.19C69.4679 15.19 69.0769 15.4583 68.8009 15.995C68.5402 16.5163 68.4099 17.237 68.4099 18.157V20.411C68.4099 21.5763 68.5939 22.389 68.9619 22.849C69.3452 23.309 69.9969 23.539 70.9169 23.539H71.8369V26H70.5029ZM87.4566 26V17.559C87.4566 16.731 87.2496 16.1023 86.8356 15.673C86.4216 15.2437 85.7546 15.029 84.8346 15.029C84.0372 15.029 83.3856 15.2053 82.8796 15.558C82.3889 15.9107 81.9826 16.317 81.6606 16.777L79.8436 15.121C80.3189 14.3543 80.9859 13.7333 81.8446 13.258C82.7186 12.7827 83.7766 12.545 85.0186 12.545C86.7819 12.545 88.1082 12.959 88.9976 13.787C89.9022 14.615 90.3546 15.8417 90.3546 17.467V26H87.4566ZM83.9606 26C82.6112 26 81.5532 25.6703 80.7866 25.011C80.0199 24.3363 79.6366 23.3627 79.6366 22.09C79.6366 21.2773 79.8129 20.5873 80.1656 20.02C80.5336 19.4373 81.0626 19.0003 81.7526 18.709C82.4579 18.4023 83.3242 18.249 84.3516 18.249H87.8476V20.388H84.4896C83.8609 20.388 83.3779 20.5107 83.0406 20.756C82.7032 21.0013 82.5346 21.3463 82.5346 21.791V22.159C82.5346 22.619 82.6879 22.9717 82.9946 23.217C83.3012 23.447 83.7382 23.562 84.3056 23.562H85.5476V26H83.9606ZM98.7963 26V17.283C98.7963 16.547 98.6353 15.9873 98.3133 15.604C97.9913 15.2207 97.4853 15.029 96.7953 15.029C96.1206 15.029 95.5533 15.19 95.0933 15.512C94.6333 15.834 94.2499 16.225 93.9433 16.685L92.0803 15.006C92.5556 14.2393 93.1919 13.6413 93.9893 13.212C94.7866 12.7673 95.7756 12.545 96.9563 12.545C98.4896 12.545 99.6703 12.9437 100.498 13.741C101.326 14.523 101.74 15.6577 101.74 17.145V26H98.7963ZM109.677 26C108.466 26 107.477 25.7853 106.71 25.356C105.959 24.9113 105.399 24.2213 105.031 23.286C104.663 22.3507 104.479 21.1317 104.479 19.629C104.479 17.329 104.947 15.5733 105.882 14.362C106.833 13.1507 108.297 12.545 110.275 12.545C112.069 12.545 113.426 13.0203 114.346 13.971C115.266 14.9217 115.726 16.2633 115.726 17.996V26H112.805V17.996C112.805 17.0453 112.583 16.3247 112.138 15.834C111.694 15.328 111.042 15.075 110.183 15.075C109.325 15.075 108.658 15.3357 108.182 15.857C107.722 16.3783 107.492 17.145 107.492 18.157V20.319C107.492 21.0703 107.577 21.676 107.745 22.136C107.929 22.596 108.205 22.9333 108.573 23.148C108.941 23.3473 109.424 23.447 110.022 23.447H110.62V26H109.677Z"
                fill="url(#paint0_linear_185_10969)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_185_10969"
                  x1="-1"
                  y1="1"
                  x2="119.999"
                  y2="13.2427"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop />
                  <stop offset="0.515625" stop-color="#DD2C37" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </div>
        <div className="media-radio">
          <Radio.Group
            defaultValue="Video"
            buttonStyle="solid"
            onChange={changeTab}
            className="default-font"
          >
            <Radio.Button value="Video">
              <span className="default-font">{t("Video")}</span>
            </Radio.Button>
            <Radio.Button value="Image">
              <span className="default-font">{t("Image")}</span>
            </Radio.Button>
            <Radio.Button value="File">
              <span className="default-font">{t("Pdf File")}</span>
            </Radio.Button>
          </Radio.Group>
        </div>
        {loading ? <Loading /> : <MediaGrid mediaData={mediaData} type={type} total={total} setCurrentPage={setCurrentPage} currentPage={currentPage} setPageSize={setPageSize} pageSize={pageSize} />}
      </div>
    </div>
  );
};

export default Media;
