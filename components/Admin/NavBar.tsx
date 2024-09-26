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
import IconCompmoto from "./IconCompmoto";
import LogoCOM from "../../public/images/comp_moto_logo.png";
import SearchIcon from "../../public/images/logo/search.png";
import BagIcon from "../../public/images/logo/bag.png";
import NoticeIcon from "../../public/images/logo/notification.png";
import AccountMock from "../../public/images/logo/account-mock.png";
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

  async function fetchUser() {
    try {
      const [userResponse] = await Promise.all([
        axios.get(`/api/updateProfile/${userId}`),
      ]);
      setProfileImage(userResponse.data.image);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }

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
      userData.role === "USER" && fetchUser();
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
          {/* <button onClick={changeLanguage}>change lang</button> */}
          <div className="flex p-2.5">
            {/* <button
              type="button"
              className="inline-flex items-center  text-gray-500 rounded-lg"
            >
              <IconCompmoto src={SearchIcon.src} alt="logo" />
            </button> */}
            <button
              type="button"
              className="inline-flex items-center text-gray-500 rounded-lg"
            >
              <Link href={`/${locale}/admin/cart/${userId}`} className="flex">
                <Badge count={cartItemCount} overflowCount={99}>
                  <svg
                    className="self-center m-1"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.5 8.62993C16.09 8.62993 15.75 8.28993 15.75 7.87993V6.49993C15.75 5.44993 15.3 4.42993 14.52 3.71993C13.73 2.99993 12.71 2.66993 11.63 2.76993C9.83 2.93993 8.25 4.77993 8.25 6.69993V7.66993C8.25 8.07993 7.91 8.41993 7.5 8.41993C7.09 8.41993 6.75 8.07993 6.75 7.66993V6.68993C6.75 3.99993 8.92 1.51993 11.49 1.26993C12.99 1.12993 14.43 1.59993 15.53 2.60993C16.62 3.59993 17.25 5.01993 17.25 6.49993V7.87993C17.25 8.28993 16.91 8.62993 16.5 8.62993Z"
                      fill="white"
                    />
                    <path
                      d="M14.9998 22.75H8.99982C4.37982 22.75 3.51982 20.6 3.29982 18.51L2.54982 12.52C2.43982 11.44 2.39982 9.89 3.44982 8.73C4.34982 7.73 5.83982 7.25 7.99982 7.25H15.9998C18.1698 7.25 19.6598 7.74 20.5498 8.73C21.5898 9.89 21.5598 11.44 21.4498 12.5L20.6998 18.51C20.4798 20.6 19.6198 22.75 14.9998 22.75ZM7.99982 8.75C6.30982 8.75 5.14982 9.08 4.55982 9.74C4.06982 10.28 3.90982 11.11 4.03982 12.35L4.78982 18.34C4.95982 19.94 5.39982 21.26 8.99982 21.26H14.9998C18.5998 21.26 19.0398 19.95 19.2098 18.36L19.9598 12.35C20.0898 11.13 19.9298 10.3 19.4398 9.75C18.8498 9.08 17.6898 8.75 15.9998 8.75H7.99982Z"
                      fill="white"
                    />
                    <path
                      d="M15.4202 13.15C14.8602 13.15 14.4102 12.7 14.4102 12.15C14.4102 11.6 14.8602 11.15 15.4102 11.15C15.9602 11.15 16.4102 11.6 16.4102 12.15C16.4102 12.7 15.9702 13.15 15.4202 13.15Z"
                      fill="white"
                    />
                    <path
                      d="M8.42016 13.15C7.86016 13.15 7.41016 12.7 7.41016 12.15C7.41016 11.6 7.86016 11.15 8.41016 11.15C8.96016 11.15 9.41016 11.6 9.41016 12.15C9.41016 12.7 8.97016 13.15 8.42016 13.15Z"
                      fill="white"
                    />
                  </svg>
                </Badge>
              </Link>
            </button>
            <button
              type="button"
              className="inline-flex items-center text-gray-500 rounded-lg"
            >
              <Badge count={0}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="m-1"
                >
                  <path
                    d="M12.0201 20.5299C9.69005 20.5299 7.36005 20.1599 5.15005 19.4199C4.31005 19.1299 3.67005 18.5399 3.39005 17.7699C3.10005 16.9999 3.20005 16.1499 3.66005 15.3899L4.81005 13.4799C5.05005 13.0799 5.27005 12.2799 5.27005 11.8099V8.91992C5.27005 5.19992 8.30005 2.16992 12.0201 2.16992C15.7401 2.16992 18.7701 5.19992 18.7701 8.91992V11.8099C18.7701 12.2699 18.9901 13.0799 19.2301 13.4899L20.3701 15.3899C20.8001 16.1099 20.8801 16.9799 20.5901 17.7699C20.3001 18.5599 19.6701 19.1599 18.8801 19.4199C16.6801 20.1599 14.3501 20.5299 12.0201 20.5299ZM12.0201 3.66992C9.13005 3.66992 6.77005 6.01992 6.77005 8.91992V11.8099C6.77005 12.5399 6.47005 13.6199 6.10005 14.2499L4.95005 16.1599C4.73005 16.5299 4.67005 16.9199 4.80005 17.2499C4.92005 17.5899 5.22005 17.8499 5.63005 17.9899C9.81005 19.3899 14.2401 19.3899 18.4201 17.9899C18.7801 17.8699 19.0601 17.5999 19.1901 17.2399C19.3201 16.8799 19.2901 16.4899 19.0901 16.1599L17.9401 14.2499C17.5601 13.5999 17.2701 12.5299 17.2701 11.7999V8.91992C17.2701 6.01992 14.9201 3.66992 12.0201 3.66992Z"
                    fill="white"
                  />
                  <path
                    d="M13.8801 3.93993C13.8101 3.93993 13.7401 3.92993 13.6701 3.90993C13.3801 3.82993 13.1001 3.76993 12.8301 3.72993C11.9801 3.61993 11.1601 3.67993 10.3901 3.90993C10.1101 3.99993 9.81005 3.90993 9.62005 3.69993C9.43005 3.48993 9.37005 3.18993 9.48005 2.91993C9.89005 1.86993 10.8901 1.17993 12.0301 1.17993C13.1701 1.17993 14.1701 1.85993 14.5801 2.91993C14.6801 3.18993 14.6301 3.48993 14.4401 3.69993C14.2901 3.85993 14.0801 3.93993 13.8801 3.93993Z"
                    fill="white"
                  />
                  <path
                    d="M12.02 22.8101C11.03 22.8101 10.07 22.4101 9.36996 21.7101C8.66996 21.0101 8.26996 20.0501 8.26996 19.0601H9.76996C9.76996 19.6501 10.01 20.2301 10.43 20.6501C10.85 21.0701 11.43 21.3101 12.02 21.3101C13.26 21.3101 14.27 20.3001 14.27 19.0601H15.77C15.77 21.1301 14.09 22.8101 12.02 22.8101Z"
                    fill="white"
                  />
                </svg>
              </Badge>
            </button>
            <button
              type="button"
              className="inline-flex items-center text-gray-500"
              onClick={() => setDropdownVisible(!isDropdownVisible)}
            >
              {profileImage ? (
                <Image
                  className="rounded-full transition duration-300 ease-in-out m-1"
                  alt="User profile"
                  width={24}
                  height={24}
                  src={profileImage}
                />
              ) : (
                   <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="text-white m-1 rounded-full"
                  width="26"
                  height="26"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
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
                    {profileImage ? 
                        <Image
                        className="rounded-full w-fit h-4/5"
                        alt="logo"
                        width={50}
                        height={30}
                        src={profileImage}
                      />
                      :
                    <svg width="60" height="60" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.63091 15.4212C4.48091 14.7905 5.40691 14.2924 6.40891 13.9269C7.41074 13.5616 8.47708 13.3789 9.60791 13.3789C10.7387 13.3789 11.8051 13.5616 12.8069 13.9269C13.8089 14.2924 14.7349 14.7905 15.5849 15.4212C16.2066 14.7378 16.6992 13.9468 17.0627 13.0482C17.4262 12.1495 17.6079 11.1764 17.6079 10.1289C17.6079 7.91224 16.8287 6.02474 15.2704 4.46641C13.7121 2.90807 11.8246 2.12891 9.60791 2.12891C7.39124 2.12891 5.50374 2.90807 3.94541 4.46641C2.38708 6.02474 1.60791 7.91224 1.60791 10.1289C1.60791 11.1764 1.78966 12.1495 2.15316 13.0482C2.51666 13.9468 3.00924 14.7378 3.63091 15.4212ZM9.60816 10.8789C8.69516 10.8789 7.92524 10.5656 7.29841 9.93891C6.67141 9.31207 6.35791 8.54216 6.35791 7.62916C6.35791 6.71616 6.67124 5.94624 7.29791 5.31941C7.92474 4.69241 8.69466 4.37891 9.60766 4.37891C10.5207 4.37891 11.2906 4.69224 11.9174 5.31891C12.5444 5.94574 12.8579 6.71566 12.8579 7.62866C12.8579 8.54166 12.5446 9.31157 11.9179 9.93841C11.2911 10.5654 10.5212 10.8789 9.60816 10.8789ZM9.60791 19.6289C8.28874 19.6289 7.05124 19.3808 5.89541 18.8847C4.73958 18.3885 3.73416 17.7128 2.87916 16.8577C2.02399 16.0027 1.34833 14.9972 0.85216 13.8414C0.355994 12.6856 0.10791 11.4481 0.10791 10.1289C0.10791 8.80974 0.355994 7.57224 0.85216 6.41641C1.34833 5.26057 2.02399 4.25516 2.87916 3.40016C3.73416 2.54499 4.73958 1.86932 5.89541 1.37316C7.05124 0.87699 8.28874 0.628906 9.60791 0.628906C10.9271 0.628906 12.1646 0.87699 13.3204 1.37316C14.4762 1.86932 15.4817 2.54499 16.3367 3.40016C17.1918 4.25516 17.8675 5.26057 18.3637 6.41641C18.8598 7.57224 19.1079 8.80974 19.1079 10.1289C19.1079 11.4481 18.8598 12.6856 18.3637 13.8414C17.8675 14.9972 17.1918 16.0027 16.3367 16.8577C15.4817 17.7128 14.4762 18.3885 13.3204 18.8847C12.1646 19.3808 10.9271 19.6289 9.60791 19.6289ZM9.60791 18.1289C10.5104 18.1289 11.3806 17.9837 12.2184 17.6934C13.0562 17.4029 13.8002 16.9968 14.4502 16.4752C13.8002 15.9725 13.0659 15.5808 12.2474 15.3002C11.4287 15.0193 10.5489 14.8789 9.60791 14.8789C8.66691 14.8789 7.78549 15.0177 6.96366 15.2952C6.14183 15.5728 5.40916 15.9662 4.76566 16.4752C5.41566 16.9968 6.15958 17.4029 6.99741 17.6934C7.83524 17.9837 8.70541 18.1289 9.60791 18.1289ZM9.60791 9.37891C10.1054 9.37891 10.5214 9.21157 10.8559 8.87691C11.1906 8.54241 11.3579 8.12641 11.3579 7.62891C11.3579 7.13141 11.1906 6.71541 10.8559 6.38091C10.5214 6.04624 10.1054 5.87891 9.60791 5.87891C9.11041 5.87891 8.69441 6.04624 8.35991 6.38091C8.02524 6.71541 7.85791 7.13141 7.85791 7.62891C7.85791 8.12641 8.02524 8.54241 8.35991 8.87691C8.69441 9.21157 9.11041 9.37891 9.60791 9.37891Z" fill="#CFCFCF"/>
                    </svg>
                  }
                
                    <div className="ml-8 mr-4">
                      <p className="default-font text-base leading-5 text-black">
                        {userData?.name}
                      </p>
                      <p className="default-font text-base leading-5 pt-2 text-comp-natural-base">
                        {userData?.email}
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
