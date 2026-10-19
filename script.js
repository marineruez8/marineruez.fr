/* =========================================================
   CONFIGURATION
   ---------------------------------------------------------
   Collez ici l'URL "action" de votre formulaire Brevo
   (Brevo > Contacts > Formulaires > votre formulaire > Partager >
   "Code HTML intégré" : l'URL commence par https://….sibforms.com/serve/…)
   ========================================================= */
const BREVO_FORM_URL = "";

/* ---------- utilitaires ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

$("#year").textContent = new Date().getFullYear();

/* ---------- navigation ---------- */
const topbar = $(".topbar");
const burger = $(".burger");
const nav = $("#nav");

burger.addEventListener("click", () => {
  const open = burger.getAttribute("aria-expanded") === "true";
  burger.setAttribute("aria-expanded", String(!open));
  nav.classList.toggle("is-open", !open);
});
$$("a", nav).forEach((a) =>
  a.addEventListener("click", () => {
    burger.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  })
);

const navLinks = $$("a", nav);
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
$$("main section[id]").forEach((s) => spy.observe(s));

/* ---------- apparitions ---------- */
const revealer = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("is-in"), revealer.unobserve(e.target))),
  { threshold: 0.15 }
);
$$(".reveal").forEach((el) => revealer.observe(el));

/* =========================================================
   3. Animation au défilement : designer → réaliser → automatiser
   ========================================================= */
const story = $(".story");
const stage = $("#stage");
const stageWrap = $(".stage-wrap");
const nl = $("#nl");
const sketchPaths = $$(".nl-sketch path");
const notes = $$(".note");
const swatches = $$(".swatches li");
const blocks = $$(".m-block").map((el) => {
  const [x, y] = el.dataset.from.split(",").map(Number);
  return { el, x, y };
});
const mock = $(".mock");
const envelope = $("#envelope");
const verbs = $$(".verb");
const caption = $("#storyCaption");
const sentNote = $(".sent-note");
const kakemono = $(".print-kakemono");
const cardBack = $(".print-card--back");
const cardFront = $(".print-card--front");
const printFlyer = $(".print-flyer");
const crops = $(".crops");
const printNote = $(".print-note");
const storySegs = $$(".story-bar span");

const dests = {
  inbox: { el: $(".dest-inbox"), x: 100, y: 230 },
  phone: { el: $(".dest-phone"), x: 662, y: 110 },
  linkedin: { el: $(".dest-linkedin"), x: 645, y: 400 },
};
const flightPlan = ["inbox", "phone", "linkedin", "inbox", "phone", "linkedin"];
const flyersBox = $("#flyers");
const flyers = flightPlan.map((key) => {
  const f = envelope.cloneNode(true);
  f.removeAttribute("id");
  f.className = "flyer";
  f.style.setProperty("--flap", "0deg");
  f.style.setProperty("--seal", "1");
  flyersBox.appendChild(f);
  return { el: f, dest: dests[key] };
});
const ENV_CX = 380, ENV_CY = 290; // centre de l'enveloppe dans le repère 760×600

let activeStep = -1;

function fitStage() {
  const w = stageWrap.clientWidth;
  const h = stageWrap.clientHeight;
  stage.style.setProperty("--s", Math.min(1.15, w / 760, h / 600));
}

function setStep(i) {
  if (i === activeStep) return;
  activeStep = i;
  verbs.forEach((v, k) => v.classList.toggle("is-active", k === i));
  caption.textContent = $$("p", verbs[i]).map((p) => p.textContent).join(" ");
}

