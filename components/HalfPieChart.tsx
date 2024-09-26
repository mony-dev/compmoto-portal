import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import i18nConfig from "../i18nConfig";
import { useCurrentLocale } from "next-i18n-router/client";
import Loading from "@components/Loading";


ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

interface ChartProps {
  userId: string;
}

const HalfPieChart: React.FC<ChartProps> = ({ userId }) => {
  const [data, setData] = useState<ChartData>({ labels: [], datasets: [] });
  const locale = useCurrentLocale(i18nConfig);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/pieChart?userId=${userId}`);
        const result = await response.json();

        // Conditionally set month labels based on the locale
        const monthlyLabels =
          locale === "en"
            ? [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ]
            : [
                "ม.ค.",
                "ก.พ.",
                "มี.ค.",
                "เม.ย.",
                "พ.ค.",
                "มิ.ย.",
                "ก.ค.",
                "ส.ค.",
                "ก.ย.",
                "ต.ค.",
                "พ.ย.",
                "ธ.ค.",
              ];

        const chartData = monthlyLabels.map(
          (label, index) => result.total[index] || 0
        );

        setData({
          labels: monthlyLabels, // Set the conditionally selected month names as labels
          datasets: [
            {
              label: "Total Price by Month",
              data: chartData,
              backgroundColor: Array(12).fill("#f87575"),
              borderColor: Array(12).fill("#ffffff"),
              borderWidth: 5,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, locale]);

  const options = {
    rotation: -90,
    circumference: 180,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.raw || 0;
            return `${value}฿`;
          },
        },
      },
    },
  };

  if (loading || !locale) {
    return <Loading />;
  }

  return (
    <div style={{ height: "200px", width: "100%" }} className="my-4">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default HalfPieChart;
