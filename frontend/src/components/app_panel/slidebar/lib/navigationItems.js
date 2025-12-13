// src/slidebar/lib/navigationItems.js
import { Gavel, User, Settings, Briefcase, Wrench, Info, Store } from "lucide-react";

export const navigationItems = [
    { key: "auction", icon: Gavel, label: "AUCTION", transKey: "nav_auction", path: "auctions" },
    { key: "seller", icon: Store, label: "SELLER", transKey: "nav_seller", path: "seller" },
    { key: "user", icon: User, label: "USER", transKey: "nav_user", path: "user" },
    { key: "settings", icon: Settings, label: "SETTINGS", transKey: "nav_settings", path: "settings" },
    { key: "trader", icon: Briefcase, label: "TRADER", transKey: "nav_trader", path: "trader" },
    { key: "utils", icon: Wrench, label: "UTILITIES", transKey: "nav_utilities", path: "utils" },
    { key: "about", icon: Info, label: "ABOUT US", transKey: "nav_about_us", path: "about" },
];
