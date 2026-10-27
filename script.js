/* =========================================================
   CONFIGURATION
   ---------------------------------------------------------
   Clé d'accès Web3Forms (web3forms.com) : les messages du formulaire
   de contact arrivent sur marine.ruez8@gmail.com.
   ========================================================= */
const WEB3FORMS_KEY = "4105044f-8d87-4842-a840-01d2a4bdf342";

/* Facultatif : URL "action" d'un formulaire Brevo, pour ajouter aussi
   le visiteur à une liste Brevo (Brevo > Contacts > Formulaires >
   Partager > "Code HTML intégré" : https://….sibforms.com/serve/…) */
const BREVO_FORM_URL = "https://671203b5.sibforms.com/serve/MUIFACG4nD_L-6kw2IF1ouSsNX5KIh9ZmjgvZ1ZipQVJacXvA25uds0dVJjiB_snMy0RiiY7LcEQW-MWTPj122qjUxkmJ_PgLGATlCMEV7sVCvEQRztT3tjhKoDuHqlj8hgyvtqX30Cer_L_M6j3vaY27BoUkKxTq4I3Iv306LT3Ov2TZJtZcx8WrDprcIAlxrpVw6kRrDogFdsOSw==";

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

  const name = form.PRENOM, email = form.EMAIL, consent = form.OPT_IN;
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
    // Brevo ne renvoie pas d'en-têtes CORS : envoi en "no-cors" (réponse opaque)
    // Le visiteur est ajouté à la liste Brevo, qui lui envoie l'email automatique
    if (BREVO_FORM_URL) {
      const brevoData = new FormData(form);
      // MESSAGE est obligatoire dans le formulaire Brevo
      if (!brevoData.get("MESSAGE").trim()) brevoData.set("MESSAGE", "(pas de message)");
      fetch(BREVO_FORM_URL, { method: "POST", mode: "no-cors", body: brevoData }).catch(console.error);
    }

    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `Nouveau message du site : ${name.value.trim()}`,
        from_name: "Site marineruez.fr",
        botcheck: form.email_address_check.value,
        Prénom: name.value.trim(),
        email: email.value.trim(),
        Message: form.MESSAGE.value.trim() || "(pas de message)",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || String(data.success) !== "true") throw new Error(data.message || `HTTP ${res.status}`);

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
    statusEl.textContent = "L’envoi n’a pas fonctionné. Vous pouvez m’écrire directement à contact@marineruez.fr.";
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

/* =========================================================
   Logo Datanello : construction en 3D, travelling de caméra,
   passage de lumière, puis le vrai logo fixe et net
   ========================================================= */