function renderStory() {
  const rect = story.getBoundingClientRect();
  const total = story.offsetHeight - window.innerHeight;
  const p = clamp(-rect.top / total);

  const p1 = clamp((p - 0.02) / 0.15); // croquis
  const p2 = clamp((p - 0.17) / 0.15); // maquette (prototype)
  const pr = clamp((p - 0.36) / 0.26); // supports imprimés
  const p3 = clamp((p - 0.68) / 0.3);  // automatisation

  setStep(p < 0.34 ? 0 : p < 0.66 ? 1 : 2);

  // téléphone : chaque segment de la barre se remplit pendant son étape ; l'invitation disparaît dès le début
  storySegs.forEach((seg, i) => seg.style.setProperty("--f", clamp(p * 3 - i)));
  story.classList.toggle("is-started", p > 0.02);

  // --- 1. croquis : les traits se dessinent
  const n = sketchPaths.length;
  sketchPaths.forEach((path, i) => {
    const local = clamp((p1 - (i / n) * 0.6) / 0.4);
    path.style.strokeDashoffset = 1 - local;
  });
  $(".nl-sketch").style.opacity = 1 - clamp((p2 - 0.4) / 0.5) * 0.92;

  notes.forEach((note, i) => {
    const show = clamp((p1 - 0.25 - i * 0.15) / 0.15);
    note.style.opacity = show * (1 - clamp(p2 / 0.5));
  });

  swatches.forEach((sw, i) => {
    const show = ease(clamp((p1 - 0.55 - i * 0.08) / 0.2));
    const hide = clamp(p2 / 0.6);
    sw.style.opacity = show * (1 - hide);
    sw.style.transform = `translateY(${(1 - show) * 14 - hide * 30}px) scale(${0.6 + show * 0.4 - hide * 0.4})`;
  });

  // --- 2. maquette : les blocs glissent à leur place
  mock.style.setProperty("--mock-bg", p2);
  blocks.forEach((b, i) => {
    const local = ease(clamp((p2 - (i / blocks.length) * 0.5) / 0.5));
    b.el.style.opacity = local;
    b.el.style.transform = `translate(${b.x * (1 - local)}px, ${b.y * (1 - local)}px)`;
  });
  nl.style.boxShadow = p2 > 0 ? `0 ${30 * p2}px ${60 * p2}px -30px rgba(30,30,40,${0.45 * p2})` : "none";
  nl.style.borderRadius = "6px";

  // --- 2. supports imprimés : le kakémono se déroule, les cartes arrivent et se retournent
  const printOut = 1 - clamp((p - 0.64) / 0.05);
  const unroll = ease(clamp(pr / 0.4));
  kakemono.style.opacity = clamp(pr / 0.08) * printOut;
  kakemono.style.setProperty("--unroll", 1 - unroll);

  const cardsIn = ease(clamp((pr - 0.2) / 0.3));
  const flip = ease(clamp((pr - 0.5) / 0.3));
  cardBack.style.opacity = cardsIn * printOut;
  cardBack.style.transform = `translateX(${(cardsIn - 1) * 80}px) rotate(${7 * cardsIn}deg)`;
  cardFront.style.opacity = cardsIn * printOut;
  cardFront.style.transform = `translateX(${(cardsIn - 1) * 120}px) rotate(${-4 * cardsIn}deg)`;
  cardFront.style.setProperty("--flip", `${180 * flip}deg`);

  const flyerIn = ease(clamp((pr - 0.35) / 0.3));
  printFlyer.style.opacity = flyerIn * printOut;
  printFlyer.style.transform = `translateY(${(1 - flyerIn) * 60}px) rotate(${3 * flyerIn}deg)`;

  crops.style.opacity = clamp((pr - 0.1) / 0.2) * printOut;
  printNote.style.opacity = clamp((pr - 0.75) / 0.2) * printOut;

  // --- 3. automatisation : pliage en enveloppe puis envol
  const fold = ease(clamp(p3 / 0.3));
  const close = ease(clamp((p3 - 0.22) / 0.14));
  const fly = clamp((p3 - 0.36) / 0.64);

  nl.style.transform = `perspective(900px) translateY(${-10 * fold}px) scale(${1 - 0.55 * fold}, ${1 - 0.72 * fold}) rotateX(${fold * 28}deg)`;
  nl.style.opacity = 1 - clamp((fold - 0.6) / 0.4);

  envelope.style.opacity = clamp((fold - 0.5) / 0.3) * (1 - clamp((fly - 0.75) / 0.25));
  envelope.style.transform = `scale(${0.8 + 0.2 * fold})`;
  envelope.style.setProperty("--flap", `${180 - 180 * close}deg`);
  envelope.style.setProperty("--seal", close);

  Object.values(dests).forEach((d) => {
    d.el.style.opacity = clamp((p3 - 0.05) / 0.3);
    d.el.style.transform = `translateY(${(1 - clamp((p3 - 0.05) / 0.3)) * 20}px)`;
  });

  const arrived = new Set();
  flyers.forEach((f, k) => {
    const local = clamp((fly - k * 0.07) / 0.5);
    const e = ease(local);
    const dx = (f.dest.x - ENV_CX) * e;
    const dy = (f.dest.y - ENV_CY) * e - Math.sin(Math.PI * e) * 110;
    const rot = Math.sin(Math.PI * e) * (f.dest.x < ENV_CX ? -18 : 18);
    f.el.style.opacity = local > 0 ? 1 - clamp((local - 0.85) / 0.15) : 0;
    f.el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${1 - 0.7 * e})`;
    if (local >= 0.95) arrived.add(f.dest);
  });
  Object.values(dests).forEach((d) => d.el.classList.toggle("got", arrived.has(d)));
  sentNote.style.opacity = clamp((fly - 0.8) / 0.2);
}

/* =========================================================
   5. Nuage d'outils : les mots apparaissent un à un au défilement
   ========================================================= */
const toolsSection = $(".tools");
const cloudWords = $$("#cloud li");
// ordre d'apparition mélangé (fixe) pour que le nuage se remplisse un peu partout
const cloudOrder = cloudWords
  .map((el, i) => ({ el, key: Math.sin(i * 12.9898) * 43758.5453 % 1 }))
  .sort((a, b) => a.key - b.key)
  .map((o) => o.el);

function renderCloud() {
  const rect = toolsSection.getBoundingClientRect();
  const total = toolsSection.offsetHeight - window.innerHeight;
  // commence quand la section arrive à mi-écran, nuage complet à mi-défilement
  const p = clamp((window.innerHeight * 0.5 - rect.top) / (total * 0.5 + window.innerHeight * 0.4));
  const count = Math.round(p * cloudOrder.length);
  cloudOrder.forEach((el, i) => el.classList.toggle("is-on", i < count));
}

/* =========================================================
   7. Méthode : une étape par « écran » de défilement
   ========================================================= */
const methodSection = $("#methode");
const methodSteps = $$(".mstep", methodSection);
const methodDots = $$(".method-progress li", methodSection);
// chaque trait d’illustration se dessine à son tour (le dessin vectorisé de l’étape 1 a ses délais intégrés)
methodSteps.forEach((step) => $$(".mstep-art--traced .lines path", step).forEach((p) => p.setAttribute("pathLength", "1")));
methodSteps.forEach((step) =>
  $$(".mstep-art:not(.mstep-art--traced) path", step).forEach((path, i) => {
    path.setAttribute("pathLength", "1");
    path.style.setProperty("--i", i);
  })
);
let methodStep = -1;

function renderMethod() {
  const rect = methodSection.getBoundingClientRect();
  const total = methodSection.offsetHeight - window.innerHeight;
  const p = clamp(-rect.top / total);
  methodSection.style.setProperty("--p", p); // jauges : barre du bas (ordinateur) et jauge à côté de chaque étape (téléphone)
  // l'étape 1 s'affiche dès que la section arrive à l'écran
  const step = rect.top > window.innerHeight * 0.6 ? -1 : Math.min(methodSteps.length - 1, Math.floor(p * methodSteps.length));
  if (step === methodStep) return;
  methodStep = step;
  methodSteps.forEach((el, i) => {
    el.classList.toggle("is-active", i === step);
    el.classList.toggle("is-past", i < step);
  });
  methodDots.forEach((el, i) => el.classList.toggle("is-active", i === step));
}

let ticking = false;
function onScroll() {
  topbar.classList.toggle("is-scrolled", window.scrollY > 10);
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    renderStory();
    renderCloud();
    renderMethod();
    ticking = false;
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => {
  fitStage();
  renderStory();
});
fitStage();
// recalcule l'échelle de l'animation dès que son cadre change de taille (chargement, rotation du téléphone…)
if ("ResizeObserver" in window) new ResizeObserver(fitStage).observe(stageWrap);
renderStory();
renderCloud();
renderMethod();
onScroll();

/* =========================================================
   4. Cartes « Quand… alors… » qui se retournent
   ========================================================= */
// type : "design" (donner envie), "print" (marquer les esprits), "auto" (libérer du temps)
const scenarioTypes = {
  design: "Image",
  print: "Print",
  auto: "Outils",
};
const scenarios = [
  {
    type: "design",
    when: "Quand vous lancez votre activité",
    then: "<b>logo</b>, <b>couleurs</b> et <b>cartes de visite</b> qui ne ressemblent à personne d’autre.",
  },
  {
    type: "auto",
    when: "Quand un client vous écrit à 22h",
    then: "il reçoit une <b>réponse tout de suite</b>, et vous trouvez sa <b>demande résumée</b> le lendemain matin.",
  },
  {
    type: "print",
    when: "Quand vous participez à un salon",
    then: "<b>kakémono</b> et <b>flyers</b> qui arrêtent les passants, <b>cartes de visite</b> qu’on garde.",
  },
  {
    type: "auto",
    when: "Quand un devis reste sans réponse 5 jours",
    then: "une <b>relance</b> part toute seule, au bon moment.",
  },
  {
    type: "design",
    when: "Quand votre site ne vous ressemble plus",
    then: "je le repense&nbsp;: <b>beau</b>, <b>simple</b>, parfait sur <b>mobile</b>.",
  },
  {
    type: "auto",
    when: "Quand une prestation se termine",
    then: "votre client reçoit une <b>demande d’avis Google</b>, sans que vous y pensiez.",
  },
  {
    type: "print",
    when: "Quand vous préparez des portes ouvertes",
    then: "<b>affiches</b>, <b>flyers</b> et <b>plaquette</b> à vos couleurs, pour donner envie de venir.",
  },
  {
    type: "auto",
    when: "Quand on vous pose toujours les mêmes questions",
    then: "un <b>assistant IA</b> y répond à partir de <b>vos propres documents</b>.",
  },
];

/* Intro de la section : point rouge qui rebondit puis remplit l'encart */
const autoSection = $("#automatisations");
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  autoSection.classList.add("intro-pending");
  const introObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      introObserver.disconnect();
      // facteur d'agrandissement pour que le cercle couvre toute la section
      const { width, height } = autoSection.getBoundingClientRect();
      autoSection.style.setProperty("--grow", Math.ceil((2 * Math.hypot(width, height)) / 28));
      autoSection.classList.add("is-playing");
      setTimeout(() => autoSection.classList.remove("intro-pending", "is-playing"), 1100);
    },
    { rootMargin: "0px 0px -60% 0px" }
  );
  introObserver.observe(autoSection);
}

const grid = $("#autoGrid");
const canHover = window.matchMedia("(hover: hover)");
grid.replaceChildren(); // retire la version texte (pour les robots), remplacée par les cartes animées

scenarios.forEach((s, i) => {
  const isWhen = s.when.startsWith("Quand");
  const trigger = isWhen ? s.when.replace(/^Quand /, "").replace(/^./, (c) => c.toUpperCase()) : s.when;
  const card = document.createElement("article");
  card.className = `flip-card flip-card--${s.type} reveal`;
  card.tabIndex = 0;
  card.setAttribute("aria-label", `${scenarioTypes[s.type]}. ${s.when}, alors ${s.then.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ")}`);
  card.innerHTML = `
    <div class="flip-inner">
      <div class="flip-face flip-front" aria-hidden="true">
        <span class="flip-num">${String(i + 1).padStart(2, "0")}</span>
        <span class="flip-tag">${scenarioTypes[s.type]}</span>
        <p class="auto-when">${isWhen ? "Quand…" : "Automatiquement…"}</p>
        <h3>${trigger}</h3>
        <p class="flip-hint"><span class="flip-icon">↻</span>${canHover.matches ? "Survolez" : "Touchez"} pour la suite</p>
      </div>
      <div class="flip-face flip-back" aria-hidden="true">
        <span class="flip-tag">${scenarioTypes[s.type]}</span>
        <p class="auto-when">alors…</p>
        <p class="auto-then">${s.then}</p>
      </div>
    </div>`;
  // Sur écran tactile, pas de survol : on retourne la carte au toucher
  card.addEventListener("click", () => !canHover.matches && card.classList.toggle("is-flipped"));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      card.classList.toggle("is-flipped");
    }
  });
  grid.append(card);
  revealer.observe(card);
});
grid.insertAdjacentHTML(
  "beforeend",
  `<article class="auto-card auto-card--cta reveal">
     <h3>Et chez vous, par quoi on commence&nbsp;?</h3>
     <p>30 minutes pour en parler.</p>
     <a href="#contact" class="btn">Parlons-en</a>
   </article>`
);
revealer.observe(grid.lastElementChild);

