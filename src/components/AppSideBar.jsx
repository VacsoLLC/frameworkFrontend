import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Search,
  User,
  User2,
} from 'lucide-react';
import CustomIcon from './CustomIcon';
import {
  CollapsibleTrigger,
  Collapsible,
  CollapsibleContent,
} from './ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from './ui/sidebar';
import React from 'react';
import {Input} from './ui/input';
import {SidebarToggle} from './SidebarToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {DropdownMenuItem} from '@radix-ui/react-dropdown-menu';

export function AppSidebar({navItems, onSearch, userItems}) {
  return (
    <Sidebar className="flex-shrink-0">
      <div>
        <SidebarToggle />
      </div>
      <SidebarHeader>
        <SidebarGroup className="py-0">
          <SidebarGroupContent className="relative">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSearch(event.target.search.value);
                event.target.search.value = '';
              }}
            >
              <div className="relative">
                <Input
                  type="search"
                  id="search"
                  key="search"
                  placeholder="Search..."
                  className="w-full"
                />
              </div>
            </form>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item, index) => (
              <React.Fragment key={item.label}>
                {item.items ? (
                  <Collapsible
                    defaultOpen={index === 1}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                          <CustomIcon name={item.icon} /> {item.label}
                          <ChevronDown className="ml-auto group-data-[state=open]/collapsible:hidden" />
                          <ChevronRight className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.label}>
                              <SidebarMenuSubButton
                                asChild
                                className="w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                isActive={subItem.isActive}
                              >
                                <a
                                  onClick={(e) => {
                                    e.preventDefault();
                                    subItem.command();
                                  }}
                                  style={{cursor: 'pointer'}}
                                  className="w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                >
                                  <CustomIcon name={subItem.icon} />
                                  {subItem.label}
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a
                        onClick={(e) => {
                          item.command();
                          e.preventDefault();
                        }}
                        style={{
                          cursor: 'pointer',
                        }}
                      >
                        {item.label}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </React.Fragment>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> Account
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
                forceMount
              >
                {userItems?.length > 0 &&
                  userItems.map((subItem) => (
                    <DropdownMenuItem
                      onClick={(e) => {
                        subItem.command();
                      }}
                      className="cursor-pointer p-2 my-2 flex items-center"
                      key={subItem.label}
                      style={{fontSize: '14px'}}
                    >
                      <span>
                        <CustomIcon name={subItem.icon} className={'mx-1'} />
                      </span>
                      {subItem.label}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
