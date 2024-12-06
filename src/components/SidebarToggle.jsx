import {ChevronLeft, ChevronRight} from 'lucide-react';
import {SidebarTrigger, useSidebar} from './ui/sidebar';

export function SidebarToggle() {
  const {open} = useSidebar();

  return (
    <SidebarTrigger
      className={`absolute bottom-3 z-100 h-6 w-6 rounded-full border-2 bg-background transition-all ${
        open ? '-right-4' : '-right-7'
      }`}
      icon={open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    />
  );
}
