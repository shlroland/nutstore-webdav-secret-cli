import type { SecretItem } from "./types";

export const WEBDAV_URL = "https://dav.jianguoyun.com/dav/";
export const ACCOUNT = "user@example.com";

export const initialSecrets: SecretItem[] = [
  {
    id: "sec_raycast",
    name: "Raycast",
    password: "nsc_app_9vK3pQ7Lm2Xz",
    createdAt: "2026-05-28",
  },
  {
    id: "sec_obsidian",
    name: "Obsidian Sync Backup",
    password: "nsc_app_B8mN4tYw6QaR",
    createdAt: "2026-04-12",
  },
  {
    id: "sec_alfred",
    name: "Alfred Workflow",
    password: "nsc_app_U2hK7dPq5VzE",
    createdAt: "2026-03-09",
  },
  {
    id: "sec_backup",
    name: "Server Backup",
    password: "nsc_app_H4xT8rLm1CyN",
    createdAt: "2026-01-21",
  },
  {
    id: "sec_mobile",
    name: "Mobile WebDAV",
    password: "nsc_app_M6qP2zLf8TaK",
    createdAt: "2025-12-18",
  },
];
