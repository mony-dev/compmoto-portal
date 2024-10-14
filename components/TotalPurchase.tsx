import { useEffect, useState } from "react";
import { Card, Skeleton, Steps } from "antd";
import axios from "axios";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import i18nConfig from "../i18nConfig";
import { useCurrentLocale } from "next-i18n-router/client";
import "../styles/totalPurchase.scss";

const Loading = dynamic(() => import("@components/Loading"));

interface TotalPurchaseProps {
  userId: number; // Pass userId as a prop
}

interface TotalPurchaseItem {
  order: number;
  cn: number;
  incentivePoint: number;
  loyaltyPoint: number;
  totalPurchaseAmount: number;
}

interface totalPurchaseInterface {
  totalSpend: number;
  items: TotalPurchaseItem[];
}

const TotalPurchase: React.FC<TotalPurchaseProps> = ({ userId }) => {
  const [items, setItems] = useState([]);
  const [level, setLevel] = useState(0);
  const [totalPurchase, setTotalPurchase] =
    useState<totalPurchaseInterface | null>(null);
  const locale = useCurrentLocale(i18nConfig);
  const [loading, setLoading] = useState(false);
  const [sumCn, setSumCn] = useState(0);
  const [sumTotal, setSumTotal] = useState(0);

  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    // Fetch total purchase history for the user
    async function fetchTotalPurchaseHistory() {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/totalPurchaseHistory?userId=${userId}`
        );
        const history = response.data.totalPurchaseHistory[0];
        const sumCn = response.data.sumTotalAmount;
        setSumCn(sumCn);

        if (history) {
          setTotalPurchase(history);
          const totalSum = history.totalSpend - sumCn || 0;
          setSumTotal(totalSum);
          const purchaseItems = history.items;
          const userLevel = history.level;
          const stepsItems = purchaseItems.map(
            (item: {
              order: number;
              cn: number;
              incentivePoint: number;
              loyaltyPoint: number;
              totalPurchaseAmount: number;
            }) => ({
              title: "",
              description:
                userLevel >= item.order
                  ? renderActive(
                      item.cn,
                      item.incentivePoint,
                      item.loyaltyPoint,
                      item.totalPurchaseAmount
                    )
                  : renderInactive(
                      item.cn,
                      item.incentivePoint,
                      item.loyaltyPoint,
                      item.totalPurchaseAmount
                    ), // Conditionally render active/inactive
            })
          );

          setItems(stepsItems);
          setLevel(userLevel); // Set current level

          const stepsProgressIcon = document.querySelectorAll(
            ".total-step .ant-steps-progress-icon"
          );

          stepsProgressIcon.forEach((icon) => {
            icon.addEventListener("mouseenter", (event) => {
              const rect = (
                event.target as HTMLElement
              ).getBoundingClientRect();
              console.log(rect);
              setTooltipPosition({
                bottom: 215, // Adjust to position above the icon
                left: rect.left - 340,
              });
              setIsHovered(true);
            });

            icon.addEventListener("mouseleave", () => {
              setIsHovered(false);
            });
          });
        }
      } catch (error) {
        console.error("Error fetching total purchase history:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTotalPurchaseHistory();
  }, [userId]);

  
  // Find the latest order based on the 'order' field in items
  const latestOrder = totalPurchase?.items.reduce((prev, curr) => {
    return prev.order > curr.order ? prev : curr;
  }, totalPurchase?.items[0]);

  // Active template with dynamic data
  const renderActive = (
    cn: number,
    incentivePoint: number,
    loyaltyPoint: number,
    totalPurchaseAmount: number
  ) => (
    <Card
      title={
        <>
          <div className="flex justify-center py-2  gap-2">
            <p className="default-font text-xs text-comp-natural-base">
              {locale === "en" ? "Total purchase" : "ยอดรวม"}
            </p>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.99998 1.33337C4.32665 1.33337 1.33331 4.32671 1.33331 8.00004C1.33331 11.6734 4.32665 14.6667 7.99998 14.6667C11.6733 14.6667 14.6666 11.6734 14.6666 8.00004C14.6666 4.32671 11.6733 1.33337 7.99998 1.33337ZM11.1866 6.46671L7.40665 10.2467C7.31331 10.34 7.18665 10.3934 7.05331 10.3934C6.91998 10.3934 6.79331 10.34 6.69998 10.2467L4.81331 8.36004C4.61998 8.16671 4.61998 7.84671 4.81331 7.65337C5.00665 7.46004 5.32665 7.46004 5.51998 7.65337L7.05331 9.18671L10.48 5.76004C10.6733 5.56671 10.9933 5.56671 11.1866 5.76004C11.38 5.95337 11.38 6.26671 11.1866 6.46671Z"
                fill="#41B264"
              />
            </svg>
          </div>
          <p className="text-comp-red default-font text-xl py-2">
            ฿{totalPurchaseAmount.toLocaleString()}
          </p>
        </>
      }
      bordered={true}
    >
      <div className="flex justify-between gap-4">
        <p className="text-card">CN</p>
        <p className="text-card">{cn}%</p>
      </div>
      <div className="flex justify-between gap-4">
        <p className="text-card">Incentive point</p>
        <p className="text-card">{incentivePoint} Points</p>
      </div>
      <div className="flex justify-between gap-4">
        <p className="text-card">Loyalty point</p>
        <p className="text-card">{loyaltyPoint} Points</p>
      </div>
    </Card>
  );

  // Inactive template with dynamic data
  const renderInactive = (
    cn: number,
    incentivePoint: number,
    loyaltyPoint: number,
    totalPurchaseAmount: number
  ) => (
    <Card
      title={
        <>
          <div className="flex justify-center py-2 gap-2">
            <p className="default-font text-xs text-comp-natural-base">
              {locale === "en" ? "Total purchase" : "ยอดรวม"}
            </p>
            <svg
              width="17"
              height="16"
              viewBox="0 0 17 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.6334 8.83333C14.6334 12.0533 12.0201 14.6667 8.80007 14.6667C5.58007 14.6667 2.96674 12.0533 2.96674 8.83333C2.96674 5.61333 5.58007 3 8.80007 3C12.0201 3 14.6334 5.61333 14.6334 8.83333Z"
                stroke="#BCC2CC"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.80005 5.33337V8.66671"
                stroke="#BCC2CC"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.80005 1.33337H10.8"
                stroke="#BCC2CC"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-[#BCC2CC] default-font text-xl py-2">
            ฿{totalPurchaseAmount.toLocaleString()}
          </p>
        </>
      }
      bordered={true}
      className="inactive-card"
    >
      <div className="flex justify-between gap-4">
        <p className="text-card">CN</p>
        <p className="text-card">{cn}</p>
      </div>
      <div className="flex justify-between gap-4">
        <p className="text-card">Incentive point</p>
        <p className="text-card">{incentivePoint} Points</p>
      </div>
      <div className="flex justify-between gap-4">
        <p className="text-card">Loyalty point</p>
        <p className="text-card">{loyaltyPoint} Points</p>
      </div>
    </Card>
  );

  const levelIcon = (level: number) => {
    switch (level) {
      case 1:
        return (
          <svg
            width="33"
            height="40"
            viewBox="0 0 33 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.91109 29.9373L2.9111 29.9373L2.90654 29.9339C2.43391 29.5784 1.94622 28.9508 1.57466 28.1918C1.20383 27.4343 1 26.6507 1 26.0374V9.92107C1 9.03492 1.33669 8.0481 1.92415 7.18205C2.51162 6.316 3.29393 5.65288 4.09104 5.34291L14.8314 1.24634C15.2412 1.0931 15.8491 0.997822 16.5039 1.00004C17.1618 1.00226 17.7589 1.1025 18.1508 1.25928L18.1583 1.26229L18.1658 1.26517L28.9118 5.36391L28.9144 5.36489C29.7058 5.66422 30.4871 6.32411 31.0758 7.192C31.6639 8.05891 32 9.04572 32 9.92107V26.0374C32 26.65 31.7966 27.4282 31.4258 28.1833C31.0554 28.9379 30.5666 29.57 30.0873 29.9385C30.0867 29.939 30.0861 29.9394 30.0856 29.9399L19.3429 38.1149L19.3402 38.1169C18.5963 38.6871 17.5703 39 16.5 39C15.4297 39 14.4037 38.6871 13.6598 38.1169L13.6571 38.1149L2.91109 29.9373Z"
              fill="url(#paint0_angular_1502_12779)"
              stroke="#DD2C37"
              strokeWidth="2"
            />
            <path
              d="M15.8413 26V15.02L13.4013 15.62L12.7613 13.1L16.7813 11.9H18.8813V26H15.8413Z"
              fill="#DD2C37"
            />
            <defs>
              <radialGradient
                id="paint0_angular_1502_12779"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(17.25 20) rotate(45) scale(19.4454 20.7011)"
              >
                <stop stopColor="#FFCF3D" />
                <stop offset="1" stopColor="white" />
              </radialGradient>
            </defs>
          </svg>
        );
      case 2:
        return (
          <svg
            width="33"
            height="40"
            viewBox="0 0 33 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.91109 29.9373L2.9111 29.9373L2.90654 29.9339C2.43391 29.5784 1.94622 28.9508 1.57466 28.1918C1.20383 27.4343 1 26.6507 1 26.0374V9.92107C1 9.03492 1.33669 8.0481 1.92415 7.18205C2.51161 6.31601 3.29392 5.65289 4.09101 5.34292L14.8314 1.24633C15.2412 1.09309 15.8491 0.997822 16.5039 1.00004C17.1618 1.00226 17.7589 1.1025 18.1508 1.25928L18.1583 1.26229L18.1658 1.26517L28.9118 5.36391L28.9144 5.36489C29.7058 5.66422 30.4871 6.32411 31.0758 7.192C31.6639 8.05891 32 9.04572 32 9.92107V26.0374C32 26.65 31.7966 27.4282 31.4258 28.1833C31.0554 28.9379 30.5666 29.57 30.0873 29.9385C30.0867 29.939 30.0861 29.9394 30.0856 29.9399L19.3429 38.1149L19.3402 38.1169C18.5963 38.6871 17.5703 39 16.5 39C15.4297 39 14.4037 38.6871 13.6598 38.1169L13.6571 38.1149L2.91109 29.9373Z"
              fill="url(#paint0_angular_1502_12773)"
              stroke="#DD2C37"
              strokeWidth="2"
            />
            <path
              d="M11.2495 26V23.56L15.9095 19.74C17.6495 18.3 18.3295 17.54 18.3295 16.38C18.3295 15.2 17.5495 14.56 16.4495 14.56C15.3695 14.56 14.6295 15.16 13.5895 16.44L11.4295 14.7C12.8095 12.82 14.1495 11.8 16.6495 11.8C19.5495 11.8 21.4695 13.5 21.4695 16.12V16.16C21.4695 18.5 20.2695 19.66 17.7895 21.58L15.5095 23.34H21.6095V26H11.2495Z"
              fill="#DD2C37"
            />
            <defs>
              <radialGradient
                id="paint0_angular_1502_12773"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(17.25 20) rotate(45) scale(19.4454 20.7011)"
              >
                <stop stopColor="#FFCF3D" />
                <stop offset="1" stopColor="white" />
              </radialGradient>
            </defs>
          </svg>
        );
      case 3:
        return (
          <svg
            width="33"
            height="40"
            viewBox="0 0 33 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.91109 29.9373L2.9111 29.9373L2.90654 29.9339C2.43391 29.5784 1.94622 28.9508 1.57466 28.1918C1.20383 27.4343 1 26.6507 1 26.0374V9.92107C1 9.03492 1.33669 8.0481 1.92415 7.18205C2.51161 6.31601 3.29392 5.65289 4.09101 5.34292L14.8314 1.24633C15.2412 1.09309 15.8491 0.997822 16.5039 1.00004C17.1618 1.00226 17.7589 1.1025 18.1508 1.25928L18.1583 1.26229L18.1658 1.26517L28.9118 5.36391L28.9144 5.36489C29.7058 5.66422 30.4871 6.32411 31.0758 7.192C31.6639 8.05891 32 9.04572 32 9.92107V26.0374C32 26.65 31.7966 27.4282 31.4258 28.1833C31.0554 28.9379 30.5666 29.57 30.0873 29.9385C30.0867 29.939 30.0861 29.9394 30.0856 29.9399L19.3429 38.1149L19.3402 38.1169C18.5963 38.6871 17.5703 39 16.5 39C15.4297 39 14.4037 38.6871 13.6598 38.1169L13.6571 38.1149L2.91109 29.9373Z"
              fill="url(#paint0_angular_1502_12739)"
              stroke="#DD2C37"
              strokeWidth="2"
            />
            <path
              d="M16.5091 26.24C13.9891 26.24 12.2491 25.24 11.0491 23.82L13.1691 21.8C14.1291 22.88 15.1291 23.48 16.5491 23.48C17.7091 23.48 18.5291 22.82 18.5291 21.78V21.74C18.5291 20.6 17.5091 19.96 15.7891 19.96H14.5091L14.0291 18L17.3691 14.64H11.8691V12H21.3291V14.32L17.7891 17.7C19.6891 18.02 21.5491 19.02 21.5491 21.62V21.66C21.5491 24.3 19.6291 26.24 16.5091 26.24Z"
              fill="#DD2C37"
            />
            <defs>
              <radialGradient
                id="paint0_angular_1502_12739"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(17.25 20) rotate(45) scale(19.4454 20.7011)"
              >
                <stop stopColor="#FFCF3D" />
                <stop offset="1" stopColor="white" />
              </radialGradient>
            </defs>
          </svg>
        );
      case 4:
        return (
          <svg
            width="33"
            height="40"
            viewBox="0 0 33 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.91109 29.9373L2.9111 29.9373L2.90654 29.9339C2.43391 29.5784 1.94622 28.9508 1.57466 28.1918C1.20383 27.4343 1 26.6507 1 26.0374V9.92107C1 9.03492 1.33669 8.0481 1.92415 7.18205C2.51161 6.31601 3.29392 5.65289 4.09101 5.34292L14.8314 1.24633C15.2412 1.09309 15.8491 0.997822 16.5039 1.00004C17.1618 1.00226 17.7589 1.1025 18.1508 1.25928L18.1583 1.26229L18.1658 1.26517L28.9118 5.36391L28.9144 5.36489C29.7058 5.66422 30.4871 6.32411 31.0758 7.192C31.6639 8.05891 32 9.04572 32 9.92107V26.0374C32 26.65 31.7966 27.4282 31.4258 28.1833C31.0554 28.9379 30.5666 29.57 30.0873 29.9385C30.0867 29.939 30.0861 29.9394 30.0856 29.9399L19.3429 38.1149L19.3402 38.1169C18.5963 38.6871 17.5703 39 16.5 39C15.4297 39 14.4037 38.6871 13.6598 38.1169L13.6571 38.1149L2.91109 29.9373Z"
              fill="url(#paint0_angular_1502_12729)"
              stroke="#DD2C37"
              strokeWidth="2"
            />
            <path
              d="M17.0655 26V22.98H10.2255L9.72547 20.8L17.4055 11.9H20.0055V20.48H21.8855V22.98H20.0055V26H17.0655ZM13.3455 20.48H17.0655V16.12L13.3455 20.48Z"
              fill="#DD2C37"
            />
            <defs>
              <radialGradient
                id="paint0_angular_1502_12729"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(17.25 20) rotate(45) scale(19.4454 20.7011)"
              >
                <stop stopColor="#FFCF3D" />
                <stop offset="1" stopColor="white" />
              </radialGradient>
            </defs>
          </svg>
        );
      case 5:
        return (
          <svg
            width="33"
            height="40"
            viewBox="0 0 33 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.91109 29.9373L2.9111 29.9373L2.90654 29.9339C2.43391 29.5784 1.94622 28.9508 1.57466 28.1918C1.20383 27.4343 1 26.6507 1 26.0374V9.92107C1 9.03492 1.33669 8.0481 1.92415 7.18205C2.51161 6.31601 3.29392 5.65289 4.09101 5.34292L14.8314 1.24633C15.2412 1.09309 15.8491 0.997822 16.5039 1.00004C17.1618 1.00226 17.7589 1.1025 18.1508 1.25928L18.1583 1.26229L18.1658 1.26517L28.9118 5.36391L28.9144 5.36489C29.7058 5.66422 30.4871 6.32411 31.0758 7.192C31.6639 8.05891 32 9.04572 32 9.92107V26.0374C32 26.65 31.7966 27.4282 31.4258 28.1833C31.0554 28.9379 30.5666 29.57 30.0873 29.9385C30.0867 29.939 30.0861 29.9394 30.0856 29.9399L19.3429 38.1149L19.3402 38.1169C18.5963 38.6871 17.5703 39 16.5 39C15.4297 39 14.4037 38.6871 13.6598 38.1169L13.6571 38.1149L2.91109 29.9373Z"
              fill="url(#paint0_angular_1502_12769)"
              stroke="#DD2C37"
              strokeWidth="2"
            />
            <path
              d="M16.3012 26.24C14.0612 26.24 12.4212 25.44 11.0612 24.14L12.9212 21.92C13.9812 22.88 15.0212 23.44 16.2612 23.44C17.7012 23.44 18.6012 22.74 18.6012 21.5V21.46C18.6012 20.26 17.5812 19.56 16.1212 19.56C15.2412 19.56 14.4412 19.8 13.7812 20.08L12.0012 18.9L12.4012 12H21.0012V14.7H15.0412L14.8812 17.12C15.4412 16.98 15.9412 16.88 16.7212 16.88C19.4412 16.88 21.6212 18.2 21.6212 21.36V21.4C21.6212 24.36 19.5212 26.24 16.3012 26.24Z"
              fill="#DD2C37"
            />
            <defs>
              <radialGradient
                id="paint0_angular_1502_12769"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(17.25 20) rotate(45) scale(19.4454 20.7011)"
              >
                <stop stopColor="#FFCF3D" />
                <stop offset="1" stopColor="white" />
              </radialGradient>
            </defs>
          </svg>
        );
      case 6:
        return (
          <svg
            width="33"
            height="40"
            viewBox="0 0 33 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.91109 29.9373L2.9111 29.9373L2.90654 29.9339C2.43391 29.5784 1.94622 28.9508 1.57466 28.1918C1.20383 27.4343 1 26.6507 1 26.0374V9.92107C1 9.03492 1.33669 8.0481 1.92415 7.18205C2.51161 6.31601 3.29392 5.65289 4.09101 5.34292L14.8314 1.24633C15.2412 1.09309 15.8491 0.997822 16.5039 1.00004C17.1618 1.00226 17.7589 1.1025 18.1508 1.25928L18.1583 1.26229L18.1658 1.26517L28.9118 5.36391L28.9144 5.36489C29.7058 5.66422 30.4871 6.32411 31.0758 7.192C31.6639 8.05891 32 9.04572 32 9.92107V26.0374C32 26.65 31.7966 27.4282 31.4258 28.1833C31.0554 28.9379 30.5666 29.57 30.0873 29.9385C30.0867 29.939 30.0861 29.9394 30.0856 29.9399L19.3429 38.1149L19.3402 38.1169C18.5963 38.6871 17.5703 39 16.5 39C15.4297 39 14.4037 38.6871 13.6598 38.1169L13.6571 38.1149L2.91109 29.9373Z"
              fill="url(#paint0_angular_1502_12763)"
              stroke="#DD2C37"
              strokeWidth="2"
            />
            <path
              d="M16.1589 26.24C14.3389 26.24 13.0989 25.72 12.1189 24.74C11.0989 23.72 10.4589 22.22 10.4589 19.44V19.4C10.4589 15.08 12.4189 11.76 16.5989 11.76C18.4989 11.76 19.7389 12.32 20.9789 13.3L19.3589 15.68C18.4389 14.98 17.6989 14.56 16.4989 14.56C14.7589 14.56 13.8789 15.96 13.6789 17.8C14.3789 17.34 15.1989 16.9 16.5789 16.9C19.3589 16.9 21.4989 18.44 21.4989 21.36V21.4C21.4989 24.26 19.1989 26.24 16.1589 26.24ZM16.0389 23.6C17.5589 23.6 18.4389 22.74 18.4389 21.54V21.5C18.4389 20.32 17.5189 19.46 15.9989 19.46C14.4789 19.46 13.5989 20.3 13.5989 21.48V21.52C13.5989 22.7 14.5189 23.6 16.0389 23.6Z"
              fill="#DD2C37"
            />
            <defs>
              <radialGradient
                id="paint0_angular_1502_12763"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(17.25 20) rotate(45) scale(19.4454 20.7011)"
              >
                <stop stopColor="#FFCF3D" />
                <stop offset="1" stopColor="white" />
              </radialGradient>
            </defs>
          </svg>
        );
      default:
        return (
          <svg
            width="33"
            height="40"
            viewBox="0 0 33 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.91109 29.9373L2.9111 29.9373L2.90654 29.9339C2.43391 29.5784 1.94622 28.9508 1.57466 28.1918C1.20383 27.4343 1 26.6507 1 26.0374V9.92107C1 9.03492 1.33669 8.0481 1.92415 7.18205C2.51162 6.316 3.29393 5.65288 4.09104 5.34291L14.8314 1.24634C15.2412 1.0931 15.8491 0.997822 16.5039 1.00004C17.1618 1.00226 17.7589 1.1025 18.1508 1.25928L18.1583 1.26229L18.1658 1.26517L28.9118 5.36391L28.9144 5.36489C29.7058 5.66422 30.4871 6.32411 31.0758 7.192C31.6639 8.05891 32 9.04572 32 9.92107V26.0374C32 26.65 31.7966 27.4282 31.4258 28.1833C31.0554 28.9379 30.5666 29.57 30.0873 29.9385C30.0867 29.939 30.0861 29.9394 30.0856 29.9399L19.3429 38.1149L19.3402 38.1169C18.5963 38.6871 17.5703 39 16.5 39C15.4297 39 14.4037 38.6871 13.6598 38.1169L13.6571 38.1149L2.91109 29.9373Z"
              fill="url(#paint0_angular_1502_12779)"
              stroke="#DD2C37"
              strokeWidth="2"
            />
            <path
              d="M15.8413 26V15.02L13.4013 15.62L12.7613 13.1L16.7813 11.9H18.8813V26H15.8413Z"
              fill="#DD2C37"
            />
            <defs>
              <radialGradient
                id="paint0_angular_1502_12779"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(17.25 20) rotate(45) scale(19.4454 20.7011)"
              >
                <stop stopColor="#FFCF3D" />
                <stop offset="1" stopColor="white" />
              </radialGradient>
            </defs>
          </svg>
        ); // If no valid level is provided
    }
  };

  if (!t) {
    return <Loading />;
  }

  return (
    <>
      {loading ? (
        <Skeleton active />
      ) : (
        <>
          <div className="flex justify-between">
            <h1 className="text-black default-font text-xl font-black	">
              {t("total purchase")}
            </h1>
            <div className="flex items-center gap-2">
              <h2 className="gotham-book text-comp-red text-xl font-black">
                {t("level")}
              </h2>
              {levelIcon(level)}
              <div className="flex text-center">
                <div
                  className="rounded-s-full text-sm	text-comp-red font-black bg-comp-red-hover p-2 level-items1"
                  style={{ clipPath: `polygon(0 0, 100% 0, 80% 100%, 0 100%)` }}
                >
                  ฿
                  {totalPurchase?.totalSpend
                    ? (totalPurchase?.totalSpend - sumCn).toLocaleString()
                    : 0}
                </div>
                <div
                  className="rounded-e-full text-sm	bg-comp-red font-black text-white p-2 level-items2"
                  style={{
                    clipPath: `polygon(20% 0, 100% 0, 100% 100%, 0 100%)`,
                  }}
                >
                  ฿
                  {latestOrder?.totalPurchaseAmount
                    ? latestOrder?.totalPurchaseAmount.toLocaleString()
                    : 0}
                </div>
              </div>
            </div>
          </div>
          {/* <div className="pt-4 total-step">
            <Steps
              current={level} // Set current level from TotalPurchaseHistory
              percent={100}
              labelPlacement="vertical"
              items={items}
            />
          </div> */}
          <div className="pt-4 total-step">
            <div className="wrap-position">
              <div className="progress-wrapper">
                <Steps
                  current={level}
                  percent={100}
                  labelPlacement="vertical"
                  items={items}
                />

                {isHovered && (
                  <div
                    className="sum-total-display"
                    style={{
                      position: "absolute",
                      bottom: tooltipPosition.bottom,
                      left: tooltipPosition.left,
                      transform: "translateX(-50%)",
                      backgroundColor: "#dd2c37",
                      color: "white",
                      padding: "8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      zIndex: 10,
                    }}
                  >
                    ฿{sumTotal.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TotalPurchase;
