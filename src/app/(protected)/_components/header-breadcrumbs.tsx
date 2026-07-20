"use client";

import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useProfessionalLabels } from "@/hooks/use-professional-labels";

import {
  HeaderBreadcrumbItem,
  useHeaderBreadcrumbOverride,
} from "./header-breadcrumb-context";

function crumbsFromPathname(
  pathname: string,
  professionalPlural: string,
): HeaderBreadcrumbItem[] {
  if (pathname.startsWith("/admin")) {
    return [{ label: "Plataforma" }, { label: "Administração" }];
  }

  const home: HeaderBreadcrumbItem = { label: "Início", href: "/dashboard" };

  if (pathname.startsWith("/dashboard")) {
    return [home, { label: "Dashboard" }];
  }
  if (pathname.startsWith("/appointments")) {
    return [home, { label: "Agendamentos" }];
  }
  if (pathname.startsWith("/doctors")) {
    return [home, { label: professionalPlural }];
  }
  if (pathname.startsWith("/patients")) {
    return [home, { label: "Pacientes" }];
  }
  if (pathname.match(/^\/medical-records\/[^/]+/)) {
    return [
      home,
      { label: "Prontuários", href: "/medical-records" },
      { label: "Detalhe" },
    ];
  }
  if (pathname.startsWith("/medical-records")) {
    return [home, { label: "Prontuários" }];
  }
  if (pathname.startsWith("/notifications")) {
    return [home, { label: "Notificações" }];
  }
  if (pathname.startsWith("/settings")) {
    return [home, { label: "Configurações" }];
  }
  if (pathname.startsWith("/subscription")) {
    return [home, { label: "Assinatura" }];
  }

  return [home];
}

export function HeaderBreadcrumbs() {
  const pathname = usePathname();
  const { plural } = useProfessionalLabels();
  const { override } = useHeaderBreadcrumbOverride();

  const items = override ?? crumbsFromPathname(pathname, plural);

  if (items.length === 0) return null;

  return (
    <Breadcrumb className="min-w-0 flex-1 px-3">
      <BreadcrumbList className="flex-nowrap overflow-hidden text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <div key={`${item.label}-${index}`} className="contents">
              {index > 0 && <BreadcrumbSeparator className="shrink-0" />}
              <BreadcrumbItem className="min-w-0 shrink truncate">
                {isLast ? (
                  <BreadcrumbPage className="truncate font-semibold text-[var(--primary)]">
                    {item.label}
                  </BreadcrumbPage>
                ) : item.href ? (
                  <BreadcrumbLink href={item.href} className="truncate">
                    {item.label}
                  </BreadcrumbLink>
                ) : (
                  <span className="text-muted-foreground truncate">
                    {item.label}
                  </span>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
