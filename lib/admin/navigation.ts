import {
  Award,
  Briefcase,
  Calendar,
  Code2,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LayoutPanelLeft,
  Search,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isLegacy?: boolean;
  isComingSoon?: boolean;
  badgeText?: string;
  description?: string;
}

export interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        description: "CMS overview & system status",
      },
    ],
  },
  {
    groupLabel: "Content",
    items: [
      {
        label: "Site Content",
        href: "/admin/dashboard/site-content",
        icon: LayoutPanelLeft,
        description: "Global hero, bio, contact & footer contracts",
      },
    ],
  },
  {
    groupLabel: "Experience",
    items: [
      {
        label: "Roles",
        href: "/admin/dashboard/experience/roles",
        icon: Briefcase,
        description: "Professional, leadership & community roles",
      },
      {
        label: "Education",
        href: "/admin/dashboard/experience/education",
        icon: GraduationCap,
        description: "Degrees & academic background",
      },
    ],
  },
  {
    groupLabel: "Work",
    items: [
      {
        label: "Projects",
        href: "/admin/dashboard/projects",
        icon: FolderKanban,
        description: "Active projects & case studies",
      },
      {
        label: "Events",
        href: "/admin/dashboard/events",
        icon: Calendar,
        description: "Hackathons, competitions & workshops",
      },
    ],
  },
  {
    groupLabel: "Achievements",
    items: [
      {
        label: "Awards",
        href: "/admin/dashboard/achievements/awards",
        icon: Award,
        description: "Honors, hackathon wins & competitions",
      },
      {
        label: "Certifications",
        href: "/admin/dashboard/achievements/certifications",
        icon: ShieldCheck,
        description: "Course credentials & verified certifications",
      },
    ],
  },
  {
    groupLabel: "Taxonomy",
    items: [
      {
        label: "Skills",
        href: "/admin/dashboard/skills",
        icon: Code2,
        description: "Technical skills taxonomy & order",
      },
    ],
  },
  {
    groupLabel: "Assets",
    items: [

      {
        label: "Resume",
        href: "/admin/dashboard/resume",
        icon: FileText,
        description: "Resume PDF management & activation",
      },
    ],
  },
  {
    groupLabel: "Discoverability",
    items: [
      {
        label: "SEO",
        href: "/admin/dashboard/seo",
        icon: Search,
        description: "Search metadata & open-graph settings",
      },
    ],
  },
  {
    groupLabel: "System",
    items: [
      {
        label: "Settings",
        href: "/admin/dashboard/settings",
        icon: Settings,
        description: "Global site configuration & environment",
      },
    ],
  },
];
