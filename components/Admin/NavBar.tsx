import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { signOut, useSession } from "next-auth/react";
// import { useTranslation } from "../../lib/shared/translations/i18n-client";
import { useEffect, useMemo, useState, useRef } from "react";
import axios from "@lib-services/axios";
import Image from "next/image";

import LogoComp from "./LogoCompmoto";
import LogoCOM from "../../public/images/comp_moto_logo.png";
import Star from "@public/images/star.png";
import { BLACK_BG_COLOR } from "@components/Colors";
import { number } from "zod";
import LanguageChanger from "@components/LanguageChanger";
import { Badge } from "antd";
import { Session } from "inspector";
import { useCart } from "./Cartcontext";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../i18nConfig";
import { profile } from "console";

type NavBarProps = {
  isOpen: boolean;
  onToggle: () => void;
  userData: {
    custNo: string;
    name: string;
    email: string;
    rewardPoint: number;
    creditPoint: number;
    image: string;
    role: string;
    data: {
      CreditPoint: string[];
      RewardPoint: string[];
      CustPriceGroup: string[];
      PaymentTerms: string[];
    };
  };
  userId: Number;
};

type NavBarItemProps = {
  title: string;
  icon: JSX.Element;
  href: any;
  color?: string;
};

type SettingJSON = {
  id: number;
  name: JSON;
  reference: string;
  value: boolean;
  valueType: string;
  createdAt: Date;
  updatedAt: Date;
};

