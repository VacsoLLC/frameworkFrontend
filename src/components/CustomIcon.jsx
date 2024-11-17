import {icons} from 'lucide-react';

const CustomIcon = ({name = 'CircleHelp', size = 16, className}) => {
  const LucideIcon = icons[name] || icons['CircleHelp'];

  return <LucideIcon size={size} className={className} />;
};

export default CustomIcon;
