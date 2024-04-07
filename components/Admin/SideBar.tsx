import { ChevronDownIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import tw from "twin.macro";

//icon
import GridRed from "../../public/images/logo/grid-red.png";
import GridGrey from "../../public/images/logo/grid-grey.png";
import BagGrey from "../../public/images/logo/bag-grey.png";
import BagRed from "../../public/images/logo/bag-red.png";
import TaskSqureGrey from "../../public/images/logo/task-square-grey.png"
import TaskSqureRed from "../../public/images/logo/task-square-red.png";
import GiftGrey from "../../public/images/logo/gift-grey.png"
import GiftRed from "../../public/images/logo/gift-red.png";
import BoxGrey from "../../public/images/logo/box-grey.png"
import BoxRed from "../../public/images/logo/box-red.png";
import BookGrey from "../../public/images/logo/book-grey.png"
import BookRed from "../../public/images/logo/book-red.png";
import { log } from "console";
import Footer from "./Footer";

type SideBarItemProps = {
  title: string;
  icon:  JSX.Element;
  items?: SidebarLinkProps[];
  href?: any;
  id: string;
};

const Hr = styled.hr`
  ${tw`m-2 bg-comp-gray-bg`}
`;

const btnClass = (isSelect: boolean) =>
  `flex w-full rounded-lg	${isSelect ? "text-comp-red bg-comp-red-hover" : "bg-comp-gray-bg text-comp-grey"} items-center justify-start pl-8 pr-1 py-4 text-sm ${
    !isSelect && "hover:bg-comp-red-hover"
  } transition-colors duration-75 focus:outline-none flex justify-between`;

type SideBarProps = {
  isOpen: boolean;
  onToggle: () => void;
  href?: any;
  onToggleIconColor?: (menu: string) => void;
};

type SideBarToggleProps = Omit<SideBarProps, "isOpen">;

export default function SideBar({ isOpen, href, onToggle }: SideBarProps) {
  const [iconColor, setIconColor] = useState(false);
  const [menuId, setMenuId] = useState('');

  const toggleIconColor = (menu: string) => {
    setIconColor(!iconColor);
    setMenuId(menu);
    onToggle();
  };
  const pathname = usePathname();
  const { t } = useTranslation("admin");
  const sidebarItems: SideBarItemProps[] = [
    {
      title: "แดชบอร์ด",
      icon: <Image src={ pathname == '/admin/dashboards' ?  GridRed : GridGrey} alt="Grid Red" /> ,
      href: "/admin/dashboards",
      id: "dashboard"
    },
    {
      title: "สั่งซื้อสินค้า",
      icon: <Image src={menuId == 'shopping' && iconColor ?  BagRed : BagGrey} alt="Cart" />,
      items: [
        { title: "Accossato", href: "/admin/shoping" },
        { title: "Air Supply", href: "/admin/shoping" },
        { title: "BS Battery", href: "/admin/shoping" },
        { title: "DID", href: "/admin/shoping" },
        { title: "Dynavolt", href: "/admin/shoping" },
        { title: "Ferodo", href: "/admin/shoping" },
        { title: "Fuchs", href: "/admin/shoping" },
        { title: "Pirelli", href: "/admin/shoping" },
      ],
      id: "shopping"
    },
    {
      title: "สรุปรายการสั่งซื้อ",
      icon: <Image src={menuId == 'orders' && iconColor ? TaskSqureRed : TaskSqureGrey} alt="Order" />,
      items: [
        { title: "คำสั่งซื้อทั่วไป", href: "/admin/normal-order" },
        { title: "Back Order", href: "/admin/back-order" },
      ],
      id: "orders"
    },
    {
      title: "แลกรางวัล",
      icon: <Image src={menuId == 'rewards' && iconColor ? GiftRed : GiftGrey} alt="Reward" />,
      items: [
        { title: "รางวัลของฉัน", href: "/admin/my-reward" },
      ],
      id: "rewards"
    },
    {
      title: "เคลมสินค้า",
      icon: <Image src={menuId == 'claims' && iconColor ? BoxRed : BoxGrey} alt="claim" />,
      items: [
        { title: "กรอกแบบฟอร์มเคลม", href: "/admin/new-claim" },
        { title: "รายการเคลมสินค้า", href: "/admin/claim-list" },
      ],
      id: "claims"
    },
    {
      title: "คู่มือการใช้งาน",
      icon: <Image src={ pathname == '/admin/user-manuals' ? BookRed : BookGrey} alt="Grid Red" /> ,
      href: "/admin/user-manuals",
      id: "manual"
    },
  ];

  return (
    <>
      <aside
        id="default-sidebar"
        className={`bg-comp-gray-bg fixed py-10 overflow-x-auto sm:mt-0 top-0 left-0 h-screen w-full sm:w-64 pr-8 transition-transform z-10 bg-white ${isOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0 border border-slate-500 flex flex-col justify-between`}
        aria-label="Sidebar"
      >
        <div className="mt-16 overflow-y-auto font-bold hidden-scroll">
          {sidebarItems.map((item, index) => (
            <div key={index + item.title}>
              <SidebarItem {...item} onToggle={onToggle} onToggleIconColor={toggleIconColor} />
            </div>
          ))}
          <Hr />
          {/* <button className={btnClass(false)} onClick={() => signOut()}>
        <span className="flex items-center gap-2">
          <ArrowLeftOnRectangleIcon className="w-6 h-6" />
          {t("sidebar.signout")}
        </span>
      </button> */}
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

const SidebarLink: React.FC<SidebarLinkProps & SideBarToggleProps> = ({ title, href, icon, onToggle }) => {
  const pathname = usePathname();
  const isSelect = pathname.includes(href);
  const btnClassWithLine = (isSelect: boolean) =>
    `relative flex w-full rounded-lg ${isSelect ? "text-comp-red" : "bg-comp-gray-bg text-comp-grey"} items-center justify-start pl-8 pr-1 py-1 text-sm transition-colors duration-75 focus:outline-none`;

  const verticalLine = `absolute left-0 top-0 bottom-0 w-1 bg-gray-300`;

  return (
    <Link href={href}>
      <div className="ml-2 pl-8">
        <button className={`${btnClassWithLine(isSelect)} `} onClick={onToggle}>
          <div className={verticalLine}></div>
          <div className={`hover:bg-comp-red-hover p-2.5 rounded-lg ${isSelect && "bg-comp-red-hover"}`}>
            <span className={`flex items-center gap-2`}>
              {icon && <div className="w-6 h-6">{icon}</div>}
              {title} 
            </span>
          </div>
          
          <div className="absolute left-[1px] top-1/2 h-0.5 bg-gray-300 right-0 w-6 rounded-full"></div> {/* Extended Horizontal line */}
        </button>
      </div>
    </Link>
  );
};

// const SidebarLink: React.FC<SidebarLinkProps & SideBarToggleProps> = ({ title, href, icon, onToggle }) => {
//   const pathname = usePathname();
//   const isSelect = pathname.includes(href);
//   const btnClassWithLine = (isSelect: boolean) =>
//     `relative flex w-full rounded-lg ${isSelect ? "text-comp-red bg-comp-red-hover" : "bg-comp-gray-bg text-comp-grey"} items-center justify-start pl-8 pr-1 py-4 text-sm ${
//       !isSelect && "hover:bg-comp-red-hover"
//     } transition-colors duration-75 focus:outline-none`;

//   const verticalLine = `absolute left-0 top-0 bottom-0 w-1 bg-comp-natural-gray`;

//   return (
//     <Link href={href}>
//       <button className={`ml-2 pl-8 relative ${btnClassWithLine(isSelect)} ${isSelect && "bg-comp-red-hover"}`} onClick={onToggle}>
//         <div className={verticalLine}></div>
//         <span className="flex items-center gap-2">
//           {icon && <div className="w-6 h-6">{icon}</div>}
//           {title} 
//         </span>
//         <svg className="absolute left-0 top-1/2 transform -translate-y-1/2" height="100%" width="10px" viewBox="0 0 10 10">
//           <path d="M 5 0 Q 5 0 5 5 T 10 10" fill="none" stroke="#D3D7DD" strokeWidth="3" />
//         </svg>
//       </button>
//     </Link>
//   );
// };


const SidebarItem: React.FC<SideBarItemProps & SideBarToggleProps> = (props) => {
  const pathname = usePathname();
  const routeList = props.items ? props.items.map((item) => item.href) : [];
  const isCurrentRoute = routeList.some((path) => path === pathname);
  const [isSelect, setIsSelect] = useState(isCurrentRoute);

  const setColor = (id: string) => {
    setIsSelect(!isSelect); 
    props.onToggleIconColor && props.onToggleIconColor(id);
  };

  return (
    <div className="bg-comp-grey-bg">
      {props.href ? (
        <Link href={props.href} aria-controls="dropdown-sidebar" data-collapse-toggle="dropdown-sidebar">
          <button className={btnClass(isSelect || props.href === pathname)} onClick={props.onToggle}>
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
          <ChevronDownIcon className={`w-6 h-6 transition-transform duration-200 ${isSelect && "rotate-180"}`} />
        </button>
      )}
      {props.items && (
        <div className={`grid transition-all duration-200 ${isSelect ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <ul className="overflow-hidden transition-all duration-200">
            {props.items.map((item) => (
              <li key={item.title}>
                <SidebarLink {...item} onToggle={props.onToggle} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
