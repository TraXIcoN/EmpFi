"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useState } from "react";
import {
  MdDashboard,
  MdTimeline,
  MdMap,
  MdMenu,
  MdChevronLeft,
  MdNewspaper,
} from "react-icons/md";
import { useSidebar } from "@/context/SidebarContext";

export default function Sidebar() {
  const { user, isLoading } = useUser();
  const { isExpanded, setIsExpanded } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);

  const shouldExpand = isExpanded || isHovered;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed left-0 top-0 h-screen bg-gray-900 text-white
        transition-all duration-300 ease-in-out z-[100] justify-between
        ${shouldExpand ? "w-64" : "w-20"}
        ${shouldExpand ? "translate-x-0" : "-translate-x-0"}
        hover:shadow-2xl
      `}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          absolute top-8 left-1/2 transform -translate-x-1/2
          bg-gray-900 rounded-full p-2
          hover:bg-gray-800 transition-colors duration-200 pr-[5px]
          ${!isHovered && isExpanded ? "opacity-0" : "opacity-100"}
          transition-opacity duration-300
        `}
      >
        {shouldExpand ? <MdChevronLeft size={20} /> : <MdMenu size={20} />}
      </button>

      <div className={`p-4 ${shouldExpand ? "px-4" : "px-2"}`}>
        <h2
          className={`text-xl font-bold mb-4 overflow-hidden whitespace-nowrap
          transition-all duration-300 ${
            shouldExpand ? "opacity-100" : "opacity-0"
          }`}
        >
          EmpiFi
        </h2>
      </div>

      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          <NavItem
            href="/dashboard"
            icon={<MdDashboard size={24} />}
            text="Dashboard"
            isExpanded={shouldExpand}
          />
          <NavItem
            href="/simulator"
            icon={<MdTimeline size={24} />}
            text="Future Scenarios"
            isExpanded={shouldExpand}
          />
          <NavItem
            href="/investment-map"
            icon={<MdMap size={24} />}
            text="Investment Map"
            isExpanded={shouldExpand}
          />
          <NavItem
            href="/news"
            icon={<MdNewspaper size={24} />}
            text="Financial News"
            isExpanded={shouldExpand}
          />
        </ul>
      </nav>

      <div
        className={`p-4 border-t border-gray-700 ${
          shouldExpand ? "px-0" : "px-2"
        }`}
      >
        {isLoading ? (
          <span className="text-gray-400">
            {shouldExpand ? "Loading..." : "..."}
          </span>
        ) : user ? (
          <div className="space-y-2">
            <div
              className={`transition-all duration-300 overflow-hidden
              ${shouldExpand ? "opacity-100 h-auto" : "opacity-0 h-0"}`}
            >
              <span className="text-sm text-gray-400">
                Signed in as {user.email}
              </span>
            </div>
            <Link
              href="/api/auth/logout"
              className="text-red-400 hover:text-red-300 transition-colors duration-200
                inline-block"
            >
              {shouldExpand ? "Sign Out" : "←"}
            </Link>
          </div>
        ) : (
          <Link
            href="/api/auth/login"
            className="text-green-400 hover:text-green-300 transition-colors duration-200
              inline-block"
          >
            {shouldExpand ? "Sign In" : "→"}
          </Link>
        )}
      </div>

      {(isExpanded || isHovered) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity md:hidden z-30"
          onClick={() => {
            setIsExpanded(false);
            setIsHovered(false);
          }}
        />
      )}
    </aside>
  );
}

function NavItem({
  href,
  icon,
  text,
  isExpanded,
}: {
  href: string;
  icon: React.ReactNode;
  text: string;
  isExpanded: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={`
          flex items-center space-x-3 p-2 rounded-lg
          hover:bg-gray-800 transition-all duration-200
          ${isExpanded ? "px-4" : "px-2 justify-center"}
        `}
      >
        <span className="flex-shrink-0">{icon}</span>
        <span
          className={`
          whitespace-nowrap transition-all duration-300
          ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"}
        `}
        >
          {text}
        </span>
      </Link>
    </li>
  );
}
