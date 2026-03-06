import { useEffect, useState, CSSProperties } from "react";
import { Card, Skeleton, Steps } from "antd";
import axios from "axios";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import i18nConfig from "../i18nConfig";
import { useCurrentLocale } from "next-i18n-router/client";
import "../styles/specialBonus.scss";
import { Image } from "antd";

const Loading = dynamic(() => import("@components/Loading"));

interface Minisize {
  id: number;
  name: string;
  imageProfile: string;
}

interface Brand {
  id: number;
  name: string;
  minisizes: Minisize[];
}
interface SpecialBonusProps {
  userId: number; // Pass userId as a prop
  mini: any[];
}

interface SpecialBonusItem {
  total: number;
  order: number;
  cn: number;
  incentivePoint: number;
  totalPurchaseAmount: number;
  minisizeId: number;
  color: string;
  brand: Brand;
  minisize: Minisize;
}

interface SpecialBonusHistory {
  minisizeId: number;
  level: number;
  total: number;
}

const SpecialBonus: React.FC<SpecialBonusProps> = ({ userId, mini }) => {
  const [groupedItems, setGroupedItems] = useState<{
    [minisizeId: number]: SpecialBonusItem[];
  }>({});
  const [brandLevels, setBrandLevels] = useState<{
    [minisizeId: number]: number;
  }>({});
  const [brandTotal, setBrandTotal] = useState<{
    [minisizeId: number]: number;
  }>({});
  const [tooltipPositionBonus, setTooltipPositionBonus] = useState({
    bottom: 0,
    left: 0,
  });
  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);
  const [loading, setLoading] = useState(false);
  const [sumTotalBonus, setSumTotalBonus] = useState(0);
  const [hoveredMinisizeId, setHoveredMinisizeId] = useState<number | null>(
    null,
  );
  const [hoveredOrder, setHoveredOrder] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const addMinisizeIdToIcons = (icons: NodeListOf<Element>, spendData: any) => {
    icons.forEach((icon, index) => {
      const minisizeId = spendData[index]?.minisizeId;
      const order = spendData[index]?.order + 1;
      const total = spendData[index]?.total || 0;
      if (minisizeId) {
        (icon as HTMLElement).setAttribute(
          "data-minisize-id",
          minisizeId.toString(),
        );
      }

      if (order >= 0) {
        (icon as HTMLElement).setAttribute(
          "data-minisize-order",
          order.toString(),
        );
      }
      if (total >= 0) {
        (icon as HTMLElement).setAttribute(
          "data-minisize-total",
          total.toString(),
        );
      }
    });
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    // Fetch special bonus history and items for the user
    async function fetchSpecialBonusData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/specialBonus?userId=${userId}`);
        const data = await response.json();
        const specialBonusResponse = data.specialBonus;
        // Group items by minisizeId
        const groupedItemsByMinisize = specialBonusResponse.items.reduce(
          (
            acc: { [minisizeId: number]: SpecialBonusItem[] },
            item: SpecialBonusItem,
          ) => {
            if (!acc[item.minisizeId]) {
              acc[item.minisizeId] = [];
            }
            acc[item.minisizeId].push(item);
            return acc;
          },
          {},
        );

        // setGroupedItems(groupedItemsByMinisize);

        // Fetch the SpecialBonusHistory to get the totalSpend and determine the levels
        const historyResponse = await axios.get(
          `/api/specialBonusHistory?userId=${userId}&specialBonusId=${specialBonusResponse.id}`,
        );

        const specialBonusHistory = historyResponse.data.data;
        // Process the history to map minisizeId to levels
        // Initialize default maps with zeros
        const defaultBrandLevelMap = mini.reduce(
          (acc: { [minisizeId: number]: number }, minisizeId) => {
            acc[minisizeId] = 0;
            return acc;
          },
          {},
        );

        const defaultBrandTotallMap = { ...defaultBrandLevelMap };

        const brandLevelMap = (specialBonusHistory.totalSpend || []).reduce(
          (
            acc: { [minisizeId: number]: number },
            history: SpecialBonusHistory,
          ) => {
            acc[history.minisizeId] = history.level;
            return acc;
          },
          mini.reduce((acc: { [minisizeId: number]: number }, minisize) => {
            acc[minisize.id] = 0; // Initialize with 0 for minisize IDs from mini
            return acc;
          }, {}),
        );

        const brandTotallMap = (specialBonusHistory.totalSpend || []).reduce(
          (
            acc: { [minisizeId: number]: number },
            history: SpecialBonusHistory,
          ) => {
            acc[history.minisizeId] = history.total;
            return acc;
          },
          mini.reduce((acc: { [minisizeId: number]: number }, minisize) => {
            acc[minisize.id] = 0; // Initialize with 0 for minisize IDs from mini
            return acc;
          }, {}),
        );

        setBrandLevels(brandLevelMap);
        setBrandTotal(brandTotallMap);

        const mergedData = { ...groupedItemsByMinisize };
        // Iterate through groupedItemsByMinisize and add the 'total' value
        for (const minisizeId in mergedData) {
          mergedData[minisizeId].forEach(
            (item: { minisizeId: any; total: any }) => {
              // Find the matching minisizeId in specialBonusHistory.totalSpend
              const found = (specialBonusHistory.totalSpend || mini).find(
                (historyItem: { minisizeId: any }) =>
                  historyItem.minisizeId === item.minisizeId,
              );

              // If found, set the 'total' value; if not, set 'total' to 0
              item.total = found ? found.total : 0;
            },
          );
        }
        setGroupedItems(mergedData);
        setTimeout(() => {
          const stepsProgressIcon = document.querySelectorAll(
            ".special-step .ant-steps-progress-icon",
          );
          const mergedTotals = Object.keys(groupedItemsByMinisize).map(
            (minisizeId) => {
              // Check in totalSpend or fallback to mini
              const found = (specialBonusHistory.totalSpend || []).find(
                (historyItem: { minisizeId: number; level: number }) =>
                  historyItem.minisizeId === Number(minisizeId),
              );

              // Fallback logic for minisizeId if not found in totalSpend
              const miniFallback = mini.find(
                (miniItem) => miniItem.id === Number(minisizeId),
              );

              // Return new object with minisizeId and values
              return {
                minisizeId: Number(minisizeId),
                order: found ? Number(found.level) : 0, // Use found level or 0
                total: found ? found.total : 0, // Use found total or 0
                ...(miniFallback && { fallbackName: miniFallback.name }), // Optional additional data from mini
              };
            },
          );
          const filter = mergedTotals.filter((item) => item.order !== 4);

          addMinisizeIdToIcons(stepsProgressIcon, filter);

          stepsProgressIcon.forEach((icon) => {
            icon.addEventListener("mouseenter", (event) => {
              const target = event.target as HTMLElement;
              // Get the minisizeId from the data attribute
              const minisizeId = target.getAttribute("data-minisize-id");
              const order = target.getAttribute("data-minisize-order");
              const total = target.getAttribute("data-minisize-total");

              const rect = (
                event.target as HTMLElement
              ).getBoundingClientRect();
              setTooltipPositionBonus({
                bottom: 110,
                left: rect.left,
              });
              setHoveredMinisizeId(Number(minisizeId));
              setHoveredOrder(Number(order));
              setSumTotalBonus(Number(total));
            });

            icon.addEventListener("mouseleave", () => {
              setHoveredMinisizeId(null);
              setHoveredOrder(null);
              setSumTotalBonus(0);
            });
          });
        }, 5000);
      } catch (error) {
        console.error("Error fetching special bonus data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSpecialBonusData();
  }, [userId]);

  // Render steps for each brand
  const renderStepsForBrand = (
    minisizeId: number,
    items: SpecialBonusItem[],
  ) => {
    const userLevel = brandLevels[minisizeId] || 0;
    const brandTotalMap = brandTotal[minisizeId] || 0;

    const brandColor = items[0]?.color || "#1677ff"; // Default color if none is provided
    const imageProfile = items[0]?.minisize?.imageProfile;
    const brandName = items[0]?.minisize?.name || "";
    const stepsItems = items.map((item) => {
      return {
        title: "",
        description: (
          <div
            className="progress-step-wrapper"
            style={{ position: "relative" }}
          >
            {userLevel >= item.order
              ? renderActive(
                  item.cn,
                  item.incentivePoint,
                  item.totalPurchaseAmount,
                  brandColor,
                )
              : renderInactive(
                  item.cn,
                  item.incentivePoint,
                  item.totalPurchaseAmount,
                  brandColor,
                )}

            {item.minisizeId === hoveredMinisizeId &&
              item.order === hoveredOrder && (
                <div
                  className="sum-total-display-bonus"
                  style={{
                    position: "absolute",
                    bottom: tooltipPositionBonus.bottom,
                    right: "-50px",
                    transform: "translateX(-50%)",
                    backgroundColor: "#dd2c37",
                    color: "white",
                    padding: "8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    zIndex: 10,
                  }}
                >
                  ฿{sumTotalBonus.toLocaleString()}
                </div>
              )}
          </div>
        ),
        totalpurchaseamount: item.totalPurchaseAmount,
        minisizeid: minisizeId,
      };
    });

    if (userLevel < 4 && userLevel != 0) {
      let percent = 0;
      if (stepsItems[userLevel] && stepsItems[userLevel - 1]) {
        percent =
          stepsItems[userLevel].totalpurchaseamount -
          stepsItems[userLevel - 1].totalpurchaseamount;
      }

      const currentTotal =
        stepsItems[userLevel].totalpurchaseamount - brandTotalMap;
      const cal = (currentTotal * 100) / percent;
      const rest = 100 - cal;

      const finishedSteps = document.querySelectorAll(
        `.total-s-${stepsItems[userLevel].minisizeid} .ant-steps-item-finish`,
      );
      if (finishedSteps.length > 0) {
        // Get the last finished step
        const lastFinishedStep = finishedSteps[finishedSteps.length - 1];
        const lastTail = lastFinishedStep.querySelector(".ant-steps-item-tail");
        if (lastTail) {
          // Add a unique class to lastTail
          const parent = lastTail.parentElement;
          if (parent) {
            parent.classList.add("last-tail-specific");
            const gradientStyle = `linear-gradient(90deg, ${brandColor} ${rest}%, rgba(5, 5, 5, 0.06) ${cal}%)`;
            parent.style.setProperty("--dynamic-gradient-s", gradientStyle);
          }
        }
      }
    }
    return (
      <div
        key={minisizeId}
        className="mb-6 special-step grid grid-cols-1 sm:grid-cols-6 gap-4"
        style={{ "--step-color": brandColor } as CSSProperties}
      >
        <div className="flex flex-col items-center sm:items-center sm:justify-center sm:col-span-1">
          {imageProfile && (
            <div className="minisize-image w-full flex flex-col items-center">
              <div className="w-24 h-16 sm:w-24 sm:h-16 overflow-hidden flex items-center justify-center">
                <Image
                  alt="brand"
                  src={imageProfile ? imageProfile : "error"}
                  preview={false}
                  className="object-contain"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              </div>
              <p className="gotham-font text-comp-natural-base text-xs mt-2 text-center break-words">
                {brandName}
              </p>
            </div>
          )}
        </div>

        <div className="sm:col-span-5 special-bonus-scroll">
          <div className="special-bonus-inner">
            <div className="wrap-position">
              <div className={`progress-wrapper total-s-${minisizeId}`}>
                <Steps
                  direction={isMobile ? "vertical" : "horizontal"}
                  current={userLevel}
                  percent={100}
                  labelPlacement="vertical"
                  items={stepsItems}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Active step template
  const renderActive = (
    cn: number,
    incentivePoint: number,
    totalPurchaseAmount: number,
    color: string,
  ) => (
    <Card
      title={
        <>
          <p
            className={`default-font text-lg py-2 text-center`}
            style={{ color: color }}
          >
            ฿{totalPurchaseAmount.toLocaleString()}
          </p>
        </>
      }
      bordered={true}
      style={{ borderColor: color }}
    >
      <p className="text-card">
        {t("get")} {incentivePoint} {t("point")}
      </p>
      {cn && (
        <div className="flex items-center justify-center">
          <svg
            width="21"
            height="20"
            viewBox="0 0 21 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.52805 12.75L7.30305 16.525C8.85305 18.075 11.3697 18.075 12.9281 16.525L16.5864 12.8667C18.1364 11.3167 18.1364 8.80004 16.5864 7.24171L12.8031 3.47504C12.0114 2.68337 10.9197 2.25837 9.80305 2.31671L5.63638 2.51671C3.96972 2.59171 2.64472 3.91671 2.56139 5.57504L2.36139 9.74171C2.31139 10.8667 2.73639 11.9584 3.52805 12.75Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7.96981 10C9.1204 10 10.0531 9.0673 10.0531 7.91671C10.0531 6.76611 9.1204 5.83337 7.96981 5.83337C6.81921 5.83337 5.88647 6.76611 5.88647 7.91671C5.88647 9.0673 6.81921 10 7.96981 10Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          <p className="text-card">
            {t("cn")} {cn} %
          </p>
        </div>
      )}
    </Card>
  );

  // Inactive step template
  const renderInactive = (
    cn: number,
    incentivePoint: number,
    totalPurchaseAmount: number,
    color: string,
  ) => (
    <Card
      bordered={true}
      className="inactive-card"
      style={{ borderColor: color }}
      title={
        <>
          <p
            className={`default-font text-lg py-2 text-center text-comp-natural-base`}
          >
            ฿{totalPurchaseAmount.toLocaleString()}
          </p>
        </>
      }
    >
      <p className="text-card">
        {t("get")} {incentivePoint} {t("point")}
      </p>
      {cn && (
        <div className="flex items-center justify-center">
          <svg
            width="21"
            height="20"
            viewBox="0 0 21 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.52805 12.75L7.30305 16.525C8.85305 18.075 11.3697 18.075 12.9281 16.525L16.5864 12.8667C18.1364 11.3167 18.1364 8.80004 16.5864 7.24171L12.8031 3.47504C12.0114 2.68337 10.9197 2.25837 9.80305 2.31671L5.63638 2.51671C3.96972 2.59171 2.64472 3.91671 2.56139 5.57504L2.36139 9.74171C2.31139 10.8667 2.73639 11.9584 3.52805 12.75Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7.96981 10C9.1204 10 10.0531 9.0673 10.0531 7.91671C10.0531 6.76611 9.1204 5.83337 7.96981 5.83337C6.81921 5.83337 5.88647 6.76611 5.88647 7.91671C5.88647 9.0673 6.81921 10 7.96981 10Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          <p className="text-card">
            {t("cn")} {cn} %
          </p>
        </div>
      )}
    </Card>
  );

  if (!t) {
    return <Loading />;
  }

  return (
    <>
      {loading ? (
        <Skeleton active />
      ) : (
        <div>
          <h1 className="text-black default-font text-xl font-black">
            {t("Special bonus")}
          </h1>
          <div className="pt-4">
            {Object.keys(groupedItems).map((minisizeId) =>
              renderStepsForBrand(
                Number(minisizeId),
                groupedItems[Number(minisizeId)],
              ),
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SpecialBonus;
