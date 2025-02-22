"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
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

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen bg-gray-900 text-white
        transition-all duration-300 ease-in-out z-10000
        ${isExpanded ? "w-64" : "w-20"}
        ${isExpanded ? "translate-x-0" : "-translate-x-0"}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-4 top-8 bg-gray-900 rounded-full p-1.5 
          hover:bg-gray-800 transition-colors duration-200"
      >
        {isExpanded ? <MdChevronLeft size={20} /> : <MdMenu size={20} />}
      </button>

      {/* Header */}
      <div className={`p-4 ${isExpanded ? "px-4" : "px-2"}`}>
        <h2
          className={`text-xl font-bold mb-4 overflow-hidden whitespace-nowrap
          transition-all duration-300 ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
        >
          EmpiFi
        </h2>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          <NavItem
            href="/dashboard"
            icon={<MdDashboard size={24} />}
            text="Dashboard"
            isExpanded={isExpanded}
          />
          <NavItem
            href="/simulator"
            icon={<MdTimeline size={24} />}
            text="Future Scenarios"
            isExpanded={isExpanded}
          />
          <NavItem
            href="/investment-map"
            icon={<MdMap size={24} />}
            text="Investment Map"
            isExpanded={isExpanded}
          />
          <NavItem
            href="/news"
            icon={<MdNewspaper size={24} />}
            text="Financial News"
            isExpanded={isExpanded}
          />

          {/* User Section */}
          <li
            className={`mt-8 pt-4 border-t border-gray-700 
            ${isExpanded ? "px-0" : "px-2"}`}
          >
            {isLoading ? (
              <span className="text-gray-400">
                {isExpanded ? "Loading..." : "..."}
              </span>
            ) : user ? (
              <div className="space-y-2">
                <div
                  className={`transition-all duration-300 overflow-hidden
                  ${isExpanded ? "opacity-100 h-auto" : "opacity-0 h-0"}`}
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
                  {isExpanded ? "Sign Out" : "←"}
                </Link>
              </div>
            ) : (
              <Link
                href="/api/auth/login"
                className="text-green-400 hover:text-green-300 transition-colors duration-200
                  inline-block"
              >
                {isExpanded ? "Sign In" : "→"}
              </Link>
            )}
          </li>
        </ul>
      </nav>
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity md:hidden z-30"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </aside>
  );
}

// NavItem Component
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
