import React, { useEffect, useState } from "react";
import axios from "axios";

interface MenuItemType {
  key: string;
  label: string;
  children?: MenuItemType[];
}

interface SubmenuProps {
  onFilterChange: (filters: { lv1?: string; lv2?: string; lv3?: string }) => void;
  minisizeId: number;
}

const Submenu: React.FC<SubmenuProps> = ({ onFilterChange, minisizeId }) => {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<{
    lv1?: string;
    lv2?: string;
    lv3?: string;
  }>({});

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(`/api/getMenuItems`, {
          params: { minisizeId },
        });
        const items: MenuItemType[] = response.data;
        console.log("items", items);
        setMenuItems(items);
      } catch (error) {
        console.error("Error fetching menu items: ", error);
      }
    };

    if (minisizeId) {
      fetchMenuItems();
    }
  }, [minisizeId]);

  const handleClick = (event: React.MouseEvent, key: string) => {
    event.stopPropagation(); // Stop the event from propagating to parent elements

    const [lv1, lv2, lv3] = key.split("-");
    const newFilters: { lv1?: string; lv2?: string; lv3?: string } = {};
    if (lv1) newFilters.lv1 = lv1;
    if (lv2) newFilters.lv2 = lv2;
    if (lv3) newFilters.lv3 = lv3;

    console.log("newFilters", newFilters);

    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const renderMenu = (items: MenuItemType[], level: number = 1): React.ReactNode => {
    return items.map((item) => (
      <div
        key={item.key}
        className={`menuItem level-${level}`}
        onClick={(event) => handleClick(event, item.key)}
      >
        <div>{item.label}</div>
        {item.children && (
          <div className="subMenu">
            {renderMenu(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="dropdown">
      <div className="dropdownToggle">รุ่นสินค้า</div>
      <div className="dropdownMenu">{renderMenu(menuItems)}</div>
    </div>
  );
};

export default Submenu;
