"use client";

import { createContext, useContext } from "react";

const AdminRoleContext = createContext<string>("admin");

export const AdminRoleProvider = AdminRoleContext.Provider;

export function useAdminRole() {
  return useContext(AdminRoleContext);
}
