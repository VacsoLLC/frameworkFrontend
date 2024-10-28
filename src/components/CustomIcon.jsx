import {icons} from 'lucide-react';

const CustomIcon = ({name, size = 16, className}) => {
  const LucideIcon = icons[name];

  return <LucideIcon size={size} className={className} />;
};

export default CustomIcon;
