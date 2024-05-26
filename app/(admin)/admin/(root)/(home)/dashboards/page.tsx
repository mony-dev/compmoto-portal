"use client"
import { useEffect } from 'react';
import IconFooter from '@components/Admin/IconFooter';
import Image from 'next/image';
import Usa from "@public/images/usa.png";
import AccountMock from "@public/images/logo/account-mock.png";
import Star from "@public/images/star.png";
import '@fancyapps/ui/dist/carousel/carousel.css';
import Calendar from "@public/images/calendar.png";
import Total from "@public/images/logo/total-order.png";
import BonusPoint from "@public/images/logo/bonus-point.png";
import Chart from "@public/images/logo/chart.png";
import News from "@public/images/logo/news.png";

const Carousel = typeof window !== 'undefined' ? require('@fancyapps/ui').Carousel : null;

const Dashboard = () => {
  useEffect(() => {
    if (Carousel) {
      new Carousel(document.getElementById('cardSlider'), {
        Navigation: {
          prevTpl:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M15 3l-9 9 9 9"/></svg>',
          nextTpl:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M9 3l9 9-9 9"/></svg>',
        },
        infinite: true,
        center: false,
        slidesPerPage: 'auto',
        transition: false,
        Dots: false,
      });
    }
  }, []);

  return (
    <div className='px-12'>
      <div className='p-4 rounded-lg flex bg-white' style={{boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)`}}>
        <div className='flex border-r-2 border-dashed border-comp-line-gray items-center'>
          <Image
            className="rounded-lg w-fit	h-4/5"
            alt="logo"
            width={150}
            height={30}
            src={AccountMock.src}
          />
          <div className="ml-8 mr-4">
            <p className='default-font text-base leading-5 text-black'>ร้าน ลิขิตเรซซิ่ง​</p>
            <div className='flex space-x-2 pt-2'>
              {[...Array(7)].map((_, index) => (
                <Image key={index} width={20} height={20} src={Star.src} alt="star" />
              ))}
            </div>
            <p className='default-font text-base leading-5 pt-2 text-comp-natural-base'>เข้าสู่ระบบล่าสุด 11/11/2023, 15.30 น.​</p>
            <p className='default-font text-base leading-5 pt-2 text-comp-natural-base'>คะแนนของคุณ <span className=' bg-comp-red-hover p-1 rounded'><span className='text-black'>250 คะแนน</span> | <span className='text-comp-red'>แลกรางวัล</span></span>​</p>
          </div>
        </div>
        <div className='ml-4'>
          <p className='default-font font-medium text-xl text-black leading-7'>รางวัล</p>
          <div className="max-w-6xl mx-auto">
            <div id="cardSlider" className="f-carousel bg-gray-50">
              <div className="f-carousel__viewport px-12">
                <figure className="f-carousel__slide rounded-md border border-comp-red flex justify-start items-center bg-comp-red-hover">
                    <div className="flex-shrink-0">
                      <Image
                        className="w-full rounded-lg"
                        alt="USA trip"
                        width={300}
                        height={400}
                        src={Usa.src}
                      />
                    </div>
                    <div className='pl-4'>
                      <p className='text-comp-red leading-4 default-font'>ทริปอเมริกา</p>
                      <p className='text-base default-font font-semibold text-comp-red'>200<span className='text-comp-red leading-4 font-normal'>คะแนน</span></p>
                      <div className='text-comp-red leading-4 font-normal flex items-center'>
                        <IconFooter src={Calendar.src} alt="Calendar" />
                        <span>10-19 กค</span>
                      </div>
                    </div>
                    <div className='cuts'>
                      <div className='cut'>
                      </div>
                      <div className='cut'>
                      </div>
                      <div className='cut'>
                      </div>
                      <div className='cut'>
                      </div>
                      <div className='cut'>
                      </div>
                      <div className='cut'>
                      </div>
                    </div>
                </figure>
                <figure className="f-carousel__slide rounded-md border border-comp-red flex justify-start items-center bg-comp-red-hover">
                  <div className="flex-shrink-0">
                    <Image
                      className="w-full rounded-lg"
                      alt="USA trip"
                      width={300}
                      height={400}
                      src={Usa.src}
                    />
                  </div>
                  <div className='pl-4'>
                    <p className='text-comp-red leading-4 default-font'>ทริปอเมริกา</p>
                    <p className='text-base default-font font-semibold text-comp-red'>200<span className='text-comp-red leading-4 font-normal'>คะแนน</span></p>
                    <div className='text-comp-red leading-4 font-normal flex items-center'>
                      <IconFooter src={Calendar.src} alt="Calendar" />
                      <span>10-19 กค</span>
                    </div>
                  </div>
                  <div className='cuts'>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                  </div>
                </figure> 
                <figure className="f-carousel__slide rounded-md border border-comp-red flex justify-start items-center bg-comp-red-hover">
                  <div className="flex-shrink-0">
                    <Image
                      className="w-full rounded-lg"
                      alt="USA trip"
                      width={300}
                      height={400}
                      src={Usa.src}
                    />
                  </div>
                  <div className='pl-4'>
                    <p className='text-comp-red leading-4 default-font'>ทริปอเมริกา</p>
                    <p className='text-base default-font font-semibold text-comp-red'>200<span className='text-comp-red leading-4 font-normal'>คะแนน</span></p>
                    <div className='text-comp-red leading-4 font-normal flex items-center'>
                      <IconFooter src={Calendar.src} alt="Calendar" />
                      <span>10-19 กค</span>
                    </div>
                  </div>
                  <div className='cuts'>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                  </div>
                </figure> 
                <figure className="f-carousel__slide rounded-md border border-comp-red flex justify-start items-center bg-comp-red-hover">
                  <div className="flex-shrink-0">
                    <Image
                      className="w-full rounded-lg"
                      alt="USA trip"
                      width={300}
                      height={400}
                      src={Usa.src}
                    />
                  </div>
                  <div className='pl-4'>
                    <p className='text-comp-red leading-4 default-font'>ทริปอเมริกา</p>
                    <p className='text-base default-font font-semibold text-comp-red'>200<span className='text-comp-red leading-4 font-normal'>คะแนน</span></p>
                    <div className='text-comp-red leading-4 font-normal flex items-center'>
                      <IconFooter src={Calendar.src} alt="Calendar" />
                      <span>10-19 กค</span>
                    </div>
                  </div>
                  <div className='cuts'>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                  </div>
                </figure> 
                <figure className="f-carousel__slide rounded-md border border-comp-red flex justify-start items-center bg-comp-red-hover">
                  <div className="flex-shrink-0">
                    <Image
                      className="w-full rounded-lg"
                      alt="USA trip"
                      width={300}
                      height={400}
                      src={Usa.src}
                    />
                  </div>
                  <div className='pl-4'>
                    <p className='text-comp-red leading-4 default-font'>ทริปอเมริกา</p>
                    <p className='text-base default-font font-semibold text-comp-red'>200<span className='text-comp-red leading-4 font-normal'>คะแนน</span></p>
                    <div className='text-comp-red leading-4 font-normal flex items-center'>
                      <IconFooter src={Calendar.src} alt="Calendar" />
                      <span>10-19 กค</span>
                    </div>
                  </div>
                  <div className='cuts'>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                    <div className='cut'>
                    </div>
                  </div>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='mt-4 p-4 rounded-lg flex bg-white' style={{boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)`}}>
        <IconFooter width={2000} height={600} src={Total.src} alt="logo" />
      </div>
      <div className='mt-4 p-4 rounded-lg flex bg-white' style={{boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)`}}>
        {/* <p className='default-font font-medium text-xl text-black leading-7'>ยอดสั่งซื้อรวม</p> */}
        <IconFooter width={2000} height={600} src={BonusPoint.src} alt="logo" />
      </div>
      <div className='mt-4 p-4 rounded-lg flex bg-white' style={{boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)`}}>
        <IconFooter width={2000} height={600} src={Chart.src} alt="logo" />
      </div>
      <div className='mt-4 p-4 rounded-lg flex bg-white' style={{boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)`}}>
        <IconFooter width={2000} height={600} src={News.src} alt="logo" />
      </div>
    </div>
  );
};

export default Dashboard;
