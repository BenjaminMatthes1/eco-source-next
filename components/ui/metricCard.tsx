import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';

interface Props {
  label: string;
  value: React.ReactNode;
  /** optional short tooltip / future “extended description” */
  info?: string;
}

const MetricCard: React.FC<Props> = ({ label, value, info }) => (
  <div className="rounded-lg border border-primary/30 bg-white/70
                  shadow-sm px-4 py-3 flex flex-col gap-1">
    <div className="flex items-center text-sm font-semibold text-primary">
      {label}
      {info && (
        <FaInfoCircle
          className="ml-1 text-accent cursor-help"
          title={info}                 /* native title tooltip for now   */
        />
      )}
    </div>
    <div className="text-base font-redditBold text-primary/90">{value}</div>
  </div>
);

export default MetricCard;
