import React from "react";
import { createRoot } from "react-dom/client";
import { Refine, type DataProvider } from "@refinedev/core";
import { App } from "./app";
import "./index.css";

const SITE_THEMES = ["cryptid", "seance", "cosmic", "asylum", "fieldops", "gothicnight"] as const;
const applyInitialSiteTheme = () => {
  try {
    const stored = window.localStorage.getItem("tpiSiteTheme");
    const theme = stored && SITE_THEMES.includes(stored as (typeof SITE_THEMES)[number]) ? stored : "cryptid";
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = "cryptid";
  }
};

applyInitialSiteTheme();

const unsupported = async () => { throw new Error("This preview action is not connected to an existing TPI API contract."); };

const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {
    if (resource !== "members") return { data: [], total: 0 };
    const params = new URLSearchParams();
    const page = pagination?.currentPage || 1;
    const pageSize = pagination?.pageSize || 25;
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    const search = filters?.find((filter) => "field" in filter && filter.field === "search" && "value" in filter)?.value;
    if (search) params.set("search", String(search));
    const status = filters?.find((filter) => "field" in filter && filter.field === "status" && "value" in filter)?.value;
    const role = filters?.find((filter) => "field" in filter && filter.field === "role" && "value" in filter)?.value;
    if (status) params.set("status", String(status));
    if (role) params.set("role", String(role));
    const sorter = sorters?.[0];
    if (sorter?.field) {
      params.set("sort", String(sorter.field));
      params.set("direction", sorter.order === "asc" ? "asc" : "desc");
    }
    const response = await fetch(`/api/admin/members?${params.toString()}`, { credentials: "same-origin" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Member list could not be loaded.");
    return { data: body.members || [], total: body.pagination?.total || 0 };
  },
  getApiUrl: () => "/api",
  getOne: unsupported,
  getMany: unsupported,
  create: unsupported,
  update: unsupported,
  deleteOne: unsupported,
  custom: unsupported,
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Refine dataProvider={dataProvider} resources={[{ name: "members", list: "/members", show: "/members/:id" }]}>
      <App />
    </Refine>
  </React.StrictMode>,
);
