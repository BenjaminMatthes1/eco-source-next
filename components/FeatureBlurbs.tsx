// components/FeatureBlurbs.tsx
import { FaLeaf, FaLock, FaUsers, FaDollarSign } from 'react-icons/fa';

const features = [
  {
    icon: <FaLeaf size={30} />,
    text: 'Access a wide range of eco-friendly supplies from trusted sellers.',
    position: 'top-10 left-10',
  },
  {
    icon: <FaLock size={30} />,
    text: 'Explore secure payment portals for seamless transactions.',
    position: 'top-1/4 right-10',
  },
  {
    icon: <FaUsers size={30} />,
    text: 'Connect with industry-leading suppliers and buyers.',
    position: 'bottom-1/4 left-10',
  },
  {
    icon: <FaDollarSign size={30} />,
    text: 'Set preferences for cost and quantity with full transparency.',
    position: 'bottom-10 right-20',
  },
];

const FeatureBlurbs: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {features.map((feature, index) => (
        <div
          key={index}
          className={`absolute ${feature.position} flex items-center justify-center`}
        >
          <div className="group bg-green-800 bg-opacity-80 rounded-full p-5 w-16 h-16 flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out pointer-events-auto hover:rounded-lg hover:w-60 hover:h-32">
            <div className="text-white text-center">
              <div className="group-hover:hidden">{feature.icon}</div>
              <div className="hidden group-hover:block text-sm px-2">
                {feature.text}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureBlurbs;
