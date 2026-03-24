"use client";

import { createContext, useContext } from "react";

type AdminUser = { role: string; userId: string };

const AdminRoleContext = createContext<AdminUser>({ role: "admin", userId: "" });

export const AdminRoleProvider = AdminRoleContext.Provider;

/** Geriye uyumlu — sadece rol string'i döner */
export function useAdminRole() {
  return useContext(AdminRoleContext).role;
}

/** Rol + userId birlikte döner */
export function useAdminUser() {
  return useContext(AdminRoleContext);
}
