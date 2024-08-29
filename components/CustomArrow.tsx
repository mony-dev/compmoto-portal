import React from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons"; // Import Ant Design icons

interface CustomArrowProps {
  className?: string; // Optional string type for className
  style?: React.CSSProperties; // Style should be of type CSSProperties
  onClick?: () => void; // onClick is an optional function
  icon: React.ReactNode; // icon is a required ReactNode
}

// Custom arrow component
export const CustomArrow: React.FC<CustomArrowProps> = ({ className, style, onClick, icon }) => (
  <div
    className={`${className} custom-carousel-arrow`} // Add a custom class
    style={{
      ...style,
      backgroundColor: "black", // Set the background color
      borderRadius: "50%",      // Set the border radius to full
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "30px",            // Set width for better UI
      height: "30px",           // Set height for better UI
      cursor: "pointer",
    }}
    onClick={onClick}
  >
    {icon}
  </div>
);