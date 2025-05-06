import React from 'react';
import Select, {SingleValue, StylesConfig, GroupBase} from 'react-select';
import { METRIC_SELECT_OPTIONS } from '@/utils/metricOptions';
import { dropdownListStyle } from '@/utils/selectStyles';

 
export type Option = { value: string; label: string };

  interface Props {
    value: string;
    onChange: (val: string) => void;
    options?: Option[];
    className?: string;
    styles?: StylesConfig<Option, false>;
  }

  const MetricSelect: React.FC<Props> = ({
    value,
    onChange,
    className,
    styles,
  }) => (
    <Select<Option, false>
      options={METRIC_SELECT_OPTIONS}
      value={
        value ? METRIC_SELECT_OPTIONS.find((o) => o.value === value) ?? null : null
      }
      onChange={(opt: SingleValue<Option>) => onChange(opt ? opt.value : '')}
      isClearable
      placeholder="Select or type…"
      classNamePrefix="react-select"
      /* ⬇︎ forward the new props */
      className={className}
      styles={styles}
    />
  );
  
  export default MetricSelect;
