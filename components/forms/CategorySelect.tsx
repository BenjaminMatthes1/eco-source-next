import React from 'react';
import Select, { MultiValue } from 'react-select';
import { CATEGORY_OPTIONS } from '@/utils/categoryOptions';
import { dropdownListStyle } from '@/utils/selectStyles';

interface Props {
  value: string[];
  onChange: (vals: string[]) => void;
}


const CategorySelect: React.FC<Props> = ({ value, onChange }) => (
  <Select
    isMulti
    options={CATEGORY_OPTIONS}
    value={CATEGORY_OPTIONS.filter((o) => value.includes(o.value))}
    onChange={(selected: MultiValue<{ value: string; label: string }>) =>
      onChange(selected.map((o) => o.value))
    }
    styles={dropdownListStyle}
    classNamePrefix="react-select"
    placeholder="Select or type to search…"
  />
);

export default CategorySelect;
