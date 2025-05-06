// utils/selectStyles.ts
import { CSSObjectWithLabel } from 'react-select';
import { StylesConfig } from 'react-select';
import { Option } from '@/components/forms/MetricSelect';

/**
 * Unified react‑select style used across Category, Metric, and Unit pickers.
 * Edit here and every dropdown updates automatically.
 */
export const dropdownListStyle = {
  control: (base: CSSObjectWithLabel, state: any) => ({
    ...base,
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #ffffff',
    borderRadius: 0,
    boxShadow: 'none',
    display: 'flex',                // ← NEW
    alignItems: 'center',           // ← NEW  (vertical centering)
    justifyContent: 'center',       // ← NEW  (horizontal centering)
    

    minHeight: '0.25rem',       // height / padding
    paddingLeft: '0rem',    // left‑padding
    fontSize: '0.875rem',      // Tailwind 'text‑sm'
    fontFamily: 'redditLight, sans-serif',
    marginTop: '0rem',

    ':hover': { borderBottomColor: '#1ABC9C' },
  }),
  placeholder: (base: CSSObjectWithLabel) => ({
    ...base,
    color: '#e5e7eb',
    margin: '0.25rem',  
    padding: '0rem',
    textAlign: 'center' as const,          // ← NEW
    width: '100%' as const,   
    
    // gray‑200
  }),
  singleValue: (base: CSSObjectWithLabel) => ({
    ...base,
    color: '#ffffff',
  }),
  menu: (base: CSSObjectWithLabel) => ({
    ...base,
    background: '#1f2937',                             // gray‑800
    color: '#ffffff',
  }),
  option: (base: CSSObjectWithLabel, state: any) => ({
    ...base,
    padding: '.5rem',
    background: state.isFocused ? '#1ABC9C' : '#1f2937', // emerald / gray‑800
    color: '#ffffff',
    ':active': { background: '#065f46' },
  }),
  multiValue: (base: CSSObjectWithLabel) => ({
    ...base,
    background: '#047857',                             // emerald‑600
  }),
  multiValueLabel: (base: CSSObjectWithLabel) => ({
    ...base,
    color: '#ffffff',
  }),
  multiValueRemove: (base: CSSObjectWithLabel) => ({
    ...base,
    color: '#ffffff',
    ':hover': { background: '#dc2626', color: '#ffffff' }, // red‑600
  }),
} as const;


export const dropdownPrimaryTextStyle: StylesConfig<Option, false> = {
  ...dropdownListStyle,
  singleValue: (base) => ({ ...base, color: '#0B3D2E' }),      // primary
  placeholder: (base) => ({ ...base, color: '#0B3D2E99' }),    // 60 % opacity
  option: (base, state) => ({
    ...dropdownListStyle.option(base, state),
    color: '#0B3D2E',
  }),
};

export const dropdownPrimaryWhiteMenu: StylesConfig<Option, false> = {
  /* the input field itself ------------------------------------------------ */
  control: (base) => ({
    ...base,
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #ffffff',
    borderRadius: 0,
    boxShadow: 'none',
    minHeight: '0.25rem',
    fontSize: '0.875rem',
    paddingLeft: 0,
    ':hover': { borderBottomColor: '#1ABC9C' },
  }),

  /* text **shown** after a value is picked → primary colour --------------- */
  singleValue: (base) => ({
    ...base,
    color: '#0B3D2E',           // ← primary
  }),
  placeholder: (base) => ({
    ...base,
    color: '#0B3D2E99',         // primary @ 60 % for placeholder
  }),

  /* the drop-down menu itself -------------------------------------------- */
  menu: (base) => ({
    ...base,
    background: '#0B3D2E',      // dark-primary bg behind options
  }),
  option: (base, state) => ({
    ...base,
    color: '#ffffff',           // ← white option text
    background: state.isFocused ? '#1ABC9C' : '#0B3D2E',
    ':active': { background: '#065f46' },
  }),

  /* multi-value pills etc. (if ever used) --------------------------------- */
  multiValue:   (b) => ({ ...b, background: '#047857' }),
  multiValueLabel: (b) => ({ ...b, color: '#ffffff' }),
  multiValueRemove: (b) => ({
    ...b,
    color: '#ffffff',
    ':hover': { background: '#dc2626', color: '#ffffff' },
  }),
};