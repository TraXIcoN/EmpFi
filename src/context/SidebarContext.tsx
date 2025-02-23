"use client";

import { createContext, useContext, useState } from "react";

const SidebarContext = createContext({
  isExpanded: false,
  setIsExpanded: (value: boolean) => {},
});

export function SidebarProvider({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <SidebarContext.Provider value={{ isExpanded, setIsExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