const dnStage = $("#dn-stage");
if (dnStage && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && Element.prototype.animate) {
  const LOGO_W = 3583;
  const world = $(".dn-world", dnStage);
  const logo = $(".dn-logo", dnStage);
  const add = (html, parent = logo) => (parent.insertAdjacentHTML("beforeend", html), parent.lastElementChild);

  // décor : halo
  const glow = add('<div class="dn-glow" aria-hidden="true"></div>', dnStage);
  const shadow = add('<div class="dn-shadow" aria-hidden="true"></div>');

  // tracés de construction (contours du symbole et lignes du texte), en coordonnées de l'image d'origine
  const guides = add(`<svg class="dn-guides" viewBox="0 0 3583 1013" preserveAspectRatio="none" aria-hidden="true">
    <polygon pathLength="1" points="0,59 218,0 218,519 0,671"/>
    <polygon pathLength="1" points="219,0 705,339 514,472 219,266"/>
    <polygon pathLength="1" points="0,831 705,340 705,606 125,1012"/>
    <line pathLength="1" x1="-200" y1="378" x2="3783" y2="378"/>
    <line pathLength="1" x1="3783" y1="756" x2="-200" y2="756"/>
  </svg>`);

  // les 3 morceaux du symbole : chacun est découpé à partir des pixels du logo, couleurs exactes
  const pieces = [
    { name: "bar", origin: "50% 66%", from: "translate3d(-40%,-120%,380px) rotateX(-80deg) rotateY(0deg) rotateZ(-10deg)", over: "translate3d(0%,4%,0px) rotateX(6deg) rotateY(0deg) rotateZ(0deg)", delay: 150 },
    { name: "fold", origin: "30.4% 13%", from: "translate3d(10%,-30%,160px) rotateX(0deg) rotateY(-120deg) rotateZ(6deg)", over: "translate3d(0%,0%,0px) rotateX(0deg) rotateY(10deg) rotateZ(0deg)", delay: 450 },
    { name: "band", origin: "50% 67%", from: "translate3d(-70%,55%,-600px) rotateX(30deg) rotateY(0deg) rotateZ(-18deg)", over: "translate3d(1.5%,-1%,0px) rotateX(0deg) rotateY(0deg) rotateZ(1deg)", delay: 700 },
  ].map((p) => ({ ...p, el: add(`<img class="dn-piece" src="assets/datanello/datanello-${p.name}.png" alt="" style="transform-origin:${p.origin}">`) }));

  // les 8 lettres : bornes horizontales dans l'image d'origine
  const cuts = [760, 1163, 1438, 1817, 2218, 2550, 2871, 3169, LOGO_W];
  const letters = cuts.slice(0, -1).map((x0, i) => {
    const x1 = cuts[i + 1], pct = (v) => ((v / LOGO_W) * 100).toFixed(3) + "%";
    return add(`<div class="dn-letter" aria-hidden="true" style="clip-path:inset(0 ${pct(LOGO_W - x1)} 0 ${pct(x0)});transform-origin:${pct((x0 + x1) / 2)} 75%"></div>`);
  });
  const sheen = add('<div class="dn-sheen" aria-hidden="true"></div>');

  const settle = "translate3d(0%,0%,0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)";
  const out = "cubic-bezier(.16,1,.3,1)";
  let running = [];

  const play = () => {
    running.forEach((a) => a.cancel());
    dnStage.classList.remove("is-done");
    dnStage.classList.add("is-armed");
    const go = (el, frames, opts) => { const a = el.animate(frames, { fill: "both", ...opts }); running.push(a); return a; };
    running = [];

    // caméra : part de loin et de biais, passe de l'autre côté, puis se cale de face
    const cam = go(world, [
      { transform: "translate3d(-6%,5%,-420px) rotateX(24deg) rotateY(-38deg) rotateZ(-4deg) scale(1)", easing: "cubic-bezier(.4,0,.3,1)" },
      { transform: "translate3d(2%,-1%,-110px) rotateX(-6deg) rotateY(14deg) rotateZ(1deg) scale(1)", offset: 0.55, easing: "cubic-bezier(.3,0,.25,1)" },
      { transform: "translate3d(0%,0%,10px) rotateX(1deg) rotateY(-2deg) rotateZ(0deg) scale(1.012)", offset: 0.86, easing: "cubic-bezier(.3,0,.3,1)" },
      { transform: "translate3d(0%,0%,0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)" },
    ], { duration: 3400 });

    // tracés de construction : ils se dessinent, puis s'effacent quand la matière arrive
    $$("polygon, line", guides).forEach((g, i) =>
      go(g, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, delay: 80 + i * 90, easing: "cubic-bezier(.6,0,.2,1)" })
    );
    go(guides, [{ opacity: 0 }, { opacity: 0.7, offset: 0.15 }, { opacity: 0.7, offset: 0.6 }, { opacity: 0 }], { duration: 2100 });

    // le symbole se construit morceau par morceau
    pieces.forEach((p) =>
      go(p.el, [
        { transform: p.from, opacity: 0, filter: "drop-shadow(0px 40px 28px rgba(0,30,70,.35))" },
        { transform: p.over, opacity: 1, filter: "drop-shadow(0px 12px 12px rgba(0,30,70,.18))", offset: 0.7 },
        { transform: settle, opacity: 1, filter: "drop-shadow(0px 0px 0px rgba(0,30,70,0))" },
      ], { duration: 1150, delay: p.delay, easing: out })
    );

    // les lettres tombent une à une depuis l'avant-plan
    letters.forEach((el, i) =>
      go(el, [
        { transform: "translate3d(0%,-60%,520px) rotateX(-90deg)", opacity: 0, filter: "blur(8px)" },
        { transform: "translate3d(0%,3%,0px) rotateX(8deg)", opacity: 1, filter: "blur(0px)", offset: 0.6 },
        { transform: "translate3d(0%,0%,0px) rotateX(0deg)", opacity: 1, filter: "blur(0px)" },
      ], { duration: 950, delay: 1100 + i * 80, easing: out })
    );

    // ombre portée : large et diffuse quand le logo est haut, nette à l'atterrissage, puis disparaît
    go(shadow, [
      { opacity: 0, transform: "scale(1.5)" },
      { opacity: 0.8, transform: "scale(1.15)", offset: 0.45 },
      { opacity: 1, transform: "scale(1)", offset: 0.82 },
      { opacity: 0, transform: "scale(1)" },
    ], { duration: 3700 });

    // passage de lumière sur le logo, et halo quand il se pose
    go(sheen, [
      { opacity: 0, backgroundPosition: "120% 0" },
      { opacity: 1, offset: 0.12 },
      { opacity: 1, offset: 0.8 },
      { opacity: 0, backgroundPosition: "-20% 0" },
    ], { duration: 1000, delay: 2550, easing: "cubic-bezier(.45,0,.35,1)" });
    go(glow, [
      { opacity: 0, transform: "scale(.7)" },
      { opacity: 1, transform: "scale(1.1)", offset: 0.35 },
      { opacity: 0, transform: "scale(1.25)" },
    ], { duration: 1200, delay: 2750, easing: "ease-out" });

    // fin : on remplace les morceaux par le vrai logo, pour une image fixe et parfaitement nette
    cam.finished.then(() => setTimeout(() => {
      dnStage.classList.add("is-done");
      dnStage.classList.remove("is-armed");
      running.forEach((a) => a.cancel());
      running = [];
    }, 450)).catch(() => {});
  };

  dnStage.classList.add("is-armed");
  const ready = Promise.all($$("img", dnStage).map((img) => img.decode().catch(() => {})));
  const watcher = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    watcher.disconnect();
    ready.then(play);
  }, { threshold: 0.55 });
  watcher.observe(dnStage);
  // un clic sur le logo fini rejoue l'animation
  dnStage.addEventListener("click", () => dnStage.classList.contains("is-done") && play());
}
