"use client";

import { Badge } from "@/components/ui/badge";
import {
  CONTRACT_INTERNAL_STATUS,
  CLICKSIGN_STATUS,
  SIGNER_STATUS,
  SCOPE_ITEM_STATUS,
  type ContractInternalStatusKey,
  type ClicksignStatusKey,
  type SignerStatusKey,
  type ScopeItemStatusKey,
} from "../schemas/contract-schemas";

type StatusType = "contract" | "clicksign" | "signer" | "scope";

interface ContractStatusBadgeProps {
  status: string;
  type?: StatusType;
  className?: string;
}

const STATUS_MAPS: Record<StatusType, Record<string, { label: string; color: string; bg: string }>> = {
  contract: CONTRACT_INTERNAL_STATUS,
  clicksign: CLICKSIGN_STATUS,
  signer: SIGNER_STATUS,
  scope: SCOPE_ITEM_STATUS,
};

export function ContractStatusBadge({
  status,
  type = "contract",
  className,
}: ContractStatusBadgeProps) {
  const map = STATUS_MAPS[type];
  const config = map[status];

  if (!config) {
    return (
      <Badge variant="secondary" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge
      className={className}
      style={{
        color: config.color,
        backgroundColor: config.bg,
        borderColor: "transparent",
      }}
    >
      {config.label}
    </Badge>
  );
}
