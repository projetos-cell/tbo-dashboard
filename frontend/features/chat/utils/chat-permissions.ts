/**
 * Channel-level permission checks.
 *
 * These complement the global RBAC in `permissions.ts` with
 * channel-scoped rules based on member role and channel settings.
 */

export type ChannelAction =
  | "send_message"
  | "delete_message"
  | "manage_members"
  | "edit_channel"
  | "archive_channel";

interface ChannelPermissionContext {
  /** Global role slug (founder, diretoria, lider, colaborador) */
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

const ELEVATED_ROLES = new Set(["founder", "diretoria"]);

export function canPerformChannelAction(
  action: ChannelAction,
  ctx: ChannelPermissionContext,
): boolean {
  const { userRole, channelMemberRole, channelSettings, isCreator } = ctx;

  // Not a member of the channel → no actions allowed
  if (!channelMemberRole) return false;

  // Elevated global roles can always act
  if (userRole && ELEVATED_ROLES.has(userRole)) return true;

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

    default:
      return false;
  }
}
