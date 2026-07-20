"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type HeaderBreadcrumbItem = {
  label: string;
  href?: string;
};

type HeaderBreadcrumbContextValue = {
  override: HeaderBreadcrumbItem[] | null;
  setOverride: (items: HeaderBreadcrumbItem[] | null) => void;
};

const HeaderBreadcrumbContext =
  createContext<HeaderBreadcrumbContextValue | null>(null);

export function HeaderBreadcrumbProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [override, setOverrideState] = useState<HeaderBreadcrumbItem[] | null>(
    null,
  );

  const setOverride = useCallback((items: HeaderBreadcrumbItem[] | null) => {
    setOverrideState(items);
  }, []);

  const value = useMemo(
    () => ({ override, setOverride }),
    [override, setOverride],
  );

  return (
    <HeaderBreadcrumbContext.Provider value={value}>
      {children}
    </HeaderBreadcrumbContext.Provider>
  );
}

export function useHeaderBreadcrumbOverride() {
  const ctx = useContext(HeaderBreadcrumbContext);
  if (!ctx) {
    throw new Error(
      "useHeaderBreadcrumbOverride must be used within HeaderBreadcrumbProvider",
    );
  }
  return ctx;
}

/** Define breadcrumbs dinâmicos no header (ex.: nome do paciente). Limpa ao desmontar. */
export function SetHeaderBreadcrumbs({
  items,
}: {
  items: HeaderBreadcrumbItem[];
}) {
  const { setOverride } = useHeaderBreadcrumbOverride();
  const serialized = JSON.stringify(items);

  useEffect(() => {
    setOverride(JSON.parse(serialized) as HeaderBreadcrumbItem[]);
    return () => setOverride(null);
  }, [serialized, setOverride]);

  return null;
}
