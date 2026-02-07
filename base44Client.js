/**
 * A small "Base44 compatibility layer" so your existing UI runs locally.
 *
 * - auth.me(): reads the active user from localStorage
 * - entities.<Entity>.list/filter/create/update/delete: localStorage-backed CRUD
 *
 * Later, you can swap the implementation to call your Node.js backend,
 * while keeping the same UI code.
 */

const USER_KEY = "octalve_user";
const DB_PREFIX = "octalve_db_";

function nowIso() {
  return new Date().toISOString();
}

function getId() {
  // crypto.randomUUID is supported in modern browsers.
  // Fallback keeps it working in older ones.
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function dbKey(entityName) {
  return `${DB_PREFIX}${entityName}`;
}

function load(entityName) {
  const raw = localStorage.getItem(dbKey(entityName));
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(entityName, items) {
  localStorage.setItem(dbKey(entityName), JSON.stringify(items));
}

function matches(item, where) {
  if (!where) return true;
  return Object.entries(where).every(([k, v]) => item?.[k] === v);
}

function sortBy(items, sort) {
  if (!sort) return items;
  // base44 used strings like "-created_date".
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;

  return [...items].sort((a, b) => {
    const av = a?.[field];
    const bv = b?.[field];
    if (av == null && bv == null) return 0;
    if (av == null) return desc ? 1 : -1;
    if (bv == null) return desc ? -1 : 1;

    // Date-ish fields
    const ad = Date.parse(av);
    const bd = Date.parse(bv);
    const bothDates = !Number.isNaN(ad) && !Number.isNaN(bd);
    if (bothDates) return desc ? bd - ad : ad - bd;

    // Number-ish
    if (typeof av === "number" && typeof bv === "number") {
      return desc ? bv - av : av - bv;
    }

    // String-ish
    return desc
      ? String(bv).localeCompare(String(av))
      : String(av).localeCompare(String(bv));
  });
}

function makeEntity(entityName) {
  return {
    async list(sort) {
      return sortBy(load(entityName), sort);
    },

    async filter(where) {
      return load(entityName).filter((x) => matches(x, where));
    },

    async create(data) {
      const items = load(entityName);
      const item = {
        id: getId(),
        created_date: nowIso(),
        updated_date: nowIso(),
        ...data,
      };
      items.push(item);
      save(entityName, items);
      return item;
    },

    async update(id, patch) {
      const items = load(entityName);
      const idx = items.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error(`${entityName} not found: ${id}`);
      items[idx] = {
        ...items[idx],
        ...patch,
        updated_date: nowIso(),
      };
      save(entityName, items);
      return items[idx];
    },

    async delete(id) {
      const items = load(entityName);
      const next = items.filter((x) => x.id !== id);
      save(entityName, next);
      return { ok: true };
    },
  };
}

function seedIfEmpty() {
  const seededFlag = localStorage.getItem("octalve_seeded_v1");
  if (seededFlag) return;

  // Templates
  const Template = load("Template");
  if (Template.length === 0) {
    const templates = [
      {
        id: getId(),
        created_date: nowIso(),
        updated_date: nowIso(),
        name: "Launch Suite Template",
        suite_type: "launch",
        description: "Standard 7–21 day Launch Suite delivery template",
        phases: [
          {
            name: "Discovery & Kickoff",
            order: 1,
            description: "Gather requirements and confirm scope.",
            deliverables: [
              { name: "Kickoff notes", order: 1 },
              { name: "Requirements summary", order: 2 },
            ],
          },
          {
            name: "Branding",
            order: 2,
            description: "Logo + brand direction.",
            deliverables: [
              { name: "Logo concepts", order: 1 },
              { name: "Brand guide", order: 2 },
            ],
          },
          {
            name: "Website",
            order: 3,
            description: "Landing page and core pages.",
            deliverables: [
              { name: "Figma design", order: 1 },
              { name: "Staging link", order: 2 },
            ],
          },
        ],
      },
    ];
    save("Template", templates);
  }

  // Team Members
  if (load("TeamMember").length === 0) {
    save("TeamMember", [
      {
        id: getId(),
        created_date: nowIso(),
        updated_date: nowIso(),
        email: "pm@octalve.local",
        name: "Project Manager",
        role: "pm",
        active_phases_count: 1,
      },
      {
        id: getId(),
        created_date: nowIso(),
        updated_date: nowIso(),
        email: "designer@octalve.local",
        name: "Designer",
        role: "designer",
        active_phases_count: 1,
      },
    ]);
  }

  // A sample project for a sample client
  if (load("Project").length === 0) {
    const projectId = getId();
    const phase1Id = getId();
    const phase2Id = getId();

    save("Project", [
      {
        id: projectId,
        created_date: nowIso(),
        updated_date: nowIso(),
        name: "Octalve Suite MVP",
        client_name: "Demo Client",
        client_email: "client@octalve.local",
        suite_type: "launch",
        status: "active",
        progress_percentage: 20,
        assigned_pm: "pm@octalve.local",
        target_completion_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
          .toISOString()
          .slice(0, 10),
        project_code: "DEMO01",
      },
    ]);

    save("Phase", [
      {
        id: phase1Id,
        created_date: nowIso(),
        updated_date: nowIso(),
        project_id: projectId,
        name: "Discovery & Kickoff",
        order: 1,
        status: "in_progress",
        description: "Confirm scope and timelines.",
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)
          .toISOString()
          .slice(0, 10),
      },
      {
        id: phase2Id,
        created_date: nowIso(),
        updated_date: nowIso(),
        project_id: projectId,
        name: "Branding",
        order: 2,
        status: "not_started",
        description: "Logo and direction.",
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
          .toISOString()
          .slice(0, 10),
      },
    ]);

    save("Deliverable", [
      {
        id: getId(),
        created_date: nowIso(),
        updated_date: nowIso(),
        project_id: projectId,
        phase_id: phase1Id,
        name: "Kickoff notes",
        link: "https://example.com",
        link_type: "web",
        status: "ready_for_review",
        order: 1,
      },
    ]);

    save("Approval", [
      {
        id: getId(),
        created_date: nowIso(),
        updated_date: nowIso(),
        project_id: projectId,
        phase_id: phase1Id,
        requested_at: nowIso(),
        requested_by: "pm@octalve.local",
        status: "pending",
      },
    ]);

    save("Message", [
      {
        id: getId(),
        created_date: nowIso(),
        updated_date: nowIso(),
        project_id: projectId,
        phase_id: phase1Id,
        content: "Kickoff started. Please review the scope and timelines.",
        sender_email: "pm@octalve.local",
        sender_name: "Project Manager",
        message_type: "system",
        is_resolved: false,
      },
    ]);
  }

  localStorage.setItem("octalve_seeded_v1", "1");
}

export const base44 = {
  auth: {
    async me() {
      seedIfEmpty();
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) throw new Error("Not authenticated");
      return JSON.parse(raw);
    },

    async login({ email, full_name, role }) {
      seedIfEmpty();
      const user = { email, full_name, role };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    },

    logout() {
      localStorage.removeItem(USER_KEY);
      // Invalidate the UI quickly.
      window.location.href = "/login";
    },
  },

  entities: {
    Project: makeEntity("Project"),
    Phase: makeEntity("Phase"),
    Deliverable: makeEntity("Deliverable"),
    Approval: makeEntity("Approval"),
    Message: makeEntity("Message"),
    TeamMember: makeEntity("TeamMember"),
    Template: makeEntity("Template"),
  },
};
