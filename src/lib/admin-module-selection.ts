import type { AdminModule } from "@/components/admin/admin-nav";

const STORAGE_KEY = "rp_admin_selected_module_v1";

export function readAdminModulePreference(): AdminModule | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(STORAGE_KEY);
    if (value === "experiences" || value === "homestays" || value === "vip") {
      return value;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function writeAdminModulePreference(module: AdminModule) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, module);
  } catch {
    /* ignore */
  }
}
