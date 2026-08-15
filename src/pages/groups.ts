import { supabase } from "../services/supabase";
import { showToast } from "../features/toast";
import { getNavGeneration, setSubView, updateFABVisibility } from "../core/app";
import {
  getStore,
  refreshAll,
  addGroup,
  removeGroup,
  replaceGroup,
  clearGroupFromBirthdays,
  updateGroup,
  restoreGroupAt,
} from "../services/store";
import { t } from "../services/i18n";
import { LETTER_COLORS } from "../utils/utils";
import { setSubviewStack, clearSubviewStack } from "../core/nav-state";
import type { GroupDetailSubview, GroupsAddSubview } from "../core/nav-state";
import {
  animatePageEnter,
  animateSlideUp,
  animateListItems,
  animateSheetIn,
  bindButtonFeedback,
} from "../features/animations";

const GROUP_COLORS = Object.values(LETTER_COLORS);

export async function renderGroups(
  container: HTMLElement,
  gen = 0,
  isMainView = true,
) {
  const groups = getStore().groups;
  if (!container.isConnected || gen !== getNavGeneration()) return;

  setSubView(!isMainView);
  updateFABVisibility();
  if (isMainView) clearSubviewStack("groups");

  container.innerHTML = `
    <style>
      .groups-header {
        position:sticky;top:0;z-index:40;
        background:var(--cream);
        border-bottom:3px solid var(--ink);
        display:flex;align-items:center;justify-content:space-between;
        padding:0.9rem 1.25rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .groups-header-title {
        font-family:'Archivo Black',sans-serif;
        font-size:1.3rem;text-transform:uppercase;
        letter-spacing:-0.05em;color:var(--ink);margin:0;
        transition:color 0.3s ease;
      }
      .groups-add-btn {
        background:var(--lime);color:var(--on-accent-dark);
        border:2px solid var(--ink);border-radius:999px;
        box-shadow:4px 4px 0 var(--ink);
        padding:0.4rem 1rem;
        font-family:'Inter',sans-serif;font-weight:900;font-size:0.78rem;
        text-transform:uppercase;letter-spacing:0.06em;
        cursor:pointer;display:flex;align-items:center;gap:5px;
        transition:transform 0.15s ease, box-shadow 0.15s ease,
          background-color 0.3s ease, border-color 0.3s ease;
      }
      .groups-add-btn:hover { transform:translate(3px,3px); box-shadow:1px 1px 0 var(--ink); }

      .group-card {
        background:var(--paper);
        border:2px solid var(--ink);
        border-radius:1.25rem;
        box-shadow:4px 4px 0 var(--ink);
        padding:1rem 1.25rem;
        display:flex;align-items:center;justify-content:space-between;
        cursor:pointer;
        transition:background-color 0.3s ease, box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
          border-color 0.3s ease;
      }
      .group-card:hover { transform:translate(-2px, -2px); box-shadow:6px 6px 0 var(--ink); }

      .groups-modal-overlay {
        display:none;position:fixed;inset:0;
        background:rgba(0,0,0,0.55);
        z-index:100;align-items:flex-end;justify-content:center;
      }
      .groups-modal-sheet {
        background:var(--paper);
        width:100%;
        border-radius:1.5rem 1.5rem 0 0;
        border:2px solid var(--ink);border-bottom:none;
        box-shadow:none;
        padding:1.5rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .groups-modal-title {
        font-family:'Archivo Black',sans-serif;
        font-size:1.2rem;text-transform:uppercase;
        letter-spacing:-0.04em;color:var(--ink);
        margin:0 0 1.25rem;
        transition:color 0.3s ease;
      }
      .groups-modal-input {
        width:100%;height:48px;
        background:var(--cream);
        border:2px solid var(--ink);border-radius:0.85rem;
        padding:0 1rem;font-size:0.95rem;
        font-family:'Inter',sans-serif;font-weight:500;
        color:var(--ink);outline:none;box-sizing:border-box;
        margin-bottom:1rem;
        transition:box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
      }
      .groups-modal-input:focus { box-shadow:4px 4px 0 var(--ink); }
      .groups-modal-input::placeholder { color:var(--muted);font-weight:400; }

      .modal-field-label {
        font-size:0.68rem;font-weight:900;text-transform:uppercase;
        letter-spacing:0.1em;color:var(--brown);
        display:block;margin-bottom:8px;
        transition:color 0.3s ease;
      }
      .modal-cancel-btn {
        flex:1;height:48px;
        background:var(--cream);border:2px solid var(--ink);
        border-radius:999px;box-shadow:3px 3px 0 var(--ink);
        color:var(--muted);font-weight:700;
        font-family:'Inter',sans-serif;font-size:0.88rem;
        cursor:pointer;
        transition:transform 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
      }
      .modal-cancel-btn:hover { transform:translate(2px,2px); box-shadow:1px 1px 0 var(--ink); color:var(--orange); }
      .modal-save-btn {
        flex:2;height:48px;
        background:var(--orange);color:var(--on-accent-light);
        border:2px solid var(--ink);border-radius:999px;
        box-shadow:4px 4px 0 var(--ink);
        font-weight:900;font-family:'Inter',sans-serif;font-size:0.95rem;
        cursor:pointer;
        transition:transform 0.15s ease, box-shadow 0.15s ease,
          background-color 0.3s ease, border-color 0.3s ease;
      }
      .modal-save-btn:hover { transform:translate(3px,3px); box-shadow:1px 1px 0 var(--ink); }
      .modal-save-btn:disabled { opacity:0.6;cursor:not-allowed;transform:none; }
    </style>

    <header class="groups-header">
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="material-symbols-outlined" style="font-size:1.5rem;color:var(--orange);">group</span>
        <h1 class="groups-header-title">${t("groups_header_title")}</h1>
      </div>
      <button id="add-group-btn" class="groups-add-btn">
        <span class="material-symbols-outlined" style="font-size:1rem;">add</span>
        ${t("groups_new_button")}
      </button>
    </header>

    <div style="padding:1.25rem 1.25rem 80px;">
      <p style="font-size:0.82rem;color:var(--muted);margin:0 0 1.25rem;line-height:1.55;transition:color 0.3s ease;">${t(
        "groups_section_desc",
      )}</p>

      <div id="groups-list" style="display:flex;flex-direction:column;gap:1rem;">
        ${
          groups.length === 0
            ? `<div style="text-align:center;padding:4rem 0;">
              <span class="material-symbols-outlined" style="font-size:48px;color:var(--muted);opacity:0.4;">group</span>
              <p style="margin:1rem 0 0;font-weight:600;color:var(--ink);font-size:0.95rem;transition:color 0.3s ease;">${t(
                "groups_empty_title",
              )}</p>
              <p style="font-size:0.82rem;margin:4px 0 0;color:var(--muted);transition:color 0.3s ease;">${t(
                "groups_empty_subtitle",
              )}</p>
            </div>`
            : groups.map((g: any) => groupCard(g)).join("")
        }
      </div>
    </div>

    <!-- Add group modal -->
    <div id="add-group-modal" class="groups-modal-overlay">
      <div class="groups-modal-sheet">
        <div style="width:36px;height:4px;background:var(--ink);border-radius:999px;margin:0 auto 1.25rem;opacity:0.2;"></div>
        <h3 class="groups-modal-title">${t("groups_modal_title")}</h3>
        <input id="group-name" class="groups-modal-input" type="text" placeholder="${t(
          "groups_modal_placeholder",
        )}" autocomplete="off" />
        <div style="margin-bottom:1.25rem;">
          <label class="modal-field-label">${t(
            "groups_modal_color_label",
          )}</label>
          <div style="display:flex;align-items:center;gap:10px;">
            <div id="group-color-preview" style="width:34px;height:34px;border-radius:50%;background:${
              GROUP_COLORS[0]
            };border:2px solid var(--ink);box-shadow:none;flex-shrink:0;cursor:pointer;transition:border-color 0.3s ease;"></div>
            <span id="group-color-label" style="font-size:0.82rem;color:var(--muted);font-family:'Inter',sans-serif;font-weight:600;transition:color 0.3s ease;">${
              GROUP_COLORS[0]
            }</span>
            <input id="group-color" type="color" value="${
              GROUP_COLORS[0]
            }" style="position:absolute;opacity:0;width:0;height:0;pointer-events:none;">
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <button id="cancel-group-btn" class="modal-cancel-btn">${t(
            "groups_modal_cancel",
          )}</button>
          <button id="save-group-btn" class="modal-save-btn">${t(
            "groups_modal_create",
          )}</button>
        </div>
      </div>
    </div>
  `;

  animatePageEnter(container);
  bindButtonFeedback(container);
  animateListItems(container, "[data-group-id]", 55);
  bindGroupCardClick(container);

  document.getElementById("add-group-btn")?.addEventListener("click", () => {
    const modal = document.getElementById("add-group-modal");
    if (modal) {
      modal.style.display = "flex";
      animateSheetIn(modal);
      setSubView(true);
      const addState: GroupsAddSubview = {
        kind: "groups-add",
        values: {
          name:
            (document.getElementById("group-name") as HTMLInputElement)
              ?.value ?? "",
          color:
            (document.getElementById("group-color") as HTMLInputElement)
              ?.value || GROUP_COLORS[0],
        },
      };
      setSubviewStack("groups", [addState]);
    }
  });
  document.getElementById("cancel-group-btn")?.addEventListener("click", () => {
    const modal = document.getElementById("add-group-modal");
    if (modal) {
      modal.style.display = "none";
      clearSubviewStack("groups");
      setSubView(false);
    }
  });
  document
    .getElementById("group-color-preview")
    ?.addEventListener("click", () => {
      document.getElementById("group-color")?.click();
    });
  document.getElementById("group-color")?.addEventListener("input", (e) => {
    const val = (e.target as HTMLInputElement).value;
    const preview = document.getElementById("group-color-preview");
    const label = document.getElementById("group-color-label");
    if (preview) preview.style.background = val;
    if (label) label.textContent = val;
  });

  document
    .getElementById("save-group-btn")
    ?.addEventListener("click", async () => {
      const name = (
        document.getElementById("group-name") as HTMLInputElement
      )?.value.trim();
      if (!name) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const btn = document.getElementById(
        "save-group-btn",
      ) as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = t("toast_creating");
      try {
        const tempId = `temp-${Date.now()}`;
        const color =
          (document.getElementById("group-color") as HTMLInputElement)?.value ||
          GROUP_COLORS[0];
        addGroup({
          id: tempId,
          user_id: session.user.id,
          name,
          color,
          avatar_url: null,
          birthdays: [{ count: 0 }],
        });
        showToast(t("toast_group_created"), "success");
        (
          document.getElementById("add-group-modal") as HTMLElement
        ).style.display = "none";
        clearSubviewStack("groups");
        setSubView(false);
        renderGroups(container, getNavGeneration());
        const { data, error } = await supabase
          .from("groups")
          .insert({ user_id: session.user.id, name, color })
          .select();
        if (error) {
          removeGroup(tempId);
          showToast(t("toast_error_generic"), "error");
          await refreshAll(session.user.id);
          renderGroups(container, getNavGeneration());
        } else {
          if (data?.[0])
            replaceGroup(tempId, { ...data[0], birthdays: [{ count: 0 }] });
          await refreshAll(session.user.id);
        }
      } finally {
        btn.disabled = false;
        btn.textContent = t("groups_modal_create");
      }
    });
}

