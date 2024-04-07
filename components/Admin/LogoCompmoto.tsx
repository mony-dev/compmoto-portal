import Image from "next/image";
import React from "react";

type LogoCompmotoProps = {
  width: number;
  height: number;
  src?: string;
  alt?: string;
};

const LogoCompmoto = ({ width, height, src, alt }: LogoCompmotoProps) => {
  return (
    <Image width={width} height={height} src={!src ? "" : src} alt={alt as string} className="object-contain max-h-12" />
  );
};

export default LogoCompmoto;
