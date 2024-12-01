import {ChevronLeft, ChevronRight} from 'lucide-react';
import {SidebarTrigger, useSidebar} from './ui/sidebar';

export function SidebarToggle() {
  const {open} = useSidebar();

  return (
    <SidebarTrigger
      className={`absolute top-4 z-100 h-7 w-7 rounded-full border-2 bg-background transition-all ${
        open ? '-right-4' : '-right-12'
      }`}
      icon={open ? <ChevronLeft /> : <ChevronRight />}
    />
  );
}