/* =========================================================
   9. Formulaire de contact → Brevo
   ========================================================= */
const form = $("#contactForm");
const statusEl = $(".form-status", form);

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  statusEl.className = "form-status";
  statusEl.textContent = "";

  const name = form.FIRSTNAME, email = form.EMAIL, consent = form.OPT_IN;
  let ok = true;
  [name, email].forEach((input) => {
    const bad = !input.value.trim() || !input.checkValidity();
    input.closest(".field").classList.toggle("has-error", bad);
    if (bad) ok = false;
  });
  consent.closest(".consent").classList.toggle("has-error", !consent.checked);
  if (!consent.checked) ok = false;

  if (!ok) {
    statusEl.classList.add("err");
    statusEl.textContent = "Merci de renseigner votre prénom, un email valide et d’accepter la mention.";
    return;
  }

  const btn = $("button[type=submit]", form);
  btn.disabled = true;
  btn.textContent = "Envoi…";

  try {
    if (!BREVO_FORM_URL) throw new Error("BREVO_FORM_URL non configurée");
    // Brevo ne renvoie pas d'en-têtes CORS : envoi en "no-cors" (réponse opaque)
    await fetch(BREVO_FORM_URL, { method: "POST", mode: "no-cors", body: new FormData(form) });
    form.classList.add("is-sent");
    btn.textContent = "Envoyé ✓";
    statusEl.classList.add("ok");
    statusEl.textContent = `Merci ${name.value.trim()} ! Regardez votre boîte mail : l’email automatique est déjà en route.`;
    form.reset();
  } catch (err) {
    console.error(err);
    btn.disabled = false;
    btn.textContent = "Envoyer";
    statusEl.classList.add("err");
    statusEl.textContent = "L’envoi n’a pas fonctionné. Vous pouvez m’écrire directement à marine.ruez8@gmail.com.";
  }
});

/* =========================================================
   10. Visionneuse : un clic sur l'image d'un projet l'agrandit
   ========================================================= */
const lightbox = $("#lightbox");
const lightboxImg = $("img", lightbox);
const lightboxClose = $(".lightbox-close", lightbox);
let lightboxOpener = null;

function openLightbox(link) {
  lightboxOpener = link;
  lightboxImg.src = link.getAttribute("href");
  lightboxImg.alt = $("img", link)?.alt || "";
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = "";
  lightboxImg.removeAttribute("src");
  lightboxOpener?.focus();
}

$$(".project-link").forEach((link) => {
  if (!/\.(jpe?g|png|webp)$/i.test(link.getAttribute("href") || "")) return;
  link.addEventListener("click", (e) => {
    e.preventDefault();
    openLightbox(link);
  });
});
lightbox.addEventListener("click", (e) => { if (e.target !== lightboxImg) closeLightbox(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lightbox.hidden) closeLightbox(); });
