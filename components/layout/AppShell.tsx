"use client"

import * as React from "react"
import Link from "next/link"
import LogoutButton from "@/components/ui/logoutbutton"
import { usePathname } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getUserAndBusinessDetails } from "@/app/action/auth"
import {
  LayoutDashboard,
  Package,
  FileText,
  Settings,
  LogOut,
  Laptop,
  ShoppingBag,
  Wallet,
  ReceiptText,
  Users
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight } from "lucide-react"
import { title } from "process"

const navGroups = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [
      {
        title: "Overview",
        url: "/dashboard",
      },
      {
        title: "Reports",
        url: "/dashboard/reports",
      },
    ]
  },
  {
    title: "Products",
    icon: Package,
    items: [
      {
        title: "All Products",
        url: "/products",
      },
      {
        title: "Stock",
        url: "/products/stocks",
      },
      {
        title: "Brands",
        url: "/products/brands",
      }
    ]
  },
  {
    title: "Vendors",
    icon: ShoppingBag,
    items: [
      {
        title: "All Vendors",
        url: "/vendors",
      },
      {
        title: "Local Vendors",
        url: "/vendors/Localvendors",
      },
    ]
  },
  {
    title: "Accounts",
    icon: Wallet,
    items: [
      {
        title: "All Invoices",
        url: "/accounts",
      },
      {
        title: "Add Invoices",
        url: "/accounts/add-invoice",
      },
      {
        title: "Add Quotation",
        url: "/accounts/addquotation"
      },
      {
        title: "All Quotation",
        url: "/accounts/Quotation"
      }
    ]
  },
  {
    title: "Expenses",
    icon: ReceiptText,
    items: [
      {
        title: "All Expenses",
        url: "/expenses",
      },

    ]
  },
  {
    title: "Customers",
    icon: Users,
    items: [
      {
        title: "All Customers",
        url: "/customer",
      },
    ]
  },

]

function SidebarGroupItem({ group, pathname, navGroups }: { group: any, pathname: string, navGroups: any[] }) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Collapsible defaultOpen onOpenChange={setIsOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={<SidebarMenuButton tooltip={group.title} />}
        >
          <group.icon />
          <span>{group.title}</span>
          <ChevronRight className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {group.items.map((subItem: any) => {
              const hasExactMatchInSidebar = navGroups.some((g: any) => g.items.some((i: any) => i.url === pathname))
              const isActive = pathname === subItem.url || (!hasExactMatchInSidebar && pathname?.startsWith(subItem.url + '/'))

              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    render={subItem.url === '/logout' ? <a href={subItem.url} /> : <Link href={subItem.url} />}
                    isActive={isActive}
                    className={isActive ? "bg-black text-white font-semibold shadow-md rounded-lg py-4 px-3 my-1 h-5 w-full transition-all border border-black/10" : "hover:bg-muted/50"}
                  >
                    <span>{subItem.title}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [userDetails, setUserDetails] = React.useState<{ user_name?: string; business_name?: string; user_email?: string } | null>(null)

  React.useEffect(() => {
    if (pathname !== '/login') {
      getUserAndBusinessDetails().then(data => {
        if (data) setUserDetails(data)
      })
    }
  }, [pathname])

  if (pathname === '/login') {
    return <main className="flex-1 w-full bg-muted/20">{children}</main>
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="h-16 flex items-left justify-center border-b px-6 py-4">
          <Link href="/" className="flex items-left gap-2 font-semibold">
            <Laptop className="h-6 w-6 text-primary" />
            <span className="text-lg tracking-tight">{userDetails?.business_name || "Business Name"}</span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navGroups.map((group) => (
                  <SidebarGroupItem key={group.title} group={group} pathname={pathname} navGroups={navGroups} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        {/* <SidebarFooter className="border-t p-4">
          <Link href="/logout" className="w-full">
            <LogoutButton />
          </Link>
        </SidebarFooter> */}
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6 justify-between">
          <SidebarTrigger />
          {userDetails && (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm hover:opacity-90 transition-opacity">
                  {userDetails.business_name ? userDetails.business_name.charAt(0).toUpperCase() : 'B'}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 border-b mb-1">
                  <p className="text-sm font-medium leading-none">{userDetails.user_name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">{userDetails.user_email || ''}</p>
                </div>
                <DropdownMenuItem
                  onClick={() => { window.location.href = "/logout" }}
                  className="w-full flex items-center cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>
        <main className="flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
