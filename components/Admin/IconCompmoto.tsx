import Image from "next/image";
import React from "react";

type IconCompmotoProps = {
  src?: string;
  alt?: string;
};

const IconCompmoto = ({ src, alt }: IconCompmotoProps) => {
  return (
    <div className="">
      <Image width={20} height={20} src={!src ? "" : src} alt={alt as string} className="object-contain w-6 h-6 m-2.5" />
    </div>
  );
};

export default IconCompmoto;
