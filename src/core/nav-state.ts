export type PageName = "birthdays" | "calendar" | "groups" | "profile";

export interface AddSubview {
  kind: "add";
  returnTo: PageName;
  values: {
    name: string;
    day: string;
    month: string;
    year: string;
    group: string;
    notes: string;
  };
}

export interface DetailEditValues {
  name: string;
  day: string;
  month: string;
  year: string;
  notes: string;
  group: string;
}

export interface DetailSubview {
  kind: "detail";
  birthdayId: string;
  returnTo: PageName;
  editing?: boolean;
  editValues?: DetailEditValues | null;
}

export interface GiftSubview {
  kind: "gift";
  parentDetail: DetailSubview | null;
  values: {
    person: string;
    interests: string;
    dislikes: string;
    relationship: string;
    budget: string;
  };
}

export interface GroupDetailSubview {
  kind: "group-detail";
  groupId: string;
  values?: {
    name: string;
    color: string;
  } | null;
}

export interface GroupsAddSubview {
  kind: "groups-add";
  values: {
    name: string;
    color: string;
  };
}

export type Subview =
  | AddSubview
  | DetailSubview
  | GiftSubview
  | GroupDetailSubview
  | GroupsAddSubview;

const stacks: Partial<Record<PageName, Subview[]>> = {};

export function getSubviewStack(page: PageName): Subview[] {
  return stacks[page] || [];
}

export function setSubviewStack(page: PageName, stack: Subview[]): void {
  if (stack.length === 0) delete stacks[page];
  else stacks[page] = stack;
}

export function clearSubviewStack(page: PageName): void {
  delete stacks[page];
}

export function resetSubviewStacks(): void {
  for (const key of Object.keys(stacks)) delete stacks[key as PageName];
}

export function captureSubviewValues(page: PageName): void {
  const stack = getSubviewStack(page);
  const top = stack[stack.length - 1];
  if (!top) return;
  if (top.kind === "add") {
    top.values = {
      name:
        (document.getElementById("add-name") as HTMLInputElement | null)
          ?.value ?? "",
      day:
        (document.getElementById("add-day") as HTMLInputElement | null)
          ?.value ?? "",
      month:
        (document.getElementById("add-month") as HTMLInputElement | null)
          ?.value ?? "",
      year:
        (document.getElementById("add-year") as HTMLInputElement | null)
          ?.value ?? "",
      group:
        (document.getElementById("add-group") as HTMLSelectElement | null)
          ?.value ?? "",
      notes:
        (document.getElementById("add-notes") as HTMLTextAreaElement | null)
          ?.value ?? "",
    };
  } else if (top.kind === "gift") {
    top.values = {
      person:
        (document.getElementById("gift-person") as HTMLInputElement | null)
          ?.value ?? "",
      interests:
        (document.getElementById("gift-interests") as HTMLInputElement | null)
          ?.value ?? "",
      dislikes:
        (document.getElementById("gift-dislikes") as HTMLInputElement | null)
          ?.value ?? "",
      relationship:
        (
          document.getElementById(
            "gift-relationship",
          ) as HTMLSelectElement | null
        )?.value ?? "friend",
      budget:
        (document.getElementById("gift-budget") as HTMLSelectElement | null)
          ?.value ?? "$50–$100",
    };
  } else if (top.kind === "detail") {
    const form = document.getElementById("edit-form");
    const editing = !!form && form.style.display !== "none";
    top.editing = editing;
    top.editValues = editing
      ? {
          name:
            (document.getElementById("edit-name") as HTMLInputElement | null)
              ?.value ?? "",
          day:
            (document.getElementById("edit-day") as HTMLInputElement | null)
              ?.value ?? "",
          month:
            (document.getElementById("edit-month") as HTMLInputElement | null)
              ?.value ?? "",
          year:
            (document.getElementById("edit-year") as HTMLInputElement | null)
              ?.value ?? "",
          notes:
            (
              document.getElementById(
                "edit-notes",
              ) as HTMLTextAreaElement | null
            )?.value ?? "",
          group:
            (document.getElementById("edit-group") as HTMLSelectElement | null)
              ?.value ?? "",
        }
      : null;
  } else if (top.kind === "group-detail") {
    top.values = {
      name:
        (document.getElementById("gd-name") as HTMLInputElement | null)
          ?.value ?? "",
      color:
        (document.getElementById("gd-color") as HTMLInputElement | null)
          ?.value ?? "",
    };
  } else if (top.kind === "groups-add") {
    top.values = {
      name:
        (document.getElementById("group-name") as HTMLInputElement | null)
          ?.value ?? "",
      color:
        (document.getElementById("group-color") as HTMLInputElement | null)
          ?.value ?? "",
    };
  }
}
