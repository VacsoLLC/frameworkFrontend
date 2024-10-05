import * as React from 'react';
import {ChevronDown, Search} from 'lucide-react';

import {Input} from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {Button} from './ui/button';
import {Avatar, AvatarFallback} from './ui/avatar';

const Link = ({children, href}) => <a href={href}>{children}</a>;

const getMenuItemForDropdown = (subItem) => {
  return (
    <DropdownMenuItem
      onClick={(e) => {
        subItem.command();
      }}
      className="cursor-pointer p-2 my-2"
    >
      <i className={`${subItem.icon} mr-1`} /> {subItem.label}
    </DropdownMenuItem>
  );
};

const getDropdownForItem = (item) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <i className={`${item.icon} mr-1`} /> {item.label}
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="ml-2">
        {item.items.map((subItem) => getMenuItemForDropdown(subItem))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function TopNavbar({navItems, onSearch, userItems}) {
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex space-x-4">
          {navItems?.length > 0 &&
            navItems.map((navItem) => {
              const isDropDown = navItem?.items?.length;
              if (isDropDown) {
                return getDropdownForItem(navItem);
              }
              return (
                <Button
                  variant="ghost"
                  asChild
                  onClick={navItem.command}
                  className="cursor-pointer"
                >
                  <a>{navItem.label}</a>
                </Button>
              );
            })}
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSearch(event.target.search.value);
              event.target.search.value = '';
            }}
          >
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                id="search"
                key="search"
                placeholder="Search..."
                className="w-[200px] pl-8 md:w-[300px]"
              />
            </div>
          </form>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar>
                  <AvatarFallback>
                    <i className="pi pi-user" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              {userItems?.length > 0 &&
                userItems.map((item) => getMenuItemForDropdown(item))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
