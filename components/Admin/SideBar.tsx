import {
  ChevronDownIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  UserIcon,
} from "@heroicons/react/24/solid";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams  } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import tw from "twin.macro";

//icon
import GridRed from "../../public/images/logo/grid-red.png";
import GridGrey from "../../public/images/logo/grid-grey.png";
import BagGrey from "../../public/images/logo/bag-grey.png";
import BagRed from "../../public/images/logo/bag-red.png";
import TaskSqureGrey from "../../public/images/logo/task-square-grey.png";
import TaskSqureRed from "../../public/images/logo/task-square-red.png";
import GiftGrey from "../../public/images/logo/gift-grey.png";
import GiftRed from "../../public/images/logo/gift-red.png";
import BoxGrey from "../../public/images/logo/box-grey.png";
import BoxRed from "../../public/images/logo/box-red.png";
import BookGrey from "../../public/images/logo/book-grey.png";
import BookRed from "../../public/images/logo/book-red.png";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../i18nConfig";
import { useCart } from "./Cartcontext";

type SideBarItemProps = {
  title: string;
  icon: JSX.Element;
  items?: SidebarLinkProps[];
  href?: any;
  id: string;
  openMenuId: any;
  forRole: string[];
};

const Hr = styled.hr`
  ${tw`m-2 bg-comp-gray-bg`}
`;
const locale = useCurrentLocale(i18nConfig);

const btnClass = (isSelect: boolean) =>
  `flex w-full rounded-lg	${
    isSelect
      ? "text-comp-red bg-comp-red-hover"
      : "bg-comp-gray-bg text-comp-grey"
  } items-center justify-start pl-8 pr-1 py-4 text-sm ${
    !isSelect && "hover:bg-comp-red-hover"
  } transition-colors duration-75 focus:outline-none flex justify-between`;

type SideBarProps = {
  isOpen: boolean;
  onToggle: () => void;
  href?: any;
  onToggleIconColor?: (menu: string) => void;
  role: string;
  minisizeItems: { name: string }[];
};

type SideBarToggleProps = Omit<SideBarProps, "isOpen">;