function groupCard(group: any): string {
  const count = group.birthdays?.[0]?.count || 0;
  const color = group.color || "var(--orange)";
  const avatarInner = group.avatar_url
    ? `<img src="${group.avatar_url}" class="avatar-img" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
    : `<span class="material-symbols-outlined" style="color:${color};font-variation-settings:'FILL' 1;">group</span>`;

  return `
    <div data-group-id="${
      group.id
    }" class="group-card" style="border-left:4px solid ${color};">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:44px;height:44px;border-radius:50%;border:2px solid var(--ink);box-shadow:3px 3px 0 var(--ink);background:${color}22;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;">
          ${avatarInner}
        </div>
        <div>
          <h3 style="font-weight:700;font-size:0.92rem;margin:0 0 2px;color:var(--ink);transition:color 0.3s ease;">${
            group.name
          }</h3>
          <p style="font-size:0.72rem;color:var(--muted);margin:0;transition:color 0.3s ease;">${
            count === 1
              ? t("groups_member_count").replace("{count}", count)
              : t("groups_member_count_plural").replace("{count}", count)
          }</p>
        </div>
      </div>
      <span class="material-symbols-outlined" style="color:var(--muted);pointer-events:none;font-size:1.1rem;">chevron_right</span>
    </div>
  `;
}

function bindGroupCardClick(container: HTMLElement) {
  container.addEventListener("click", async (e) => {
    const card = (e.target as HTMLElement).closest(
      "[data-group-id]",
    ) as HTMLElement;
    if (!card) return;
    const group = getStore().groups.find((g) => g.id === card.dataset.groupId);
    if (group) renderGroupDetail(container, group);
  });
}

export function renderGroupDetail(
  container: HTMLElement,
  group: any,
  initialValues?: { name: string; color: string } | null,
) {
  setSubView(true);
  updateFABVisibility();

  const detailState: GroupDetailSubview = {
    kind: "group-detail",
    groupId: group.id,
    values: null,
  };
  setSubviewStack("groups", [detailState]);

  const color = group.color || "var(--orange)";
  const count = group.birthdays?.[0]?.count || 0;
  const avatarInner = group.avatar_url
    ? `<img src="${group.avatar_url}" class="avatar-img" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
    : `<span class="material-symbols-outlined" style="color:${color};font-size:1.75rem;font-variation-settings:'FILL' 1;">group</span>`;

  container.innerHTML = `
    <style>
      .gd-header {
        position:sticky;top:0;z-index:40;
        background:var(--cream);
        border-bottom:3px solid var(--ink);
        display:flex;align-items:center;gap:10px;
        padding:0.9rem 1.25rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .gd-back-btn {
        background:var(--paper);border:2px solid var(--ink);
        border-radius:999px;box-shadow:none;
        color:var(--ink);width:36px;height:36px;
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;flex-shrink:0;padding:0;
        transition:transform 0.15s ease, box-shadow 0.15s ease,
          background-color 0.3s ease, border-color 0.3s ease;
      }
      .gd-back-btn:hover { transform:translate(2px,2px); box-shadow:none; color:var(--orange); }
      .gd-section {
        background:var(--paper);border:2px solid var(--ink);
        border-radius:1.25rem;box-shadow:4px 4px 0 var(--ink);
        padding:1.25rem;display:flex;flex-direction:column;gap:1rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .gd-input {
        width:100%;height:48px;
        background:var(--cream);border:2px solid var(--ink);
        border-radius:0.85rem;padding:0 1rem;
        font-size:0.95rem;font-family:'Inter',sans-serif;font-weight:500;
        color:var(--ink);outline:none;box-sizing:border-box;
        transition:box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
      }
      .gd-input:focus { box-shadow:4px 4px 0 var(--ink); }
      .gd-field-label {
        font-size:0.68rem;font-weight:900;text-transform:uppercase;
        letter-spacing:0.1em;color:var(--brown);margin:0 0 8px;display:block;
        transition:color 0.3s ease;
      }
      .gd-save-btn {
        width:100%;height:48px;
        background:var(--orange);color:var(--on-accent-light);
        border:2px solid var(--ink);border-radius:999px;
        box-shadow:5px 5px 0 var(--ink);
        font-family:'Inter',sans-serif;font-weight:900;font-size:0.95rem;
        cursor:pointer;
        transition:transform 0.15s ease, box-shadow 0.15s ease,
          background-color 0.3s ease, border-color 0.3s ease;
      }
      .gd-save-btn:hover { transform:translate(3px,3px); box-shadow:2px 2px 0 var(--ink); }
      .gd-save-btn:disabled { opacity:0.6;cursor:not-allowed;transform:none; }
      .gd-delete-btn {
        width:100%;height:48px;
        background:var(--paper);border:2px solid var(--ink);
        border-radius:1rem;box-shadow:4px 4px 0 var(--ink);
        color:var(--pink);
        font-weight:700;font-family:'Inter',sans-serif;font-size:0.88rem;
        cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;
        transition:transform 0.15s ease, box-shadow 0.15s ease,
          background-color 0.3s ease, border-color 0.3s ease;
      }
      .gd-delete-btn:hover { transform:translate(3px,3px); box-shadow:1px 1px 0 var(--ink); }
    </style>

    <header class="gd-header">
      <button id="gd-back" class="gd-back-btn" aria-label="Back">
        <span class="material-symbols-outlined" style="font-size:1.1rem;">arrow_back</span>
      </button>
      <h1 style="font-family:'Archivo Black',sans-serif;font-size:1.1rem;text-transform:uppercase;letter-spacing:-0.04em;color:var(--ink);margin:0;flex:1;transition:color 0.3s ease;">${t(
        "groups_detail_title",
      )}</h1>
    </header>

    <div style="padding:1.25rem;display:flex;flex-direction:column;gap:1rem;padding-bottom:80px;">

      <!-- Hero -->
      <div style="
        position:relative;overflow:hidden;
        border-radius:1.5rem;
        background:var(--paper);
        border:3px solid var(--ink);
        border-left:5px solid ${color};
        box-shadow:4px 4px 0 var(--ink);
        padding:1.5rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      ">
        <div style="position:absolute;top:0;right:0;padding:1rem;opacity:0.06;pointer-events:none;">
          <span class="material-symbols-outlined" style="font-size:100px;font-variation-settings:'FILL' 1;color:${color};">group</span>
        </div>
        <div style="position:relative;z-index:1;">
          <div style="position:relative;width:60px;height:60px;margin-bottom:0.9rem;">
            <div id="group-avatar-circle" style="width:60px;height:60px;border-radius:50%;border:2px solid var(--ink);box-shadow:5px 5px 0 var(--ink);background:${color}22;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;transition:border-color 0.3s ease;">
              ${avatarInner}
            </div>
            <button id="group-avatar-btn" style="position:absolute;bottom:0;right:-4px;width:22px;height:22px;border-radius:50%;background:var(--paper);border:2px solid var(--ink);box-shadow:2px 2px 0 var(--ink);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:background-color 0.3s ease, border-color 0.3s ease;">
              <span class="material-symbols-outlined" style="font-size:10px;color:var(--orange);">photo_camera</span>
            </button>
          </div>
          <h2 style="font-family:'Archivo Black',sans-serif;font-size:1.9rem;text-transform:uppercase;letter-spacing:-0.05em;line-height:0.92;color:var(--ink);margin:0 0 4px;transition:color 0.3s ease;">${
            group.name
          }</h2>
          <p style="color:var(--muted);font-size:0.8rem;margin:0;transition:color 0.3s ease;">${
            count === 1
              ? t("groups_member_count").replace("{count}", count)
              : t("groups_member_count_plural").replace("{count}", count)
          }</p>
        </div>
      </div>

      <!-- Edit form -->
      <div class="gd-section">
        <p class="gd-field-label" style="margin:0;">${t(
          "groups_detail_edit_section",
        )}</p>
        <div>
          <label class="gd-field-label">Name</label>
          <input id="gd-name" class="gd-input" type="text" value="${
            group.name
          }" autocomplete="off" />
        </div>
        <div>
          <label class="gd-field-label">${t(
            "groups_detail_color_label",
          )}</label>
          <div style="display:flex;align-items:center;gap:10px;">
            <div id="gd-color-preview" style="width:34px;height:34px;border-radius:50%;background:${color};border:2px solid var(--ink);box-shadow:none;flex-shrink:0;cursor:pointer;transition:border-color 0.3s ease;"></div>
            <span id="gd-color-label" style="font-size:0.82rem;color:var(--muted);font-family:'Inter',sans-serif;font-weight:600;transition:color 0.3s ease;">${color}</span>
            <input id="gd-color" type="color" value="${color}" style="position:absolute;opacity:0;width:0;height:0;pointer-events:none;">
          </div>
        </div>
        <button id="gd-save" class="gd-save-btn">${t(
          "groups_detail_save_button",
        )}</button>
      </div>

      <!-- Delete -->
      <button id="gd-delete" class="gd-delete-btn">
        <span class="material-symbols-outlined" style="font-size:1rem;">delete</span>
        ${t("groups_detail_delete_button")}
      </button>

    </div>
  `;

  const photoInput = document.createElement("input");
  photoInput.type = "file";
  photoInput.accept = "image/*";
  photoInput.style.display = "none";
  container.appendChild(photoInput);
  const triggerUpload = () => photoInput.click();
  document
    .getElementById("group-avatar-circle")
    ?.addEventListener("click", triggerUpload);
  document
    .getElementById("group-avatar-btn")
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      triggerUpload();
    });
  photoInput.addEventListener("change", async () => {
    const file = photoInput.files?.[0];
    if (!file) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const path = `${session?.user.id}/groups/${group.id}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      showToast(t("toast_upload_failed"), "error");
      return;
    }
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);
    const publicUrl = urlData.publicUrl + `?t=${Date.now()}`;
    await supabase
      .from("groups")
      .update({ avatar_url: publicUrl })
      .eq("id", group.id);
    if (session) await refreshAll(session.user.id);
    const updated = getStore().groups.find((g) => g.id === group.id);
    if (updated) renderGroupDetail(container, updated);
  });

  document
    .getElementById("gd-back")
    ?.addEventListener("click", () =>
      renderGroups(container, getNavGeneration()),
    );

  document
    .getElementById("gd-color-preview")
    ?.addEventListener("click", () =>
      document.getElementById("gd-color")?.click(),
    );
  document.getElementById("gd-color")?.addEventListener("input", (e) => {
    const val = (e.target as HTMLInputElement).value;
    const preview = document.getElementById("gd-color-preview");
    const label = document.getElementById("gd-color-label");
    if (preview) preview.style.background = val;
    if (label) label.textContent = val;
  });

  if (initialValues) {
    const nameInput = document.getElementById(
      "gd-name",
    ) as HTMLInputElement | null;
    if (nameInput) nameInput.value = initialValues.name;
    const colorInput = document.getElementById(
      "gd-color",
    ) as HTMLInputElement | null;
    if (colorInput) {
      colorInput.value = initialValues.color;
      const preview = document.getElementById("gd-color-preview");
      const label = document.getElementById("gd-color-label");
      if (preview) preview.style.background = initialValues.color;
      if (label) label.textContent = initialValues.color;
    }
  }

  animateSlideUp(container);
  bindButtonFeedback(container);

  document.getElementById("gd-save")?.addEventListener("click", async () => {
    const name = (
      document.getElementById("gd-name") as HTMLInputElement
    )?.value.trim();
    if (!name) return;
    const btn = document.getElementById("gd-save") as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = t("toast_saving");
    const originalName = group.name;
    const originalColor = group.color;
    const newColor =
      (document.getElementById("gd-color") as HTMLInputElement)?.value || color;
    group.name = name;
    group.color = newColor;
    updateGroup(group.id, { name, color: newColor });
    showToast(t("toast_group_updated"), "success");
    renderGroups(container, getNavGeneration());
    try {
      const { error } = await supabase
        .from("groups")
        .update({ name, color: newColor })
        .eq("id", group.id);
      if (error) {
        group.name = originalName;
        group.color = originalColor;
        updateGroup(group.id, { name: originalName, color: originalColor });
        showToast(t("toast_error_generic"), "error");
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) await refreshAll(session.user.id);
        renderGroups(container, getNavGeneration());
      } else {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) await refreshAll(session.user.id);
      }
    } finally {
      btn.disabled = false;
      btn.textContent = t("groups_detail_save_button");
    }
  });

  document.getElementById("gd-delete")?.addEventListener("click", async () => {
    if (!confirm(t("groups_delete_confirm").replace("{name}", group.name)))
      return;
    const btn = document.getElementById("gd-delete") as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = t("toast_deleting");
    const deletedGroup = { ...group };
    const groupIdx = getStore().groups.findIndex((g) => g.id === group.id);
    removeGroup(group.id);
    clearGroupFromBirthdays(group.id);
    showToast(t("toast_group_deleted"), "success");
    renderGroups(container, getNavGeneration());
    try {
      const { error: e1 } = await supabase
        .from("birthdays")
        .update({ group_id: null })
        .eq("group_id", group.id);
      const { error: e2 } = await supabase
        .from("groups")
        .delete()
        .eq("id", group.id);
      if (e1 || e2) {
        if (groupIdx !== -1) restoreGroupAt(groupIdx, deletedGroup);
        showToast(t("toast_failed_delete_group"), "error");
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) await refreshAll(session.user.id);
        renderGroups(container, getNavGeneration());
      } else {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) await refreshAll(session.user.id);
      }
    } catch {
      if (groupIdx !== -1) restoreGroupAt(groupIdx, deletedGroup);
      showToast(t("toast_failed_delete_group"), "error");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) await refreshAll(session.user.id);
      renderGroups(container, getNavGeneration());
    } finally {
      btn.disabled = false;
      btn.textContent = t("groups_detail_delete_button");
    }
  });
}
