"use strict";
(() => {
  const profile = window.PORTFOLIO;
  if (!profile) return;
  const element = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  };
  const safeURL = (value, local = false) => {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value, document.baseURI);
      if (["http:", "https:"].includes(url.protocol)) return value;
      if (local && !/^[a-z][a-z\d+.-]*:/i.test(value) && !value.startsWith("//")) return value;
    } catch (_) { /* Invalid URLs are omitted. */ }
    return null;
  };
  const link = (label, href, className) => {
    const a = element("a", className, label); a.href = href;
    if (/^https?:/i.test(href)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
    return a;
  };
  const tags = values => {
    const wrap = element("div", "tags");
    (values || []).forEach(value => wrap.append(element("span", "", value)));
    return wrap;
  };
  document.querySelectorAll("[data-name]").forEach(n => n.textContent = profile.name);
  ["role", "availability", "intro"].forEach(key => document.getElementById(key).textContent = profile[key]);
  document.getElementById("target-roles").textContent = profile.targetRoles;
  const linkedinHero = document.getElementById("linkedin-hero");
  const linkedinURL = safeURL(profile.linkedin);
  linkedinHero.hidden = !linkedinURL;
  if (linkedinURL) linkedinHero.href = linkedinURL;
  document.title = `${profile.name} — ${profile.role}`;
  document.querySelector('meta[name="description"]').content = `${profile.name} — ${profile.intro}`;
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("experience-list").replaceChildren(...profile.experience.map(item => {
    const card = element("article", "experience-card");
    const meta = element("div", "experience-meta");
    meta.append(element("span", "label", item.type), element("p", "", item.period));
    const body = element("div");
    body.append(element("h3", "", item.company), element("p", "experience-role", item.role));
    if (item.highlights?.length) { const ul = element("ul"); item.highlights.forEach(t => ul.append(element("li", "", t))); body.append(ul); }
    card.append(meta, body); return card;
  }));
  document.getElementById("skills-list").replaceChildren(...profile.skills.map((item, i) => {
    const card = element("article", "skill-card");
    card.append(element("h3", "", item.title), element("p", "", item.description), tags(item.tags)); return card;
  }));
  document.getElementById("education-list").replaceChildren(...(profile.education || []).map((item, index) => {
    const row = element("article", "education-entry" + (index === 0 ? " education-latest" : ""));
    const date = element("div", "education-date", item.year);
    const content = element("div", "education-content");
    const header = element("div", "education-card-heading");
    header.append(element("p", "education-school", item.issuer));
    if (index === 0) header.append(element("span", "education-badge", "Dernier diplôme"));
    content.append(header, element("h3", "education-name", item.name), element("p", "education-detail", item.detail));
    row.append(date, content);
    return row;
  }));
  const credentials = profile.certifications || [];
  if (credentials.length) {
    document.getElementById("certifications").hidden = false;
    document.getElementById("certifications-list").replaceChildren(...credentials.map(item => {
      const card = element("article", "skill-card");
      card.append(element("h3", "", item.name), element("p", "muted", [item.issuer, item.year].filter(Boolean).join(" · ")));
      const url = safeURL(item.url); if (url) card.append(link("Voir le justificatif ↗", url, "project-link")); return card;
    }));
  }
  const contacts = [];
  if (profile.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) contacts.push(["E-mail", profile.email, `mailto:${profile.email}`]);
  if (safeURL(profile.linkedin)) contacts.push(["LinkedIn", "Voir mon profil", profile.linkedin]);
  if (contacts.length) document.getElementById("contact-links").replaceChildren(...contacts.map(([label, value, href]) => {
    const a = link("", href, "contact-link"); const text = element("span"); text.append(element("small", "", label), document.createTextNode(value));
    const arrow = element("span", "accent", "↗"); arrow.setAttribute("aria-hidden", "true"); a.append(text, arrow); return a;
  }));
  const resumeURL = safeURL(profile.resume, true);
  if (resumeURL) { const a = document.getElementById("resume"); a.hidden = false; a.href = resumeURL; a.setAttribute("download", ""); }
  const toggle = document.querySelector(".menu-toggle"); const navigation = document.getElementById("nav-links");
  const closeMenu = () => { toggle.setAttribute("aria-expanded", "false"); navigation.classList.remove("open"); };
  toggle.addEventListener("click", () => { const open = toggle.getAttribute("aria-expanded") !== "true"; toggle.setAttribute("aria-expanded", String(open)); navigation.classList.toggle("open", open); });
  navigation.addEventListener("click", e => { if (e.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { closeMenu(); toggle.focus(); } });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) navigation.querySelectorAll("a").forEach(a => { const active = a.hash === `#${entry.target.id}`; a.classList.toggle("active", active); if (active) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current"); }); });
    }, {rootMargin: "-15% 0px -55% 0px"});
    document.querySelectorAll("main section[id]").forEach(s => observer.observe(s));
  }
})();
