import Link from "next/link";
import LogoComp from "./LogoCompmoto";
import IconCompmoto from "./IconCompmoto"
import LogoCOM from "../../public/images/comp_moto_logo.png";
import FacebookIcon from "../../public/images/logo/facebook.png";
import LineIcon from "../../public/images/logo/line.png";
import MapIcon from "../../public/images/logo/map.png";
import SmsIcon from "../../public/images/logo/sms.png";
import CallIcon from "../../public/images/logo/sms.png";

import PirelliIcon from "../../public/images/logo/pirelli.png";
import AirsupplyIcon from "../../public/images/logo/airsupply.png";
import HelIcon from "../../public/images/logo/hel.png";
import FerodoIcon from "../../public/images/logo/ferodo.png";
import DidbIcon from "../../public/images/logo/did.png";
import BsbatteryIcon from "../../public/images/logo/bsbattery.png";
import SilkoleneIcon from "../../public/images/logo/silkolene.png";
import RccossatoIcon from "../../public/images/logo/rccossato.png";

import { BLACK_BG_COLOR } from "@components/Colors";
import styled from "styled-components";
import tw from "twin.macro";
import IconFooter from "./IconFooter";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../i18nConfig";

type FooterProps = {
  isOpen: boolean;
};

const Hr = styled.hr`

  ${tw`bg-comp-gray-line mx-24`}
`;

const Footer = ({ isOpen }: FooterProps) => {
  const locale = useCurrentLocale(i18nConfig);

  return (
<footer
  className="z-20 mt-0"
  style={{
    background: `linear-gradient(90deg, ${BLACK_BG_COLOR} 0%, rgba(27, 27, 27, 0.9) 100%)`,
    boxShadow: `0px 4px 4px 0px #00000040`,
  }}
>
  <div className="px-4 sm:px-8 lg:px-24 py-8">
    <div className="flex flex-col lg:flex-row lg:justify-between gap-8">
      {/* col 1 */}
      <div className="flex flex-col">
        <Link href={`/${locale}/admin`} className="relative flex items-start">
          <LogoComp src={LogoCOM.src} width={175} height={45} alt="logo" />
        </Link>
        <p className="text-white pl-5 text-sm pt-4">บริษัท คอมพ์ โมโต จำกัด</p>
        <p className="text-white pl-5 text-sm">
          ที่อยู่ 1696,1698,1690,1692,1694,1688/4 ถนนอ่อนนุช แขวงอ่อนนุช เขตสวนหลวง จ.กรุงเทพมหานคร 10250
        </p>
        <div className="flex pt-4 ml-2 gap-2">
          <IconCompmoto src={FacebookIcon.src} alt="logo" />
          <IconCompmoto src={LineIcon.src} alt="logo" />
          <IconCompmoto src={MapIcon.src} alt="logo" />
        </div>
      </div>

      {/* col 2 */}
      <div className="flex flex-col">
        <p className="text-base font-medium text-white gotham-font">
          Operating Hours
        </p>
        <p className="text-sm gotham-font text-white pt-4 pb-2">
          Monday-Friday 08:30 AM - 05:30 PM
        </p>
        <p className="text-sm gotham-font text-white">
          Saturday 09:00 AM - 04:00 PM
        </p>
        <p className="text-sm gotham-font text-white pt-4">
          (Closed every Sunday)
        </p>
      </div>

      {/* col 3 */}
      <div className="flex flex-col">
        <p className="text-base font-medium text-white gotham-font lg:pl-4">
          Contact
        </p>
        <div className="text-sm gotham-font text-white pt-4 flex gap-2">
          <span className="self-center">
            <IconCompmoto src={SmsIcon.src} alt="logo" />
          </span>
          <p className="self-center break-all">info@comp-moto.com</p>
        </div>
        <div className="text-sm gotham-font text-white flex gap-2">
          <span className="self-center">
            <IconCompmoto src={CallIcon.src} alt="logo" />
          </span>
          <p className="self-center">02-320-1910</p>
        </div>
      </div>
    </div>
  </div>

  {/* brand strip */}
  <div className="px-4 sm:px-8 lg:px-24 border-y-2 border-comp-gray-line">
    <div className="flex flex-wrap justify-center lg:justify-between gap-4 py-4">
      <IconFooter width={90} height={90} src={PirelliIcon.src} alt="logo" />
      <IconFooter width={90} height={90} src={AirsupplyIcon.src} alt="logo" />
      <IconFooter width={90} height={90} src={HelIcon.src} alt="logo" />
      <IconFooter width={90} height={90} src={FerodoIcon.src} alt="logo" />
      <IconFooter width={90} height={90} src={DidbIcon.src} alt="logo" />
      <IconFooter width={90} height={90} src={BsbatteryIcon.src} alt="logo" />
      <IconFooter width={90} height={90} src={SilkoleneIcon.src} alt="logo" />
      <IconFooter width={90} height={90} src={RccossatoIcon.src} alt="logo" />
    </div>
  </div>

  {/* bottom row */}
  <div className="px-4 sm:px-8 lg:px-24 py-6">
    <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
      <p className="font-gotham text-sm text-white">
        ©2023 COMP MOTO CO.,LTD, All right reserved.
      </p>

      <p className="font-gotham text-sm text-white flex flex-wrap gap-x-4 gap-y-2">
        <span className="cursor-pointer hover:opacity-80">Privacy Policy</span>
        <span className="cursor-pointer hover:opacity-80">Terms of Service</span>
        <span className="cursor-pointer hover:opacity-80">Cookies Settings</span>
      </p>
    </div>
  </div>
</footer>

  );
};

export default Footer;
