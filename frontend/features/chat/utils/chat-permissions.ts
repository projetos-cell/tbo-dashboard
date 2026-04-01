/**
 * Channel-level permission checks.
 *
 * These complement the global RBAC in `permissions.ts` with
 * channel-scoped rules based on member role and channel settings.
 *
 * Global roles (RoleSlug): "admin" | "lider" | "colaborador"
 * Note: "admin" encompasses both founder and diretoria (mapped in auth.ts).
 */

import { hasPermission, type RoleSlug, type PermissionKey } from "@/lib/permissions";

export type ChannelAction =
  | "send_message"
  | "delete_message"
  | "manage_members"
  | "edit_channel"
  | "archive_channel"
  | "pin_message";

interface ChannelPermissionContext {
  /** Global role slug: "admin" (founder+diretoria), "lider", "colaborador" */
  userRole: string | null;
  /** User's role within the channel (admin | member | null if not a member) */
  channelMemberRole: string | null;
  /** Channel settings (who_can_post, is_read_only, etc.) */
  channelSettings?: {
    who_can_post?: "everyone" | "admins";
    is_read_only?: boolean;
  } | null;
  /** Whether the user is the channel creator */
  isCreator: boolean;
}

/**
 * Map channel actions to global RBAC permissions for elevated access.
 * Users with the global permission bypass channel-level restrictions.
 */
const ACTION_PERMISSION_MAP: Partial<Record<ChannelAction, PermissionKey>> = {
  delete_message: "chat.delete_messages",
  manage_members: "chat.manage_channels",
  edit_channel: "chat.manage_channels",
  archive_channel: "chat.manage_channels",
};

export function canPerformChannelAction(
  action: ChannelAction,
  ctx: ChannelPermissionContext,
): boolean {
  const { userRole, channelMemberRole, channelSettings, isCreator } = ctx;

  // Not a member of the channel → no actions allowed
  if (!channelMemberRole) return false;

  // Check global RBAC: admin (founder+diretoria) can always act.
  // Also checks specific permissions (e.g. lider with chat.manage_channels).
  const globalPerm = ACTION_PERMISSION_MAP[action];
  if (globalPerm && hasPermission(userRole as RoleSlug | null, globalPerm)) {
    return true;
  }
  // admin role always has full channel access
  if (userRole === "admin") return true;

  const isChannelAdmin = channelMemberRole === "admin";

  switch (action) {
    case "send_message": {
      if (channelSettings?.is_read_only) return isChannelAdmin || isCreator;
      if (channelSettings?.who_can_post === "admins")
        return isChannelAdmin || isCreator;
      return true;
    }

    case "delete_message":
      // Own messages handled in UI; this is for deleting others' messages
      return isChannelAdmin || isCreator;

    case "manage_members":
      return isChannelAdmin || isCreator;

    case "edit_channel":
      return isChannelAdmin || isCreator;

    case "archive_channel":
      return isChannelAdmin || isCreator;

    case "pin_message":
      return isChannelAdmin || isCreator;

    default:
      return false;
  }
}
