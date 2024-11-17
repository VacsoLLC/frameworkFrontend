import * as React from 'react';
import {ChevronDown, Search, User} from 'lucide-react';

import {Input} from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {Button} from './ui/button';
import {Avatar, AvatarFallback} from './ui/avatar';
import CustomIcon from './CustomIcon';

const Link = ({children, href}) => <a href={href}>{children}</a>;

const getMenuItemForDropdown = (subItem) => {
  return (
    <DropdownMenuItem
      onClick={(e) => {
        subItem.command();
      }}
      className="cursor-pointer p-2 my-2"
      key={subItem.label}
    >
      <CustomIcon name={subItem.icon} className={'mx-1'} />
      {subItem.label}
    </DropdownMenuItem>
  );
};

const getDropdownForItem = (item) => {
  console.log(item);
  return (
    <DropdownMenu key={item.label}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <CustomIcon name={item.icon} className={'mx-1'} />
          {item.label}
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
      <div className="flex items-center px-4" style={{height: '3rem'}}>
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
                  key={navItem.label}
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
                    <User size={16} />
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
