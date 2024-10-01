import React, { useEffect, useState } from "react";
import { Carousel, Image, Skeleton } from "antd";
import axios from "axios";
import { useTranslation } from "react-i18next";

interface Promotion {
  id: number;
  image: string;
  name: string;
  productRedeem: string;
}

const PromotionSlide: React.FC<{ custPriceGroup: string }> = ({
  custPriceGroup,
}) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const contentStyle: React.CSSProperties = {
    margin: 0,
    color: "#fff",
    lineHeight: "80px",
    textAlign: "center",
    // background: "#364d79",
  };

  useEffect(() => {
    if (custPriceGroup) {
      // Fetch promotions based on the custPriceGroup
      axios
        .get(`/api/getDashboardPromotion?group=${custPriceGroup}`)
        .then((response) => {
          setPromotions(response.data);
        })
        .catch((error) => {
          //   console.error("Error fetching promotions:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [custPriceGroup]);

  const onChange = (currentSlide: number) => {
  };

  return (
    <div className="promotion-slide">
      {loading ? (
        <Skeleton active />
      ) : (
        <h1 className="text-black default-font text-xl font-black pb-4">
          {t("promotion")}
        </h1>
      )}

      <Carousel arrows infinite={false} afterChange={onChange} dots>
        {loading ? (
          <>
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
          </>
        ) : promotions.length > 0 ? (
          promotions.map((promotion) => (
            <div key={promotion.id}>
              <div>
                <h3 style={contentStyle}>
                  <Image
                    src={promotion.image}
                    alt={promotion.name}
                    className="rounded-lg"
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  />
                </h3>
              </div>
              <p className="default-font font-semibold text-black text-base	">
                {promotion.name}
              </p>
              <p className="default-font font-semibold text-comp-natural-base text-base	">
                {promotion.productRedeem}
              </p>
            </div>
          ))
        ) : (
          <div>
            <h3 style={contentStyle}>{t("No promotions available")}</h3>
          </div>
        )}
      </Carousel>
    </div>
  );
};

export default PromotionSlide;
