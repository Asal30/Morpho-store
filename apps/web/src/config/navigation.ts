export interface NavigationItem {
  label: string;
  href: string;
}

export interface FooterNavigationGroup {
  label: string;
  items: readonly NavigationItem[];
}

export const primaryNavigation = [
  { label: "Shop", href: "/shop" },
  { label: "Customize", href: "/customize" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const satisfies readonly NavigationItem[];

export const utilityNavigation = [
  { label: "Search", href: "/shop" },
  { label: "Account", href: "/account" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Cart", href: "/cart" },
] as const satisfies readonly NavigationItem[];

export const footerNavigation = [
  {
    label: "Shop",
    items: [
      { label: "Oversized", href: "/shop?category=oversized" },
      { label: "Raglan", href: "/shop?category=raglan" },
      { label: "Customize", href: "/customize" },
    ],
  },
  {
    label: "Help",
    items: [
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns", href: "/returns" },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "About MORPHO", href: "/about" },
      { label: "Account", href: "/account" },
    ],
  },
] as const satisfies readonly FooterNavigationGroup[];

export const socialChannels = ["Instagram", "Facebook"] as const;