export default function SideBar({
  isOpen,
  href,
  onToggle,
  role,
  minisizeItems,
}: SideBarProps) {
  const [iconColor, setIconColor] = useState(false);
  const [menuId, setMenuId] = useState("");
  const [openMenuId, setOpenMenuId] = useState("");
  const [locale, setLocale] = useState('');
  const toggleIconColor = (menu: string) => {
    setIconColor(!iconColor);
    setOpenMenuId((prevMenuId) => (prevMenuId === menu ? "" : menu));
    onToggle();
  };
  const pathname = usePathname();
  const searchParam = useSearchParams();
  const sidebarItems: SideBarItemProps[] = [
    {
      title: "แดชบอร์ด",
      icon: (
        <Image
          src={pathname == `/${locale}/admin/dashboards` ? GridRed : GridGrey}
          alt="Grid Red"
        />
      ),
      href: `/${locale}/admin/dashboards`,
      id: "dashboard",
      openMenuId: openMenuId,
      forRole: ["USER"],
    },
    {
      title: "สั่งซื้อสินค้า",
      icon: (
        <Image src={openMenuId == "shopping" ? BagRed : BagGrey} alt="Cart" />
      ),
      items: minisizeItems ? minisizeItems.map((item) => ({
        title: item.name,
        href: `/${locale}/admin/product?name=${item.name}`,
      })) : [],
      id: "shopping",
      openMenuId: openMenuId,
      forRole: ["USER"],
    },
    {
      title: "สรุปรายการสั่งซื้อ",
      icon: (
        <Image
          src={openMenuId == "orders" ? TaskSqureRed : TaskSqureGrey}
          alt="Order"
        />
      ),
      items: [
        { title: "คำสั่งซื้อทั่วไป", href: `/${locale}/admin/normalOrder` },
        { title: "Back Order", href: `/${locale}/admin/backOrder` },
      ],
      id: "orders",
      openMenuId: openMenuId,
      forRole: ["USER"],
    },
    {
      title: "แลกรางวัล",
      icon: (
        <Image
          src={openMenuId == "rewards" ? GiftRed : GiftGrey}
          alt="Reward"
        />
      ),
      items: [{ title: "รางวัลของฉัน", href: `/${locale}/admin/reward` }],
      id: "rewards",
      openMenuId: openMenuId,
      forRole: ["USER"],
    },
    {
      title: "เคลมสินค้า",
      icon: (
        <Image src={openMenuId == "claims" ? BoxRed : BoxGrey} alt="claim" />
      ),
      items: [
        { title: "กรอกแบบฟอร์มเคลม", href: `/${locale}/admin/new-claim` },
        { title: "รายการเคลมสินค้า", href: `/${locale}/admin/claim-list` },
      ],
      id: "claims",
      openMenuId: openMenuId,
      forRole: ["USER"],
    },
    {
      title: "คู่มือการใช้งาน",
      icon: (
        <Image
          src={pathname == `/${locale}/admin/user-manuals` ? BookRed : BookGrey}
          alt="Grid Red"
        />
      ),
      href: `/${locale}/admin/user-manuals`,
      id: "manual",
      openMenuId: openMenuId,
      forRole: ["USER"],
    },

    {
      title: "จัดการผู้ใช้งาน",
      icon:
        openMenuId == "adminUser" || pathname == `/${locale}/admin/admins` || pathname == `/${locale}/admin/users` || pathname == `/${locale}/admin/userLogs` ? (
          <UserIcon className="size-6 text-comp-red" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 text-comp-grey"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        ),
      items: [
        { title: "ตั้งค่าพนักงาน", href: `/${locale}/admin/admins` },
        { title: "ตั้งค่าผู้ใช้งาน", href: `/${locale}/admin/users` },
        { title: "ข้อมูลการเข้าสู่ระบบ", href: `/${locale}/admin/userLogs` },
      ],
      id: "adminUser",
      openMenuId: openMenuId,
      forRole: ["ADMIN"],
    },
    {
      title: "จัดการแดชบอร์ด",
      icon:
        openMenuId == "adminDashboard" ? (
          <Squares2X2Icon className="size-6 text-comp-red" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
            />
          </svg>
        ),
      items: [
        { title: "ตั้งค่ายอดสั่งซื้อรวม", href: `/${locale}/admin/orderSetting` },
        { title: "ตั้งค่าโบนัสคะแนนพิเศษ", href: `/${locale}/admin/bonusSetting` },
      ],
      id: "adminDashboard",
      openMenuId: openMenuId,
      forRole: ["ADMIN"],
    },
    {
      title: "จัดการมินิไซส์",
      icon:
        openMenuId == "adminMinisize" ? (
          <ShoppingBagIcon className="size-6 text-comp-red" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
        ),
      items: [
        { title: "ตั้งค่ามินิไซส์", href: `/${locale}/admin/adminMinisize` },
        { title: "สินค้า", href: `/${locale}/admin/adminProduct` },
        { title: "โปรโมชั่น", href: `/${locale}/admin/adminPromotion` },
        { title: "สื่อการตลาด", href: `/${locale}/admin/adminMedia` },
        { title: "ข่าว และกิจกรรม", href: `/${locale}/admin/adminNewsAndEvent` },
      ],
      id: "adminMinisize",
      openMenuId: openMenuId,
      forRole: ["ADMIN"],
    },
    {
      title: "จัดการรายการสั่งซื้อ",
      icon:
        openMenuId == "adminOrder" ? (
          <DocumentTextIcon className="size-6 text-comp-red" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
        ),
      items: [
        { title: "รายการสั่งซื้อทั่วไป", href: `/${locale}/admin/adminOrder` },
        { title: "Back Order", href: `/${locale}/admin/adminBackOrder` },
        { title: "รายการเคลมสินค้า", href: `/${locale}/admin/adminClaim` },
      ],
      id: "adminOrder",
      openMenuId: openMenuId,
      forRole: ["ADMIN", "SALE"],
    },
    {
      title: "จัดการแลกรางวัล",
      icon: (
        <Image
          src={openMenuId == "adminReward" ? GiftRed : GiftGrey}
          alt="Reward"
        />
      ),
      items: [
        { title: "รายการแลกรางวัล", href: `/${locale}/admin/adminRewardOrder` },
        { title: "หมวดหมู่แลกรางวัล", href: `/${locale}/admin/adminRewardCategory` },
               ],
      id: "adminReward",
      openMenuId: openMenuId,
      forRole: ["ADMIN"],
    },
    {
      title: "จัดการคู่มือการใช้งาน",
      icon: (
        <Image
          src={pathname == `/${locale}/admin/adminUserManual` ? BookRed : BookGrey}
          alt="Grid Red"
        />
      ),
      href: `/${locale}/adminUserManual`,
      id: "adminUserManual",
      openMenuId: openMenuId,
      forRole: ["ADMIN"],
    },
    {
      title: "จัดการเคลมสินค้า",
      icon: (
        <Image
          src={pathname == `/${locale}/admin/adminClaim` ? BookRed : BookGrey}
          alt="Grid Red"
        />
      ),
      href: `/${locale}/admin/adminClaim`,
      id: "adminClaim",
      openMenuId: openMenuId,
      forRole: ["CLAIM"],
    },
  ];

  useEffect(() => {
    const match = pathname.match(/^\/(en|th)\//);
    if (match) {
      setLocale(match[1]);
    }
  }, [pathname]);
  return (
    <>
      <aside
        id="default-sidebar"
        className={`bg-comp-gray-bg overflow-x-auto h-screen w-full transition-transform z-10 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0 flex flex-col justify-between`}
        aria-label="Sidebar"
      >
        <div className="overflow-y-auto font-bold hidden-scroll">
          {sidebarItems.map(
            (item, index) =>
              item.forRole.includes(role) && (
                <div key={index + item.title}>
                  <SidebarItem
                    role={role}
                    {...item}
                    onToggle={onToggle}
                    onToggleIconColor={toggleIconColor}
                    openMenuId={openMenuId}
                    minisizeItems={minisizeItems}
                  />
                </div>
              )
          )}
          <Hr />
        </div>
      </aside>
    </>
  );
}

type SidebarLinkProps = {
  title: string;
  href: any;
  icon?: JSX.Element;
};

const SidebarLink: React.FC<SidebarLinkProps & SideBarToggleProps> = ({
  title,
  href,
  icon,
  onToggle,
}) => {
  const pathname = usePathname();
  const searchParam = useSearchParams();
  const name = searchParam.get("name");
  const {setLoadPage} = useCart();

  const isSelect = pathname.startsWith(href) || (href.includes(`name=${name}`));
  const btnClassWithLine = (isSelect: boolean) =>
    `relative flex w-full rounded-lg ${
      isSelect ? "text-comp-red" : "bg-comp-gray-bg text-comp-grey"
    } items-center justify-start pl-8 pr-1 py-1 text-sm transition-colors duration-75 focus:outline-none`;

  const verticalLine = `absolute left-0 top-0 bottom-0 w-1 bg-gray-300`;
  return (
    <Link href={href} onClick={() => !isSelect && setLoadPage(true)}>
      <div className="ml-2 pl-8">
        <button className={`${btnClassWithLine(isSelect)} `} onClick={onToggle}>
          <div className={verticalLine}></div>
          <div
            className={`hover:bg-comp-red-hover p-2.5 rounded-lg ${
              isSelect && "bg-comp-red-hover"
            }`}
          >
            <span className={`flex items-center gap-2`}>
              {icon && <div className="w-6 h-6">{icon}</div>}
              {title}
            </span>
          </div>
          <div className="absolute left-[1px] top-1/2 h-0.5 bg-gray-300 right-0 w-6 rounded-full"></div>{" "}
          {/* Extended Horizontal line */}
        </button>
      </div>
    </Link>
  );
};

const SidebarItem: React.FC<SideBarItemProps & SideBarToggleProps> = (
  props
) => {
  const pathname = usePathname();
  const routeList = props.items ? props.items.map((item) => item.href) : [];
  const isCurrentRoute = routeList.some((path) => path === pathname);
  const isSelect = props.id === props.openMenuId;
  
  const setColor = (id: string) => {
    props.onToggleIconColor && props.onToggleIconColor(id);
  };
  return (
    <div className="bg-comp-grey-bg">
      {props.href ? (
        <Link
          href={props.href}
          aria-controls="dropdown-sidebar"
          data-collapse-toggle="dropdown-sidebar"
        >
          <button
            className={btnClass(isSelect || props.href === pathname)}
            onClick={props.onToggle}
          >
            <span className="flex justify-between items-center gap-2">
              <div className="w-6 h-6">{props.icon}</div>
              {props.title}
            </span>
          </button>
        </Link>
      ) : (
        <button
          aria-controls="dropdown-sidebar"
          data-collapse-toggle="dropdown-sidebar"
          className={btnClass(isSelect || isCurrentRoute)}
          onClick={() => setColor(props.id)}
        >
          <div className="flex justify-start items-center gap-2 w-max rounded-lg">
            <div className="w-6 h-6">{props.icon}</div>
            {props.title}
          </div>
          <ChevronDownIcon
            className={`w-6 h-6 transition-transform duration-200 ${
              isSelect && "rotate-180"
            }`}
          />
        </button>
      )}
      {props.items && (
        <div
          className={`grid transition-all duration-200 ${
            isSelect ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <ul className="overflow-hidden transition-all duration-200">
            {props.items.map((item) => (
              <li key={item.title}>
                <SidebarLink
                  role={props.role}
                  {...item}
                  onToggle={props.onToggle}
                  minisizeItems={props.minisizeItems}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
