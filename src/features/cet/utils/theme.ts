/** True when the CET v2 frontend theme is enabled (server-side env flag). */
export function isCetTheme(): boolean {
  return process.env.FRONTEND_THEME === "cet-v2";
}
