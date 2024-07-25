import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { signOut, useSession } from "next-auth/react";
// import { useTranslation } from "../../lib/shared/translations/i18n-client";
import { useEffect, useMemo, useState } from "react";
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

type NavBarProps = {
  isOpen: boolean;
  onToggle: () => void;
  userData: {
    name: string;
    email: string;
    rewardPoint: number;
    creditPoint: number;
    data: {
      CreditPoint: string[];
      RewardPoint: string[];
      CustPriceGroup: string[];
      PaymentTerms: string[];
    };
  };
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

const NavBar = ({ onToggle, isOpen, userData }: NavBarProps) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [starLevel, setStarLevel] = useState(0);
  const [payment, setPayment] = useState("0");

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
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 z-20 w-full border border-slate-500"
        style={{
          background: `linear-gradient(90deg, ${BLACK_BG_COLOR} 0%, rgba(27, 27, 27, 0.9) 100%)`,
          boxShadow: `0px 4px 4px 0px rgba(0, 0, 0, 0.25)`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between p-2 mx-auto">
          <Link
            href={"/admin"}
            className="relative flex items-center "
          >
            <LogoComp src={LogoCOM.src} width={175} height={45} alt="logo" />
          </Link>
          {/* <button onClick={changeLanguage}>change lang</button> */}
          <div className="flex p-2.5">
            <button
              type="button"
              className="inline-flex items-center  text-gray-500 rounded-lg"
            >
              <IconCompmoto src={SearchIcon.src} alt="logo" />
            </button>
            <button
              type="button"
              className="inline-flex items-center text-gray-500 rounded-lg"
            >
              <IconCompmoto src={BagIcon.src} alt="logo" />
            </button>
            <button
              type="button"
              className="inline-flex items-center text-gray-500 rounded-lg"
            >
              <IconCompmoto src={NoticeIcon.src} alt="logo" />
            </button>
            <button
              type="button"
              className="inline-flex items-center text-gray-500 rounded-lg"
              onClick={() => setDropdownVisible(!isDropdownVisible)}
            >
              <IconCompmoto src={AccountMock.src} alt="logo" />
            </button>
            {/* <DropDownMenu options={sidebarItems} qrCode={qrCodeImage} /> */}
            {isDropdownVisible && (
              <div className="absolute bg-white top-16 right-8 rounded-lg">
                <div className="pt-8 px-8 pb-2">
                  <div className="flex items-center">
                    <Image
                      className="rounded-lg w-fit	h-4/5"
                      alt="logo"
                      width={50}
                      height={30}
                      src={AccountMock.src}
                    />
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
                          {userData ? (userData.rewardPoint ? userData.rewardPoint : 0) : 0}
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
                          {userData ? (userData.data?.CreditPoint[0] ? userData.data?.CreditPoint[0] : 0) : 0}
                        </p>
                        <p className="default-font text-xs text-comp-gray-text self-end">
                          บาท
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
               
                    <LanguageChanger/>

                    <div className="flex items-center text-comp-red text-sm px-12	gotham-font">
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
                        className="ps-2 cursor-pointer	text-comp-red"
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
                  <div
                    className="flex items-center text-comp-red text-sm px-12	gotham-font"
                  >
                    <Link
                      className="ps-2 cursor-pointer	text-comp-red hover:text-gray-hover"
                      href={"/en"}
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

                  <div className="flex items-center text-comp-red text-sm px-12	gotham-font">
                    <Link
                      className="ps-2 cursor-pointer	text-comp-red  hover:text-gray-hover"
                      href={"/en"}
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
