// utils/selectStyles.ts
import { CSSObjectWithLabel } from 'react-select';

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
