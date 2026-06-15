import { cn } from "@/lib/utils";

interface PartnerLogoProps {
  className?: string;
}

export function VidaClinLogo({ className }: PartnerLogoProps) {
  return (
    <svg
      role="img"
      aria-label="Clínica VidaClín"
      viewBox="0 0 160 40"
      width={160}
      height={40}
      className={cn("h-11 w-auto sm:h-12", className)}
    >
      <circle cx="18" cy="20" r="14" fill="currentColor" opacity="0.15" />
      <path
        d="M18 12v16M10 20h16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <text
        x="40"
        y="18"
        fill="currentColor"
        fontSize="13"
        fontWeight="700"
        fontFamily="inherit"
      >
        VidaClín
      </text>
      <text
        x="40"
        y="30"
        fill="currentColor"
        opacity="0.55"
        fontSize="7"
        fontWeight="500"
        letterSpacing="0.12em"
        fontFamily="inherit"
      >
        SAÚDE INTEGRAL
      </text>
    </svg>
  );
}

export function HorizonteMedicoLogo({ className }: PartnerLogoProps) {
  return (
    <svg
      role="img"
      aria-label="Instituto Horizonte Médico"
      viewBox="0 0 180 40"
      width={180}
      height={40}
      className={cn("h-11 w-auto sm:h-12", className)}
    >
      <path
        d="M4 28 Q22 8 40 28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="22" cy="16" r="3" fill="currentColor" />
      <text
        x="48"
        y="18"
        fill="currentColor"
        fontSize="12"
        fontWeight="700"
        fontFamily="inherit"
      >
        Horizonte
      </text>
      <text
        x="48"
        y="30"
        fill="currentColor"
        opacity="0.55"
        fontSize="7"
        fontWeight="600"
        letterSpacing="0.14em"
        fontFamily="inherit"
      >
        INSTITUTO MÉDICO
      </text>
    </svg>
  );
}

export function EsteticaPrimeLogo({ className }: PartnerLogoProps) {
  return (
    <svg
      role="img"
      aria-label="Estética Prime"
      viewBox="0 0 170 40"
      width={170}
      height={40}
      className={cn("h-11 w-auto sm:h-12", className)}
    >
      <path
        d="M16 8 L24 20 L16 32 L8 20 Z"
        fill="currentColor"
        opacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="20" r="3" fill="currentColor" />
      <text
        x="34"
        y="18"
        fill="currentColor"
        fontSize="12"
        fontWeight="600"
        fontStyle="italic"
        fontFamily="inherit"
      >
        Estética
      </text>
      <text
        x="34"
        y="30"
        fill="currentColor"
        fontSize="11"
        fontWeight="700"
        letterSpacing="0.08em"
        fontFamily="inherit"
      >
        PRIME
      </text>
    </svg>
  );
}

export function CentroSaudeLogo({ className }: PartnerLogoProps) {
  return (
    <svg
      role="img"
      aria-label="Centro Saúde Brasil"
      viewBox="0 0 175 40"
      width={175}
      height={40}
      className={cn("h-11 w-auto sm:h-12", className)}
    >
      <rect
        x="4"
        y="8"
        width="24"
        height="24"
        rx="6"
        fill="currentColor"
        opacity="0.12"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <text
        x="16"
        y="24"
        fill="currentColor"
        fontSize="9"
        fontWeight="800"
        textAnchor="middle"
        fontFamily="inherit"
      >
        CSB
      </text>
      <text
        x="36"
        y="18"
        fill="currentColor"
        fontSize="11"
        fontWeight="700"
        fontFamily="inherit"
      >
        Centro Saúde
      </text>
      <text
        x="36"
        y="30"
        fill="currentColor"
        opacity="0.55"
        fontSize="7"
        fontWeight="500"
        letterSpacing="0.1em"
        fontFamily="inherit"
      >
        BRASIL
      </text>
    </svg>
  );
}

export function OdontoVitalLogo({ className }: PartnerLogoProps) {
  return (
    <svg
      role="img"
      aria-label="Odonto Vital"
      viewBox="0 0 155 40"
      width={155}
      height={40}
      className={cn("h-11 w-auto sm:h-12", className)}
    >
      <path
        d="M14 10 C14 10 8 14 8 22 C8 30 14 34 14 34 C14 34 20 30 20 22 C20 14 14 10 14 10Z"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 18 C12 18 14 16 16 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <text
        x="30"
        y="18"
        fill="currentColor"
        fontSize="12"
        fontWeight="700"
        fontFamily="inherit"
      >
        odonto
      </text>
      <text
        x="30"
        y="30"
        fill="currentColor"
        fontSize="11"
        fontWeight="600"
        letterSpacing="0.06em"
        fontFamily="inherit"
      >
        vital
      </text>
    </svg>
  );
}

export const PARTNER_LOGOS = [
  { id: "vida-clin", name: "Clínica VidaClín", Logo: VidaClinLogo },
  { id: "horizonte", name: "Instituto Horizonte Médico", Logo: HorizonteMedicoLogo },
  { id: "estetica-prime", name: "Estética Prime", Logo: EsteticaPrimeLogo },
  { id: "centro-saude", name: "Centro Saúde Brasil", Logo: CentroSaudeLogo },
  { id: "odonto-vital", name: "Odonto Vital", Logo: OdontoVitalLogo },
] as const;
