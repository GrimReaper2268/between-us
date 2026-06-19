const TARGET = new Date("2026-08-24T00:00:00+04:00");
const START_KEY = "between-us-start";
const THEME_KEY = "between-us-theme";
const DISTANCE_KM = 2800;

const start = new Date(localStorage.getItem(START_KEY) || new Date().toISOString());
localStorage.setItem(START_KEY, start.toISOString());

const $ = (id) => document.getElementById(id);
const route = $("route");
const traveler = $("traveler");
const music = $("music");
let pathLength = 0;
let audioReady = false;

const quotes = [
  "Every second is a small step across the ocean.",
  "Distance is only the space love learns to cross.",
  "The map is wide, but the destination is simple.",
  "Today moved us a little closer.",
  "Two places, one countdown, one arrival."
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function countdownParts(ms) {
  let seconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;
  return { days, hours, minutes, seconds };
}

function progress() {
  const total = Math.max(1, TARGET - start);
  return clamp((Date.now() - start.getTime()) / total, 0, 1);
}

function setText(id, value) {
  const node = $(id);
  if (node.textContent !== String(value)) node.textContent = value;
}

function update() {
  const now = new Date();
  const parts = countdownParts(TARGET - now);
  const pct = progress();
  const remaining = 1 - pct;
  const closed = Math.round(pct * DISTANCE_KM);

  setText("days", String(parts.days).padStart(2, "0"));
  setText("hours", String(parts.hours).padStart(2, "0"));
  setText("minutes", String(parts.minutes).padStart(2, "0"));
  setText("seconds", String(parts.seconds).padStart(2, "0"));
  setText("complete", `${(pct * 100).toFixed(2)}%`);
  setText("remaining", `${(remaining * 100).toFixed(2)}%`);
  setText("daysLeft", parts.days.toLocaleString());
  setText("now", now.toLocaleString([], { dateStyle: "medium", timeStyle: "short" }));
  setText("distance", `${closed.toLocaleString()} km of ${DISTANCE_KM.toLocaleString()} km`);

  if (!pathLength) pathLength = route.getTotalLength();
  const point = route.getPointAtLength(pathLength * pct);
  const next = route.getPointAtLength(Math.min(pathLength, pathLength * pct + 2));
  const angle = Math.atan2(next.y - point.y, next.x - point.x) * 180 / Math.PI;
  traveler.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle})`);

  document.querySelectorAll("[data-milestone]").forEach((item) => {
    const key = item.dataset.milestone;
    const done = key === "week" ? parts.days <= 7 : key === "day" ? parts.days <= 1 : pct * 100 >= Number(key);
    item.classList.toggle("done", done);
  });

  if (TARGET - now <= 0) {
    $("finale").hidden = false;
  }
}

function setupTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark") document.body.classList.add("dark");
  $("themeToggle").textContent = document.body.classList.contains("dark") ? "Light" : "Dark";
  $("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const dark = document.body.classList.contains("dark");
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    $("themeToggle").textContent = dark ? "Light" : "Dark";
  });
}

function setupAudio() {
  $("musicInput").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    music.src = URL.createObjectURL(file);
    audioReady = true;
    $("musicToggle").textContent = "Play";
  });

  $("musicToggle").addEventListener("click", async () => {
    try {
      if (!audioReady && music.getAttribute("src")) audioReady = true;
      if (music.paused) {
        await music.play();
        $("musicToggle").textContent = "Pause";
      } else {
        music.pause();
        $("musicToggle").textContent = "Play";
      }
    } catch {
      $("musicToggle").textContent = "Choose Music";
      $("musicInput").click();
    }
  });
}

function setupBackground() {
  $("backgroundInput").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    document.body.style.setProperty("--photo", `url("${url}")`);
    document.body.classList.add("has-photo");
  });
}

function setupParticles() {
  const canvas = $("particles");
  const ctx = canvas.getContext("2d");
  const dots = Array.from({ length: 110 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 1 + Math.random() * 3,
    speed: .0007 + Math.random() * .002,
    phase: Math.random() * Math.PI * 2
  }));

  function resize() {
    canvas.width = Math.floor(innerWidth * devicePixelRatio);
    canvas.height = Math.floor(innerHeight * devicePixelRatio);
  }

  function frame(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dots.forEach((dot, index) => {
      const x = (dot.x + Math.sin(time * .0005 + dot.phase) * .012) * canvas.width;
      const y = ((dot.y - time * dot.speed * .02) % 1 + 1) % 1 * canvas.height;
      const alpha = .16 + Math.abs(Math.sin(time * .002 + dot.phase)) * .38;
      ctx.fillStyle = index % 3 === 0 ? `rgba(79,196,207,${alpha})` : `rgba(255,111,157,${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, dot.r * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(frame);
  }

  addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
}

function boot() {
  $("quote").textContent = quotes[new Date().getDay() % quotes.length];
  setupTheme();
  setupAudio();
  setupBackground();
  setupParticles();
  update();
  setInterval(update, 1000);
}

boot();
