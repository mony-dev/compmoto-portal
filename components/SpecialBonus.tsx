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
  imageProfile: string;
}

interface Brand {
  id: number;
  name: string;
  minisizes: Minisize[];
}
interface SpecialBonusProps {
  userId: number; // Pass userId as a prop
}

interface SpecialBonusItem {
  order: number;
  cn: number;
  incentivePoint: number;
  totalPurchaseAmount: number;
  brandId: number;
  color: string;
  brand: Brand;
}

interface SpecialBonusInterface {
  month: number;
  year: number;
  resetDate: Date;
  items: SpecialBonusItem[];
}

interface SpecialBonusHistory {
  brandId: number;
  level: number;
  total: number;
}

const SpecialBonus: React.FC<SpecialBonusProps> = ({ userId }) => {
  const [groupedItems, setGroupedItems] = useState<{
    [brandId: number]: SpecialBonusItem[];
  }>({});
  const [brandLevels, setBrandLevels] = useState<{ [brandId: number]: number }>(
    {}
  );
  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch special bonus history and items for the user
    async function fetchSpecialBonusData() {
      setLoading(true);
      try {
        const test = await fetch("/api/adminSpecialBonus");
        console.log("test",test)
        // Fetch the active SpecialBonus and its items
        // const specialBonusResponse = await axios.get(
        //   `/api/specialBonus?userId=${userId}`
        // );
        const response = await fetch("/api/specialBonus");
        console.log("response", response)
        const data = await response.json();
        console.log("data", data)
        const specialBonusResponse = data.specialBonus

        // Group items by brandId
        const groupedItemsByBrand = specialBonusResponse.items.reduce(
          (
            acc: { [brandId: number]: SpecialBonusItem[] },
            item: SpecialBonusItem
          ) => {
            if (!acc[item.brandId]) {
              acc[item.brandId] = [];
            }
            acc[item.brandId].push(item);
            return acc;
          },
          {}
        );

        setGroupedItems(groupedItemsByBrand);

        // Fetch the SpecialBonusHistory to get the totalSpend and determine the levels
        const historyResponse = await axios.get(
          `/api/specialBonusHistory?userId=${userId}&specialBonusId=${specialBonusResponse.id}`
        );
        const specialBonusHistory = historyResponse.data.data[0];
        // Process the history to map brandId to levels
        const brandLevelMap = specialBonusHistory.totalSpend.reduce(
          (
            acc: { [brandId: number]: number },
            history: SpecialBonusHistory
          ) => {
            acc[history.brandId] = history.level;
            return acc;
          },
          {}
        );
        setBrandLevels(brandLevelMap);
      } catch (error) {
        console.error("Error fetching special bonus data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSpecialBonusData();
  }, [userId]);

  // Render steps for each brand
  const renderStepsForBrand = (brandId: number, items: SpecialBonusItem[]) => {
    const userLevel = brandLevels[brandId] || 0;

    // Use the color of the first item in the brand to style the steps
    const brandColor = items[0]?.color || "#1677ff"; // Default color if none is provided
    const imageProfile = items[0]?.brand?.minisizes[0]?.imageProfile;
    const brandName = items[0]?.brand?.name || "";
    const stepsItems = items.map((item) => {
      return {
        title: "",
        description:
          userLevel >= item.order
            ? renderActive(
                item.cn,
                item.incentivePoint,
                item.totalPurchaseAmount,
                brandColor
              )
            : renderInactive(
                item.cn,
                item.incentivePoint,
                item.totalPurchaseAmount,
                brandColor
              ),
      };
    });

    return (
      <div
        key={brandId}
        className="mb-6 special-step grid grid-cols-6"
        style={{ "--step-color": brandColor } as CSSProperties}
      >
        <div className="flex items-center justify-center">
          {imageProfile && (
            <div className="minisize-image">
              {/* <Image width={100} height={100} src={imageProfile} alt="brand" /> */}
              <Image
                alt="brand"
                width={100}
                height={50}
                src={imageProfile ? imageProfile : "error"}
                preview={false}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
              />
              <p className="gotham-font text-comp-natural-base text-xs">
                {brandName}
              </p>
            </div>
          )}
        </div>
        <div className="col-span-5">
          <Steps
            current={userLevel}
            percent={100}
            labelPlacement="vertical"
            items={stepsItems}
          />
        </div>
      </div>
    );
  };

  // Active step template
  const renderActive = (
    cn: number,
    incentivePoint: number,
    totalPurchaseAmount: number,
    color: string
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
    color: string
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
            {Object.keys(groupedItems).map((brandId) =>
              renderStepsForBrand(
                Number(brandId),
                groupedItems[Number(brandId)]
              )
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SpecialBonus;