const NavBar = ({ onToggle, isOpen, userData, userId }: NavBarProps) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [starLevel, setStarLevel] = useState(0);
  const [payment, setPayment] = useState("0");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { cartItemCount, setCartItemCount, profileImage, setProfileImage } =
    useCart();
  const locale = useCurrentLocale(i18nConfig);

  const sidebarItems: NavBarItemProps[] = [
    {
      title: "admin_account",
      icon: <UserCircleIcon />,
      href: "/admin/admin-profile",
      color: "purple",
    },
    {
      title: "sidebar.sign_out",
      icon: <ArrowLeftOnRectangleIcon />,
      href: "signout",
    },
  ];

  const fetchCartCount = async () => {
    try {
      const response = await axios.get(
        `${window.location.origin}/api/cartCount?userId=${userId}`
      );
      setCartItemCount(response.data.count);
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  // async function fetchUser() {
  //   try {
  //     // const { data } = await
  //     const {data} = await axios.get(`/api/users/${userId}`);
  //     console.log(data)
  //     setProfileImage(data.image);
  //   } catch (error) {
  //     console.error("Error fetching data: ", error);
  //   }
  // }

  useEffect(() => {
    if (userData?.data?.CustPriceGroup) {
      if (userData.data.CustPriceGroup.includes("3STARS")) {
        setStarLevel(3);
      } else if (userData.data.CustPriceGroup.includes("5STARS")) {
        setStarLevel(5);
      } else if (userData.data.CustPriceGroup.includes("7STARS")) {
        setStarLevel(7);
      }
    }

    if (userData?.data?.PaymentTerms) {
      const payment = userData?.data?.PaymentTerms[0];
      if (payment) {
        let paymentTerm = payment.match(/\d+/);
        paymentTerm && setPayment(paymentTerm[0]);
      }
    }
    // setProfileImage(userData.image)
  }, [userData]);

  useEffect(() => {
    if (userId) {
      fetchCartCount();
      // userData.role === "USER" && fetchUser();
    }
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <>
      <nav
        className=""
        style={{
          background: `linear-gradient(90deg, ${BLACK_BG_COLOR} 0%, rgba(27, 27, 27, 0.9) 100%)`,
          boxShadow: `0px 4px 4px 0px rgba(0, 0, 0, 0.25)`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between p-2 mx-auto">
          <Link href={"/admin"} className="relative flex items-center ">
            <LogoComp src={LogoCOM.src} width={175} height={45} alt="logo" />
          </Link>
          <div className="flex p-2.5 gap-2">
            <button
              type="button"
              className="inline-flex items-center text-gray-500 rounded-lg"
            >
              <Link href={`/${locale}/admin/cart/${userId}`} className="flex">
                <Badge count={cartItemCount} overflowCount={99}>
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M25.1305 15.4606C24.6551 15.4606 24.2609 15.0484 24.2609 14.5515V12.8787C24.2609 11.606 23.7392 10.3697 22.8348 9.50905C21.9189 8.63632 20.7363 8.23632 19.4841 8.35753C17.3971 8.56359 15.5652 10.7939 15.5652 13.1212V14.2969C15.5652 14.7939 15.171 15.206 14.6957 15.206C14.2203 15.206 13.8261 14.7939 13.8261 14.2969V13.109C13.8261 9.84844 16.3421 6.84238 19.3218 6.53935C21.0609 6.36965 22.7305 6.93935 24.0058 8.16359C25.2696 9.36359 26 11.0848 26 12.8787V14.5515C26 15.0484 25.6058 15.4606 25.1305 15.4606Z"
                      fill="white"
                    />
                    <path
                      d="M23.3913 32.5757H16.4348C11.0783 32.5757 10.0812 29.9697 9.82608 27.4363L8.95652 20.1757C8.82898 18.8666 8.7826 16.9878 9.99999 15.5818C11.0435 14.3697 12.771 13.7878 15.2754 13.7878H24.5507C27.0667 13.7878 28.7942 14.3818 29.8261 15.5818C31.0319 16.9878 30.9971 18.8666 30.8696 20.1515L30 27.4363C29.7449 29.9697 28.7478 32.5757 23.3913 32.5757ZM15.2754 15.606C13.3159 15.606 11.971 16.006 11.287 16.806C10.7188 17.4606 10.5333 18.4666 10.6841 19.9697L11.5536 27.2303C11.7507 29.1697 12.2609 30.7697 16.4348 30.7697H23.3913C27.5652 30.7697 28.0754 29.1818 28.2725 27.2545L29.142 19.9697C29.2927 18.4909 29.1072 17.4848 28.5391 16.8181C27.8551 16.006 26.5101 15.606 24.5507 15.606H15.2754Z"
                      fill="white"
                    />
                    <path
                      d="M23.8782 20.9394C23.229 20.9394 22.7072 20.3939 22.7072 19.7273C22.7072 19.0606 23.229 18.5151 23.8666 18.5151C24.5043 18.5151 25.0261 19.0606 25.0261 19.7273C25.0261 20.3939 24.5159 20.9394 23.8782 20.9394Z"
                      fill="white"
                    />
                    <path
                      d="M15.7624 20.9394C15.1131 20.9394 14.5914 20.3939 14.5914 19.7273C14.5914 19.0606 15.1131 18.5151 15.7508 18.5151C16.3885 18.5151 16.9102 19.0606 16.9102 19.7273C16.9102 20.3939 16.4001 20.9394 15.7624 20.9394Z"
                      fill="white"
                    />
                  </svg>
                </Badge>
              </Link>
            </button>
            <button
              type="button"
              className="inline-flex items-center text-gray-500"
              onClick={() => setDropdownVisible(!isDropdownVisible)}
            >
              {profileImage ? (
                <Image
                  className="rounded-full transition duration-300 ease-in-out m-1 border border-[#fcd00d]"
                  alt="User profile"
                  width={32}
                  height={32}
                  src={profileImage}
                />
              ) : (
                <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_1773_12197"  maskUnits="userSpaceOnUse" x="0" y="0" width="29" height="29">
                <rect width="29" height="29" fill="#D9D9D9"/>
                </mask>
                <g mask="url(#mask0_1773_12197)">
                <path d="M6.69733 21.723C7.83067 20.8821 9.06533 20.218 10.4013 19.7307C11.7371 19.2436 13.1589 19 14.6667 19C16.1744 19 17.5962 19.2436 18.932 19.7307C20.268 20.218 21.5027 20.8821 22.636 21.723C23.4649 20.8119 24.1217 19.7572 24.6063 18.559C25.091 17.3608 25.3333 16.0633 25.3333 14.6667C25.3333 11.7111 24.2944 9.19444 22.2167 7.11667C20.1389 5.03889 17.6222 4 14.6667 4C11.7111 4 9.19444 5.03889 7.11667 7.11667C5.03889 9.19444 4 11.7111 4 14.6667C4 16.0633 4.24233 17.3608 4.727 18.559C5.21167 19.7572 5.86844 20.8119 6.69733 21.723ZM14.667 15.6667C13.4497 15.6667 12.4231 15.2489 11.5873 14.4133C10.7513 13.5776 10.3333 12.551 10.3333 11.3337C10.3333 10.1163 10.7511 9.08978 11.5867 8.254C12.4224 7.418 13.449 7 14.6663 7C15.8837 7 16.9102 7.41778 17.746 8.25333C18.582 9.08911 19 10.1157 19 11.333C19 12.5503 18.5822 13.5769 17.7467 14.4127C16.9109 15.2487 15.8843 15.6667 14.667 15.6667ZM14.6667 27.3333C12.9078 27.3333 11.2578 27.0026 9.71667 26.341C8.17556 25.6794 6.835 24.7786 5.695 23.6383C4.55478 22.4983 3.65389 21.1578 2.99233 19.6167C2.33078 18.0756 2 16.4256 2 14.6667C2 12.9078 2.33078 11.2578 2.99233 9.71667C3.65389 8.17556 4.55478 6.835 5.695 5.695C6.835 4.55478 8.17556 3.65389 9.71667 2.99233C11.2578 2.33078 12.9078 2 14.6667 2C16.4256 2 18.0756 2.33078 19.6167 2.99233C21.1578 3.65389 22.4983 4.55478 23.6383 5.695C24.7786 6.835 25.6794 8.17556 26.341 9.71667C27.0026 11.2578 27.3333 12.9078 27.3333 14.6667C27.3333 16.4256 27.0026 18.0756 26.341 19.6167C25.6794 21.1578 24.7786 22.4983 23.6383 23.6383C22.4983 24.7786 21.1578 25.6794 19.6167 26.341C18.0756 27.0026 16.4256 27.3333 14.6667 27.3333ZM14.6667 25.3333C15.87 25.3333 17.0302 25.1398 18.1473 24.7527C19.2644 24.3653 20.2563 23.8239 21.123 23.1283C20.2563 22.4581 19.2773 21.9359 18.186 21.5617C17.0944 21.1872 15.9213 21 14.6667 21C13.412 21 12.2368 21.185 11.141 21.555C10.0452 21.9252 9.06833 22.4497 8.21033 23.1283C9.077 23.8239 10.0689 24.3653 11.186 24.7527C12.3031 25.1398 13.4633 25.3333 14.6667 25.3333ZM14.6667 13.6667C15.33 13.6667 15.8847 13.4436 16.3307 12.9973C16.7769 12.5513 17 11.9967 17 11.3333C17 10.67 16.7769 10.1153 16.3307 9.66933C15.8847 9.22311 15.33 9 14.6667 9C14.0033 9 13.4487 9.22311 13.0027 9.66933C12.5564 10.1153 12.3333 10.67 12.3333 11.3333C12.3333 11.9967 12.5564 12.5513 13.0027 12.9973C13.4487 13.4436 14.0033 13.6667 14.6667 13.6667Z" fill="white"/>
                </g>
                </svg>
                
              )}
            </button>
            {/* <DropDownMenu options={sidebarItems} qrCode={qrCodeImage} /> */}
            {isDropdownVisible && (
              <div
                ref={dropdownRef}
                className="absolute bg-white top-16 right-8 rounded-lg z-10"
              >
                <div className="pt-8 px-8 pb-2">
                  <div className="flex items-center">
                    {profileImage ? (
                      <Image
                        className="rounded-full w-fit h-4/5"
                        alt="logo"
                        width={50}
                        height={30}
                        src={profileImage}
                      />
                    ) : (
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.63091 15.4212C4.48091 14.7905 5.40691 14.2924 6.40891 13.9269C7.41074 13.5616 8.47708 13.3789 9.60791 13.3789C10.7387 13.3789 11.8051 13.5616 12.8069 13.9269C13.8089 14.2924 14.7349 14.7905 15.5849 15.4212C16.2066 14.7378 16.6992 13.9468 17.0627 13.0482C17.4262 12.1495 17.6079 11.1764 17.6079 10.1289C17.6079 7.91224 16.8287 6.02474 15.2704 4.46641C13.7121 2.90807 11.8246 2.12891 9.60791 2.12891C7.39124 2.12891 5.50374 2.90807 3.94541 4.46641C2.38708 6.02474 1.60791 7.91224 1.60791 10.1289C1.60791 11.1764 1.78966 12.1495 2.15316 13.0482C2.51666 13.9468 3.00924 14.7378 3.63091 15.4212ZM9.60816 10.8789C8.69516 10.8789 7.92524 10.5656 7.29841 9.93891C6.67141 9.31207 6.35791 8.54216 6.35791 7.62916C6.35791 6.71616 6.67124 5.94624 7.29791 5.31941C7.92474 4.69241 8.69466 4.37891 9.60766 4.37891C10.5207 4.37891 11.2906 4.69224 11.9174 5.31891C12.5444 5.94574 12.8579 6.71566 12.8579 7.62866C12.8579 8.54166 12.5446 9.31157 11.9179 9.93841C11.2911 10.5654 10.5212 10.8789 9.60816 10.8789ZM9.60791 19.6289C8.28874 19.6289 7.05124 19.3808 5.89541 18.8847C4.73958 18.3885 3.73416 17.7128 2.87916 16.8577C2.02399 16.0027 1.34833 14.9972 0.85216 13.8414C0.355994 12.6856 0.10791 11.4481 0.10791 10.1289C0.10791 8.80974 0.355994 7.57224 0.85216 6.41641C1.34833 5.26057 2.02399 4.25516 2.87916 3.40016C3.73416 2.54499 4.73958 1.86932 5.89541 1.37316C7.05124 0.87699 8.28874 0.628906 9.60791 0.628906C10.9271 0.628906 12.1646 0.87699 13.3204 1.37316C14.4762 1.86932 15.4817 2.54499 16.3367 3.40016C17.1918 4.25516 17.8675 5.26057 18.3637 6.41641C18.8598 7.57224 19.1079 8.80974 19.1079 10.1289C19.1079 11.4481 18.8598 12.6856 18.3637 13.8414C17.8675 14.9972 17.1918 16.0027 16.3367 16.8577C15.4817 17.7128 14.4762 18.3885 13.3204 18.8847C12.1646 19.3808 10.9271 19.6289 9.60791 19.6289ZM9.60791 18.1289C10.5104 18.1289 11.3806 17.9837 12.2184 17.6934C13.0562 17.4029 13.8002 16.9968 14.4502 16.4752C13.8002 15.9725 13.0659 15.5808 12.2474 15.3002C11.4287 15.0193 10.5489 14.8789 9.60791 14.8789C8.66691 14.8789 7.78549 15.0177 6.96366 15.2952C6.14183 15.5728 5.40916 15.9662 4.76566 16.4752C5.41566 16.9968 6.15958 17.4029 6.99741 17.6934C7.83524 17.9837 8.70541 18.1289 9.60791 18.1289ZM9.60791 9.37891C10.1054 9.37891 10.5214 9.21157 10.8559 8.87691C11.1906 8.54241 11.3579 8.12641 11.3579 7.62891C11.3579 7.13141 11.1906 6.71541 10.8559 6.38091C10.5214 6.04624 10.1054 5.87891 9.60791 5.87891C9.11041 5.87891 8.69441 6.04624 8.35991 6.38091C8.02524 6.71541 7.85791 7.13141 7.85791 7.62891C7.85791 8.12641 8.02524 8.54241 8.35991 8.87691C8.69441 9.21157 9.11041 9.37891 9.60791 9.37891Z"
                          fill="#CFCFCF"
                        />
                      </svg>
                    )}

                    <div className="ml-8 mr-4">
                      <p className="default-font text-base leading-5 text-black">
                        {userData?.name}
                      </p>
                      <p className="default-font text-base leading-5 pt-2 text-comp-natural-base">
                        {userData?.custNo}
                      </p>
                      <div className="flex space-x-2 pt-2">
                        {[...Array(starLevel)].map((_, index) => (
                           <div key={index}>
                            <Image
                              key={index}
                              width={20}
                              height={20}
                              src={Star.src}
                              alt="star"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex pt-6 justify-between pb-4">
                    <div className="flex flex-col grow">
                      <p className="gotham-font text-base">Point</p>
                      <p className="default-font text-xs text-comp-gray-text">
                        สำหรับแลกรางวัล
                      </p>
                    </div>
                    <div className="flex justify-between grow-2">
                      <div className="flex flex-col">
                        <p className="gotham-font text-base self-end">
                          {userData
                            ? userData.rewardPoint
                              ? userData.rewardPoint
                              : 0
                            : 0}
                        </p>
                        <p className="default-font text-xs text-comp-gray-text self-end">
                          คะแนน
                        </p>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="flex pt-6 justify-between py-4">
                    <div className="flex flex-col grow">
                      <p className="gotham-font text-base">Credit</p>
                      <p className="default-font text-xs text-comp-gray-text">{`${payment} วัน`}</p>
                    </div>
                    <div className="flex justify-between grow-2">
                      <div className="flex flex-col">
                        <p className="gotham-font text-base self-end">
                          {userData
                            ? userData.data?.CreditPoint[0]
                              ? userData.data?.CreditPoint[0]
                              : 0
                            : 0}
                        </p>
                        <p className="default-font text-xs text-comp-gray-text self-end">
                          บาท
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <LanguageChanger />

                    <div className="flex items-center text-comp-red text-sm px-12 gotham-font">
                      <svg
                        width="14"
                        height="15"
                        viewBox="0 0 14 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5.10997 1.50918L5.1858 1.50918C7.7758 1.50918 9.02414 2.53001 9.23997 4.81668C9.2633 5.05584 9.0883 5.27168 8.8433 5.29501C8.60997 5.31834 8.3883 5.13751 8.36497 4.89834C8.1958 3.06668 7.33247 2.38418 5.17997 2.38418L5.10414 2.38418C2.72997 2.38418 1.88997 3.22418 1.88997 5.59834L1.88997 9.40168C1.88997 11.7758 2.72997 12.6158 5.10414 12.6158L5.17997 12.6158C7.34414 12.6158 8.20747 11.9217 8.36497 10.055C8.39414 9.81584 8.5983 9.63501 8.8433 9.65834C9.0883 9.67584 9.2633 9.89168 9.2458 10.1308C9.04747 12.4525 7.7933 13.4908 5.1858 13.4908L5.10997 13.4908C2.24581 13.4908 1.02081 12.2658 1.02081 9.40168L1.0208 5.59834C1.0208 2.73418 2.2458 1.50918 5.10997 1.50918Z"
                          fill="#DD2C37"
                        />
                        <path
                          d="M5.24997 7.0625L11.8883 7.0625C12.1275 7.0625 12.3258 7.26083 12.3258 7.5C12.3258 7.73917 12.1275 7.9375 11.8883 7.9375L5.24997 7.9375C5.01081 7.9375 4.81247 7.73917 4.81247 7.5C4.81247 7.26083 5.01081 7.0625 5.24997 7.0625Z"
                          fill="#DD2C37"
                        />
                        <path
                          d="M10.5875 5.10826C10.6983 5.10826 10.8091 5.14909 10.8966 5.23659L12.8508 7.19076C13.02 7.35993 13.02 7.63993 12.8508 7.80909L10.8966 9.76326C10.7275 9.93243 10.4475 9.93243 10.2783 9.76326C10.1091 9.5941 10.1091 9.31409 10.2783 9.14493L11.9233 7.49993L10.2783 5.85493C10.1091 5.68576 10.1091 5.40576 10.2783 5.23659C10.36 5.14909 10.4766 5.10826 10.5875 5.10826Z"
                          fill="#DD2C37"
                        />
                      </svg>
                      <p
                        className="ps-2 cursor-pointer text-comp-red"
                        onClick={() =>
                          signOut({ callbackUrl: "/", redirect: true })
                        }
                      >
                        Sign out
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center py-4 rounded-b-lg bg-comp-red-hover">
                  <div className="flex items-center text-comp-red text-sm px-12 gotham-font">
                    <Link
                      className="ps-2 cursor-pointer text-comp-red hover:text-gray-hover"
                      href={"/th"}
                    >
                      Privacy policy
                    </Link>
                  </div>
                  <svg
                    className="self-center text-sm"
                    width="5"
                    height="5"
                    viewBox="0 0 5 5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="2.5" cy="2.5" r="2" fill="#DD2C37" />
                  </svg>

                  <div className="flex items-center text-comp-red text-sm px-12 gotham-font">
                    <Link
                      className="ps-2 cursor-pointer text-comp-red  hover:text-gray-hover"
                      href={"/th"}
                    >
                      Term of service
                    </Link>
                  </div>
                </div>
              </div>
            )}
            <button
              data-collapse-toggle="navbar-sticky"
              type="button"
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 sm:hidden"
              aria-controls="navbar-sticky"
              aria-expanded="false"
            >
              {isOpen ? (
                <XMarkIcon
                  className="w-6 h-6 text-l2t-purple"
                  onClick={onToggle}
                />
              ) : (
                <Bars3Icon
                  className="w-6 h-6 text-l2t-purple"
                  onClick={onToggle}
                />
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
