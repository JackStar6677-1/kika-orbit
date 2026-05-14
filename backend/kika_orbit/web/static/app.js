const shell = document.querySelector(".shell");
const loginForm = document.querySelector("#login-form");
const demoButton = document.querySelector("#demo-button");
const soundToggle = document.querySelector("#sound-toggle");
const calendarGrid = document.querySelector("#calendar-grid");
const agendaList = document.querySelector("#agenda-list");
const metricEvents = document.querySelector("#metric-events");
const dialog = document.querySelector("#event-dialog");
const eventForm = document.querySelector("#event-form");
const newEventButton = document.querySelector("#new-event-button");
const todayButton = document.querySelector("#today-button");

let soundEnabled = false;
let audioContext;
let organizationId;

const fallbackEvents = [
  {
    id: "seed-1",
    title: "Reunion centro de estudiantes",
    category: "centro",
    starts_at: "2026-05-18T11:00:00-04:00",
    ends_at: "2026-05-18T12:30:00-04:00",
    description: "Planificacion de hitos del mes y responsables por comision.",
  },
  {
    id: "seed-2",
    title: "Semana de bienvenida",
    category: "academico",
    starts_at: "2026-05-21T09:00:00-04:00",
    ends_at: "2026-05-21T13:00:00-04:00",
    description: "Actividad academica importable desde calendario oficial.",
  },
  {
    id: "seed-3",
    title: "Auditorio reservado",
    category: "espacio",
    starts_at: "2026-05-25T15:00:00-04:00",
    ends_at: "2026-05-25T17:00:00-04:00",
    description: "Bloque protegido para evitar choques de salas.",
  },
];

let events = [...fallbackEvents];

function getAudioContext() {
  audioContext ||= new AudioContext();
  return audioContext;
}

function chirp(type = "soft") {
  if (!soundEnabled) return;

  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;

  oscillator.type = type === "gold" ? "triangle" : "sine";
  oscillator.frequency.setValueAtTime(type === "gold" ? 740 : 520, now);
  oscillator.frequency.exponentialRampToValueAtTime(type === "gold" ? 980 : 660, now + 0.08);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.2);
}

function openApp() {
  shell.dataset.screen = "app";
  chirp("gold");
  render();
}

function normalizeCategory(category) {
  if (category === "academico" || category === "espacio") return category;
  return "centro";
}

function eventDate(event) {
  return new Date(event.starts_at);
}

function formatTime(event) {
  const start = eventDate(event);
  const end = new Date(event.ends_at);
  return `${start.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
  })} · ${start.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  })}-${end.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function buildMonthDays() {
  const month = 4;
  const year = 2026;
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const days = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(year, month, 1 - startOffset + index);
    days.push(date);
  }

  return days;
}

function eventsForDay(day) {
  return events.filter((event) => {
    const date = eventDate(event);
    return (
      date.getFullYear() === day.getFullYear() &&
      date.getMonth() === day.getMonth() &&
      date.getDate() === day.getDate()
    );
  });
}

function renderCalendar() {
  calendarGrid.replaceChildren();
  const today = new Date();

  buildMonthDays().forEach((day) => {
    const dayCard = document.createElement("article");
    dayCard.className = "calendar-day";
    if (day.getMonth() !== 4) dayCard.classList.add("is-muted");
    if (
      day.getFullYear() === today.getFullYear() &&
      day.getMonth() === today.getMonth() &&
      day.getDate() === today.getDate()
    ) {
      dayCard.classList.add("today");
    }

    const dateNumber = document.createElement("div");
    dateNumber.className = "date-number";
    dateNumber.innerHTML = `<span>${day.getDate()}</span><span>${day.toLocaleDateString("es-CL", {
      weekday: "short",
    })}</span>`;
    dayCard.append(dateNumber);

    eventsForDay(day).forEach((event) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = `event-pill ${normalizeCategory(event.category)}`;
      pill.textContent = event.title;
      pill.addEventListener("click", () => chirp(event.category === "espacio" ? "gold" : "soft"));
      dayCard.append(pill);
    });

    calendarGrid.append(dayCard);
  });
}

function renderAgenda() {
  agendaList.replaceChildren();

  events
    .toSorted((a, b) => eventDate(a) - eventDate(b))
    .slice(0, 6)
    .forEach((event, index) => {
      const item = document.createElement("article");
      item.className = `agenda-item ${normalizeCategory(event.category)}`;
      item.style.animationDelay = `${index * 45}ms`;
      item.innerHTML = `
        <strong>${event.title}</strong>
        <span>${formatTime(event)}</span>
        <p>${event.description || "Sin detalle todavia."}</p>
      `;
      agendaList.append(item);
    });
}

function render() {
  metricEvents.textContent = String(events.length);
  renderCalendar();
  renderAgenda();
}

async function ensureDemoOrganization() {
  const response = await fetch("/api/organizations");
  const organizations = response.ok ? await response.json() : [];
  const existing = organizations.find((item) => item.slug === "universidad-demo");
  if (existing) return existing.id;

  const created = await fetch("/api/organizations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Universidad Demo",
      slug: "universidad-demo",
      domain_hint: "demo.edu",
    }),
  });

  if (!created.ok) return undefined;
  return (await created.json()).id;
}

async function hydrateFromApi() {
  try {
    organizationId = await ensureDemoOrganization();
    if (!organizationId) return;

    const response = await fetch(`/api/events?organization_id=${organizationId}`);
    if (!response.ok) return;

    const apiEvents = await response.json();
    if (apiEvents.length > 0) {
      events = [...apiEvents, ...fallbackEvents].filter(
        (event, index, list) => list.findIndex((item) => item.id === event.id) === index,
      );
      render();
    }
  } catch {
    render();
  }
}

async function createEventFromForm(formData) {
  const localEvent = {
    id: crypto.randomUUID(),
    title: formData.get("title"),
    category: formData.get("category"),
    starts_at: new Date(formData.get("starts_at")).toISOString(),
    ends_at: new Date(formData.get("ends_at")).toISOString(),
    description: formData.get("description"),
  };

  if (organizationId) {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organization_id: organizationId,
        title: localEvent.title,
        category: localEvent.category,
        visibility: "organization",
        starts_at: localEvent.starts_at,
        ends_at: localEvent.ends_at,
        description: localEvent.description,
      }),
    });

    if (response.ok) {
      events = [await response.json(), ...events];
      return;
    }
  }

  events = [localEvent, ...events];
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  openApp();
});

demoButton.addEventListener("click", openApp);

soundToggle.addEventListener("click", async () => {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? "Activo" : "Activar";
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  if (soundEnabled) {
    await getAudioContext().resume();
    chirp("gold");
  }
});

newEventButton.addEventListener("click", () => {
  chirp("soft");
  dialog.showModal();
});

todayButton.addEventListener("click", () => {
  document.querySelector(".calendar-day.today")?.scrollIntoView({ behavior: "smooth", block: "center" });
  chirp("gold");
});

eventForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await createEventFromForm(new FormData(eventForm));
  dialog.close();
  chirp("gold");
  render();
});

render();
hydrateFromApi();
