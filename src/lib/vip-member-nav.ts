export const VIP_MEMBER_NAV_ITEMS = [
  { to: "/member/vip", label: "VIP lounge" },
  { to: "/member/vip/packages", label: "Packages" },
  { to: "/member/vip/custom-request", label: "Custom package" },
] as const;

export const GUEST_SIGNED_IN_NAV_ITEMS = [{ to: "/experiences", label: "Experiences" }] as const;

export function isVipMemberNavItemActive(pathname: string, to: string): boolean {
  if (to === "/member/vip") {
    return pathname === "/member/vip" || pathname === "/member/vip/";
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}
