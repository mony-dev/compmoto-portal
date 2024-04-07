// import Image from "next/image";
// import React from "react";

// type IconCompmotoProps = {
//   src?: string;
//   alt?: string;
// };

// const IconFooter = ({ src, alt }: IconCompmotoProps) => {
//   return (
//     <div className="">
//       <Image width={20} height={20} src={!src ? "" : src} alt={alt as string} className="object-contain icon-footer m-2.5" />
//     </div>
//   );
// };

// export default IconFooter;


import Image from "next/image";
import React from "react";

type IconFooterProps = {
  width?: number;
  height?: number;
  src?: string;
  alt?: string;
};

const IconFooter = ({ width=20, height=20, src, alt }: IconFooterProps) => {
  return (
    <Image width={width} height={height} src={!src ? "" : src} alt={alt as string} className="" />
  );
};

export default IconFooter;
