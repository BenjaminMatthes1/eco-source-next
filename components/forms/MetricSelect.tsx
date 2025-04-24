import React from 'react';
import Select, {SingleValue} from 'react-select';
import { METRIC_SELECT_OPTIONS } from '@/utils/metricOptions';
import { dropdownListStyle } from '@/utils/selectStyles';

 
export type Option = { value: string; label: string };

  interface Props {
    value: string;
    onChange: (val: string) => void;
    options?: Option[];
    
  }

  const MetricSelect: React.FC<Props> = ({ value, onChange, options }) => (
    <Select<Option, false>
      isClearable
      classNamePrefix="react-select"
      placeholder="Select or type…"
      styles={dropdownListStyle}
      options={options ?? METRIC_SELECT_OPTIONS}                 
      value={
        value
          ? (options ?? METRIC_SELECT_OPTIONS).find((o) => o.value === value) ?? null
          : null
      }
      onChange={(opt: SingleValue<Option>) => onChange(opt ? opt.value : '')}
    />
  );
  
  export default MetricSelect;
