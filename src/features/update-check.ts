import { Capacitor } from "@capacitor/core";
import { showToast } from "./toast";
import { t } from "../services/i18n";

const APP_VERSION = "1.8.0";
const VERSION_URL = "https://app.trackbds.zubs.me/version.json";
const UPDATE_URL = "https://apk.trackbds.zubs.me/latest";

function parseSemver(v: string): number[] {
  return v.split(".").map((n) => parseInt(n, 10) || 0);
}

function isNewer(a: string, b: string): boolean {
  const va = parseSemver(a);
  const vb = parseSemver(b);
  for (let i = 0; i < Math.max(va.length, vb.length); i++) {
    if ((va[i] || 0) > (vb[i] || 0)) return false;
    if ((va[i] || 0) < (vb[i] || 0)) return true;
  }
  return false;
}

export async function checkForUpdate(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const res = await fetch(VERSION_URL);
    if (!res.ok) return;
    const data = await res.json();
    if (!data.version) return;
    if (!isNewer(APP_VERSION, data.version)) return;
    showToast(
      t("toast_update_available").replace("{ver}", data.version),
      "info",
      () => {
        window.open(UPDATE_URL, "_blank");
      },
      8000,
    );
  } catch {}
}
