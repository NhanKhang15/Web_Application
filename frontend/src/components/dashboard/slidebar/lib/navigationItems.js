// src/slidebar/lib/navigationItems.js
import { Gavel, User, Settings, Briefcase, Wrench, Info } from "lucide-react";

export const navigationItems = [
  { key: "auction",  icon: Gavel,     label: "AUCTION"  },
  { key: "user",     icon: User,      label: "USER"     },
  { key: "settings", icon: Settings,  label: "SETTINGS" },
  { key: "trader",   icon: Briefcase, label: "TRADER"   },
  { key: "utils",    icon: Wrench,    label: "UTILITIES"},
  { key: "about",    icon: Info,      label: "ABOUT US" },
];
