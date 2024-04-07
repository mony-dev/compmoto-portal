import IconFooter from '@components/Admin/IconFooter'
import React from 'react'
import RewardTicket from "@public/images/logo/frame.png";
import Total from "@public/images/logo/total-order.png";
import BonusPoint from "@public/images/logo/bonus-point.png";
import Chart from "@public/images/logo/chart.png";
import News from "@public/images/logo/news.png";

import Image from "next/image";

export default function dashboard() {
  return (
   
    <>
      <div className='p-4'>
        <IconFooter width={2000} height={600} src={RewardTicket.src} alt="logo" />
      </div>
      <div className='p-4'>
        <IconFooter width={2000} height={600} src={Total.src} alt="logo" />
      </div>
      <div className='p-4'>
        <IconFooter width={2000} height={600} src={BonusPoint.src} alt="logo" />
      </div>
      <div className='p-4'>
        <IconFooter width={2000} height={600} src={Chart.src} alt="logo" />
      </div>
      <div className='p-4'>
        <IconFooter width={2000} height={600} src={News.src} alt="logo" />
      </div>
    </>
  )
}
