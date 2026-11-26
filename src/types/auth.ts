export interface LoginCredentials {
  username: string;
  password: string;
}

export type LoginField = keyof LoginCredentials;

export type FieldErrors<TField extends string> = Partial<Record<TField, string>>;

export interface LoginOptions {
  /** Keep the session beyond the current browser session. */
  remember?: boolean;
}

/** One partner office the administrator can act for (from the existing CONTACT rows). */
export interface AdminPartnerAccess {
  partnerId: number;
  partnerName: string | null;
  /** The administrator's own CONTACT row for this partner. */
  contactId: number;
  isMainContact: boolean;
}

/** The signed-in administrator, as returned by GET /api/admin/auth/me. */
export interface AdminUser {
  mainContactId: number;
  username: string;
  /** Display name: the main contact's name, or the username when it has none. */
  name: string;
  email: string | null;
  partners: AdminPartnerAccess[];
  authorizedPartnerIds: number[];
  authorizedPartnerContactIds: number[];
  selectedPartnerContactId: number;
  selectedPartnerId: number | null;
  sessionExpiresAt: string;
}
