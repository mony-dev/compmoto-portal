import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { UserCircleIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
// import { useTranslation } from "../../lib/shared/translations/i18n-client";
import { useEffect, useMemo, useState } from "react";
import axios from "@lib-services/axios";
import Image from "next/image";

import LogoComp from "./LogoCompmoto";
import IconCompmoto from "./IconCompmoto"
import LogoCOM from "../../public/images/comp_moto_logo.png";
import SearchIcon from "../../public/images/logo/search.png";
import BagIcon from "../../public/images/logo/bag.png";
import NoticeIcon from "../../public/images/logo/notification.png";
import AccountMock from "../../public/images/logo/account-mock.png";

// import { DropDownMenu } from "./DropDownMenu";
import { BLACK_BG_COLOR } from "@components/Colors";
// import BaseResponse from "@lib-utils/responses";
// import { handleAPIError } from "@lib-utils/helper";

type NavBarProps = {
  isOpen: boolean;
  onToggle: () => void;
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

const NavBar = ({ onToggle, isOpen }: NavBarProps) => {
  // const { data: session } = useSession();
  // const { i18n } = useTranslation();
  // const { t } = useTranslation("admin");
  // const [qrCodeImage, setQrCodeImage] = useState("");

  // useEffect(() => {
  //   if (!session) return;
  //   const getData = async (id: string) => {
  //     const {
  //       data: { data },
  //     } = await axios(`companies/${id}`);
  //     setCompanyData(data);
  //   };
  //   getData(session.companyId as string);
  // }, [session]);

  // useEffect(() => {
  //   async function fetchQrCode() {
  //     try {
  //       const response = await axios.get<BaseResponse<SettingJSON[]>>("/settings");
  //       const data: SettingJSON[] = response.data.data;
  //       const referenceToFind = "qr_code_down_load_app";
  //       const qrCodeData = data.find((item) => item.reference === referenceToFind);

  //       // Check if the reference exists and get the value if it does
  //       if (qrCodeData) {
  //         const qrCodeValue: any = qrCodeData.value;
  //         setQrCodeImage(qrCodeValue);
  //       } else {
  //         setQrCodeImage("");
  //       }
  //     } catch (error) {
  //       handleAPIError(error);
  //     }
  //   }
  //   fetchQrCode();
  // }, [NavBar, t]);

  // TODO: use this to change the language for later
  // function changeLanguage() {
  //   i18n.changeLanguage("th-TH");
  // }
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

  return (
    <>
      <nav className="fixed top-0 z-20 w-full border border-slate-500" style={{ background: `linear-gradient(90deg, ${BLACK_BG_COLOR} 0%, rgba(27, 27, 27, 0.9) 100%)`, boxShadow: `0px 4px 4px 0px #00000040`}}>
        <div className="flex flex-wrap items-center justify-between p-2 mx-auto">
          <Link href={"/admin/dashboards"} className="relative flex items-center ">
            <LogoComp src={LogoCOM.src} width={175} height={45} alt="logo" />
          </Link>
          {/* <button onClick={changeLanguage}>change lang</button> */}
          <div className="flex">
            {/* <Link href="/admin/admin-profile"> */}
            <button type="button" className="inline-flex items-center p-2.5 text-gray-500 rounded-lg">
                <IconCompmoto src={SearchIcon.src} alt="logo" />
                <IconCompmoto src={BagIcon.src} alt="logo" />
                <IconCompmoto src={NoticeIcon.src} alt="logo" />
                <IconCompmoto src={AccountMock.src} alt="logo" />
              </button>
            {/* <DropDownMenu options={sidebarItems} qrCode={qrCodeImage} /> */}
            {/* </Link> */}
            <button
              data-collapse-toggle="navbar-sticky"
              type="button"
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 sm:hidden"
              aria-controls="navbar-sticky"
              aria-expanded="false"
            >
              {isOpen ? (
                <XMarkIcon className="w-6 h-6 text-l2t-purple" onClick={onToggle} />
              ) : (
                <Bars3Icon className="w-6 h-6 text-l2t-purple" onClick={onToggle} />
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
