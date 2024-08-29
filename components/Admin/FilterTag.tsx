import React from 'react';
import { Tag, theme  } from 'antd';

interface FilterType {
  id: string;
  label: string;
}

interface FilterTagProps {
  onFilterChange: (filters: {
    lv1?: FilterType;
    lv2?: FilterType;
    lv3?: FilterType;
    promotion?: FilterType; // Add promotion filter
  }) => void;
  selectedFilters: {
    lv1?: FilterType;
    lv2?: FilterType;
    lv3?: FilterType;
    promotion?: FilterType; // Add promotion filter
  };
}

const FilterTag: React.FC<FilterTagProps> = ({ onFilterChange, selectedFilters }) => {
  const tags = [
    selectedFilters.lv1 ? `${selectedFilters.lv1.label}` : null,
    selectedFilters.lv2 ? `${selectedFilters.lv2.label}` : null,
    selectedFilters.lv3 ? `${selectedFilters.lv3.label}` : null,
    selectedFilters.promotion ? `Promotion: ${selectedFilters.promotion.label}` : null,
  ].filter(Boolean); // Filter out any null values
  const handleClose = (removedTag: string) => {
    const newFilters = { ...selectedFilters };

    if (newFilters.promotion && `Promotion: ${newFilters.promotion.label}` === removedTag) {
      // If the removed tag is for promotion, remove promotion
      delete newFilters.promotion;
    } else if (newFilters.lv3 && newFilters.lv3.label === removedTag) {
      // If the removed tag is in lv3, remove lv3
      delete newFilters.lv3;
    } else if (newFilters.lv2 && newFilters.lv2.label === removedTag) {
      // If the removed tag is in lv2, remove lv2 and lv3
      delete newFilters.lv2;
      delete newFilters.lv3;
    } else if (newFilters.lv1 && newFilters.lv1.label === removedTag) {
      // If the removed tag is in lv1, remove all (lv1, lv2, lv3)
      delete newFilters.lv1;
      delete newFilters.lv2;
      delete newFilters.lv3;
    }

    onFilterChange(newFilters);
  };
  const tagPlusStyle: React.CSSProperties = {
    background: '#E4E7EB',
    borderStyle: 'solid',
    borderColor: 'E4E7EB',
    padding: '8px',
  };

  const tagChild = tags.map(tag => (
    <span key={tag} style={{ display: 'inline-block' }}>
      <Tag
        closable
        onClose={e => {
          e.preventDefault();
          handleClose(tag!);
        }}
        style={tagPlusStyle}
        className='filter-tag'
      >
        {tag}
      </Tag>
    </span>
  ));

  return (
    <div>
        {tagChild}
    </div>
  );
};


export default FilterTag;
