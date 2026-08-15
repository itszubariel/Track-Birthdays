import { renderBirthdays } from "./birthdays";
import { showToast } from "../features/toast";
import { getNavGeneration, setSubView, updateFABVisibility } from "../core/app";
import { animateSlideUp, bindButtonFeedback } from "../features/animations";
import { t } from "../services/i18n";
import { setSubviewStack, clearSubviewStack } from "../core/nav-state";
import type { PageName, DetailSubview, GiftSubview } from "../core/nav-state";
import { esc } from "../utils/utils";

export function renderGift(
  container: HTMLElement,
  onBack?: () => void,
  state?: {
    parentDetail: DetailSubview | null;
    values?: GiftSubview["values"];
  },
) {
  setSubView(true);
  updateFABVisibility();

  const parentDetail = state?.parentDetail ?? null;
  const values: GiftSubview["values"] = state?.values ?? {
    person: "",
    interests: "",
    dislikes: "",
    relationship: "friend",
    budget: "$50–$100",
  };
  const home: PageName = parentDetail ? parentDetail.returnTo : "birthdays";
  const giftState: GiftSubview = { kind: "gift", parentDetail, values };
  setSubviewStack(
    home,
    parentDetail
      ? [
          {
            kind: "detail",
            birthdayId: parentDetail.birthdayId,
            returnTo: home,
          },
          giftState,
        ]
      : [giftState],
  );

  container.innerHTML = `
    <style>
      .gift-header {
        position:sticky;top:0;z-index:40;
        background:var(--cream);
        border-bottom:3px solid var(--ink);
        display:flex;align-items:center;gap:10px;
        padding:0.9rem 1.25rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .gift-back-btn {
        background:var(--paper);border:2px solid var(--ink);
        border-radius:999px;box-shadow:none;
        color:var(--ink);width:36px;height:36px;
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;flex-shrink:0;padding:0;
        transition:transform 0.15s ease, box-shadow 0.15s ease,
          background-color 0.3s ease, border-color 0.3s ease;
      }
      .gift-back-btn:hover { transform:translate(2px,2px); box-shadow:none; color:var(--orange); }

      .gift-field-label {
        display:block;font-size:0.68rem;font-weight:900;
        text-transform:uppercase;letter-spacing:0.1em;
        color:var(--brown);margin-bottom:6px;
        transition:color 0.3s ease;
      }
      .gift-input {
        width:100%;height:48px;
        background:var(--paper);
        border:2px solid var(--ink);border-radius:0.85rem;
        padding:0 1rem;font-size:0.9rem;
        font-family:'Inter',sans-serif;font-weight:500;
        color:var(--ink);outline:none;box-sizing:border-box;
        transition:box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
      }
      .gift-input:focus { box-shadow:4px 4px 0 var(--ink); }
      .gift-input::placeholder { color:var(--muted);font-weight:400; }

      .gift-generate-btn {
        width:100%;height:52px;
        background:var(--blue);color:var(--on-accent-dark);
        border:2px solid var(--ink);border-radius:999px;
        box-shadow:5px 5px 0 var(--ink);
        font-family:'Inter',sans-serif;font-weight:900;font-size:0.95rem;
        cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
        transition:transform 0.15s ease, box-shadow 0.15s ease,
          background-color 0.3s ease, border-color 0.3s ease;
      }
      .gift-generate-btn:hover { transform:translate(3px,3px); box-shadow:2px 2px 0 var(--ink); }
      .gift-generate-btn:active { transform:translate(4px,4px); box-shadow:1px 1px 0 var(--ink); }
      .gift-generate-btn:disabled { opacity:0.6;cursor:not-allowed;transform:none; }

      .gift-result-card {
        background:var(--paper);
        border:2px solid var(--ink);border-radius:1rem;
        box-shadow:4px 4px 0 var(--ink);
        padding:0.9rem 1rem;
        display:flex;gap:10px;align-items:flex-start;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .gift-result-num {
        width:26px;height:26px;border-radius:50%;flex-shrink:0;margin-top:1px;
        background:var(--orange);border:2px solid var(--ink);
        display:flex;align-items:center;justify-content:center;
        font-size:0.72rem;font-weight:900;color:var(--on-accent-light);
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }

      @keyframes gift-spin {
        from { transform:rotate(0deg); }
        to   { transform:rotate(360deg); }
      }
    </style>

    <header class="gift-header">
      <button id="gift-back" class="gift-back-btn" aria-label="Back">
        <span class="material-symbols-outlined" style="font-size:1.1rem;">arrow_back</span>
      </button>
      <h1 style="font-family:'Archivo Black',sans-serif;font-size:1.1rem;text-transform:uppercase;letter-spacing:-0.04em;color:var(--ink);margin:0;transition:color 0.3s ease;">${t(
        "gift_header_title",
      )}</h1>
    </header>

    <div style="padding:1.25rem;display:flex;flex-direction:column;gap:1rem;padding-bottom:6rem;">

      <!-- Hero -->
      <div style="
        position:relative;overflow:hidden;
        border-radius:1.5rem;
        background:var(--paper);
        border:2px solid var(--ink);
        border-left:5px solid var(--blue);
        box-shadow:4px 4px 0 var(--ink);
        padding:1.25rem 1.5rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      ">
        <div style="position:absolute;right:-0.5rem;bottom:-0.5rem;opacity:0.06;pointer-events:none;">
          <span class="material-symbols-outlined" style="font-size:90px;font-variation-settings:'FILL' 1;color:var(--blue);">redeem</span>
        </div>
        <h2 style="font-family:'Archivo Black',sans-serif;font-size:1.2rem;text-transform:uppercase;letter-spacing:-0.04em;color:var(--ink);margin:0 0 4px;transition:color 0.3s ease;">${t(
          "gift_hero_heading",
        )}</h2>
        <p style="color:var(--muted);font-size:0.82rem;margin:0;transition:color 0.3s ease;">${t(
          "gift_hero_desc",
        )}</p>
      </div>

      <!-- Fields -->
      <div>
        <label class="gift-field-label">${t("gift_person_label")}</label>
        <input id="gift-person" class="gift-input" type="text" placeholder="${t(
          "gift_person_placeholder",
        )}" value="${esc(values.person)}" />
      </div>
      <div>
        <label class="gift-field-label">${t("gift_interests_label")}</label>
        <input id="gift-interests" class="gift-input" type="text" placeholder="${t(
          "gift_interests_placeholder",
        )}" value="${esc(values.interests)}" />
      </div>
      <div>
        <label class="gift-field-label">${t("gift_dislikes_label")}</label>
        <input id="gift-dislikes" class="gift-input" type="text" placeholder="${t(
          "gift_dislikes_placeholder",
        )}" value="${esc(values.dislikes)}" />
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
        <div>
          <label class="gift-field-label">${t(
            "gift_relationship_label",
          )}</label>
          <div style="position:relative;">
            <select id="gift-relationship" class="gift-input" style="appearance:none;padding:0 2.25rem 0 0.85rem;cursor:pointer;">
              <option value="friend" ${
                values.relationship === "friend" ? "selected" : ""
              }>${t("gift_relationship_friend")}</option>
              <option value="best friend" ${
                values.relationship === "best friend" ? "selected" : ""
              }>${t("gift_relationship_best_friend")}</option>
              <option value="partner" ${
                values.relationship === "partner" ? "selected" : ""
              }>${t("gift_relationship_partner")}</option>
              <option value="parent" ${
                values.relationship === "parent" ? "selected" : ""
              }>${t("gift_relationship_parent")}</option>
              <option value="sibling" ${
                values.relationship === "sibling" ? "selected" : ""
              }>${t("gift_relationship_sibling")}</option>
              <option value="cousin" ${
                values.relationship === "cousin" ? "selected" : ""
              }>${t("gift_relationship_cousin")}</option>
              <option value="colleague" ${
                values.relationship === "colleague" ? "selected" : ""
              }>${t("gift_relationship_colleague")}</option>
              <option value="other" ${
                values.relationship === "other" ? "selected" : ""
              }>${t("gift_relationship_other")}</option>
            </select>
            <span class="material-symbols-outlined" style="position:absolute;right:0.6rem;top:50%;transform:translateY(-50%);font-size:1rem;color:var(--muted);pointer-events:none;">expand_more</span>
          </div>
        </div>
        <div>
          <label class="gift-field-label">${t("gift_budget_label")}</label>
          <div style="position:relative;">
            <select id="gift-budget" class="gift-input" style="appearance:none;padding:0 2.25rem 0 0.85rem;cursor:pointer;">
              <option value="under $20" ${
                values.budget === "under $20" ? "selected" : ""
              }>${t("gift_budget_under20")}</option>
              <option value="$20–$50" ${
                values.budget === "$20–$50" ? "selected" : ""
              }>${t("gift_budget_20to50")}</option>
              <option value="$50–$100" ${
                values.budget === "$50–$100" ? "selected" : ""
              }>${t("gift_budget_50to100")}</option>
              <option value="$100–$200" ${
                values.budget === "$100–$200" ? "selected" : ""
              }>${t("gift_budget_100to200")}</option>
              <option value="$200+" ${
                values.budget === "$200+" ? "selected" : ""
              }>${t("gift_budget_200plus")}</option>
            </select>
            <span class="material-symbols-outlined" style="position:absolute;right:0.6rem;top:50%;transform:translateY(-50%);font-size:1rem;color:var(--muted);pointer-events:none;">expand_more</span>
          </div>
        </div>
      </div>

      <button id="gift-generate" class="gift-generate-btn">
        <span class="material-symbols-outlined" style="font-size:1.1rem;">auto_awesome</span>
        ${t("gift_generate_button")}
      </button>

      <div id="gift-results"></div>

    </div>
  `;

  document.getElementById("gift-back")!.addEventListener("click", () => {
    if (onBack) onBack();
    else {
      clearSubviewStack(home);
      renderBirthdays(container, getNavGeneration());
    }
  });

  animateSlideUp(container);
  bindButtonFeedback(container);

  document
    .getElementById("gift-generate")!
    .addEventListener("click", async () => {
      const person = (
        document.getElementById("gift-person") as HTMLInputElement
      ).value.trim();
      const interests = (
        document.getElementById("gift-interests") as HTMLInputElement
      ).value.trim();
      const dislikes = (
        document.getElementById("gift-dislikes") as HTMLInputElement
      ).value.trim();
      const relationship = (
        document.getElementById("gift-relationship") as HTMLSelectElement
      ).value;
      const budget = (
        document.getElementById("gift-budget") as HTMLSelectElement
      ).value;

      if (!interests) {
        showToast(t("toast_enter_interests"), "error");
        return;
      }

      const btn = document.getElementById("gift-generate") as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = t("toast_generating");

      const resultsEl = document.getElementById("gift-results")!;
      resultsEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:2rem 0;color:var(--muted);">
        <span class="material-symbols-outlined" style="font-size:1.25rem;animation:gift-spin 1s linear infinite;">progress_activity</span>
        <span style="font-size:0.88rem;font-weight:600;">${t(
          "gift_loading",
        )}</span>
      </div>
    `;

      try {
        const prompt = `You are a thoughtful gift advisor. Suggest 6 specific, creative, and practical gift ideas for the following person:

Who: ${person || "someone special"}
Relationship: ${relationship}
Interests: ${interests}
Dislikes: ${dislikes || "none mentioned"}
Budget: ${budget}

Return ONLY a JSON array of exactly 6 gift ideas. Each item should be an object with "name" (short gift name) and "reason" (one sentence why it's perfect for them). No other text, just the JSON array.

Example format:
[{"name":"Gift name","reason":"Why it suits them perfectly."}]`;

        const response = await fetch("/api/groq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || "";
        const clean = text.replace(/```json|```/g, "").trim();
        let ideas: { name: string; reason: string }[] = [];
        try {
          const fixed = clean
            .replace(/,\s*\n\s*\n\s*]/g, "]")
            .replace(/}\s*\n\s*\n\s*]/g, "}]");
          ideas = JSON.parse(fixed);
        } catch {
          const match = clean.match(/\[[\s\S]*\]/);
          if (match) ideas = JSON.parse(match[0]);
          else throw new Error("Could not parse response");
        }

        resultsEl.innerHTML = `
        <div style="border-top:2px solid var(--ink);padding-top:1.1rem;margin-top:0.25rem;">
          <p style="font-size:0.65rem;font-weight:900;text-transform:uppercase;letter-spacing:0.14em;color:var(--brown);margin:0 0 0.75rem;transition:color 0.3s ease;">${t(
            "gift_results_label",
          )}</p>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${ideas
              .map(
                (idea, i) => `
              <div class="gift-result-card">
                <div class="gift-result-num">${i + 1}</div>
                <div>
                  <p style="font-size:0.88rem;font-weight:700;color:var(--ink);margin:0 0 3px;transition:color 0.3s ease;">${
                    idea.name
                  }</p>
                  <p style="font-size:0.78rem;color:var(--muted);margin:0;line-height:1.55;transition:color 0.3s ease;">${
                    idea.reason
                  }</p>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `;
      } catch {
        resultsEl.innerHTML = `<p style="color:var(--pink);text-align:center;padding:1rem;font-size:0.88rem;font-weight:600;">${t(
          "gift_error",
        )}</p>`;
      } finally {
        btn.disabled = false;
        btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:1.1rem;">auto_awesome</span> ${t(
          "gift_generate_button",
        )}`;
      }
    });
}
