// برمجة: إسماعيل علي

// ─── Navigation & Header ───────────────────────────────────
const header     = document.querySelector("#site-header");
const menuToggle = document.querySelector("#menu-toggle");
const navLinks   = document.querySelectorAll(".nav-links a");

const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 24);
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const closeMenu = () => {
  header.classList.remove("menu-open");
  document.body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "فتح القائمة");
};
menuToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("menu-open");
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "إغلاق القائمة" : "فتح القائمة");
});
navLinks.forEach(link => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });

// ─── Scroll reveal ────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

// ─── Active nav link ──────────────────────────────────────
const sections = document.querySelectorAll("main section[id]");
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
  });
}, { rootMargin: "-35% 0px -55% 0px" });
sections.forEach(section => sectionObserver.observe(section));

document.querySelector("#current-year").textContent = new Date().getFullYear();

// ─── Favorite button ──────────────────────────────────────
function initFavorites() {
  document.querySelectorAll(".property-favorite").forEach(btn => {
    btn.addEventListener("click", () => {
      const saved = btn.classList.toggle("saved");
      btn.setAttribute("aria-pressed", String(saved));
      btn.setAttribute("aria-label", `${saved ? "إزالة" : "أضف"} ${btn.dataset.property} ${saved ? "من" : "إلى"} المفضلة`);
    });
  });
}
initFavorites();

// ─── Load dynamic data ────────────────────────────────────
async function loadSiteData() {
  try {
    const res = await fetch("data.json?v=" + Date.now());
    if (!res.ok) return;
    const D = await res.json();

    applyBrand(D.brand);
    applyContact(D.contact);
    applyHero(D.hero);
    applyTrustStrip(D.trust_strip);
    applyServices(D.services);
    applyProperties(D.properties);
    applyAbout(D.about);
    applyLocations(D.locations);
    applyProcess(D.process);
    applyContactSection(D.contact_section);
    applyFooter(D.footer);

    // إعادة تهيئة المراقبين بعد إضافة العناصر الجديدة
    document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
    initFavorites();
  } catch(e) {
    console.warn("data.json not loaded, using static content.", e);
  }
}

// ─── Apply functions ──────────────────────────────────────
function applyBrand(b) {
  if (!b) return;
  document.querySelectorAll(".brand-name").forEach(el => {
    const small = el.querySelector("small");
    el.childNodes[0].textContent = b.name || "";
    if (small && b.tagline) small.textContent = b.tagline;
  });
  if (b.name) document.title = b.name + " | وجهتك العقارية في جدة والمدينة";
}

function applyContact(c) {
  if (!c) return;
  document.querySelectorAll("a[href^='tel:']").forEach(a => {
    a.href = "tel:+" + c.phone;
    const span = a.querySelector("span");
    if (span) span.textContent = c.phone_display || c.phone;
  });
  document.querySelectorAll("a[href*='wa.me']").forEach(a => {
    a.href = "https://wa.me/" + c.whatsapp;
  });
}

function applyHero(h) {
  if (!h) return;
  setText(".eyebrow:first-of-type", h.eyebrow);
  // العنوان
  const h1 = document.querySelector(".hero-copy h1");
  if (h1 && h.heading_1 && h.heading_2) {
    h1.innerHTML = `<span>${h.heading_1}</span><br>${h.heading_2}`;
  }
  setText(".hero-copy > p", h.description);
  // CTA buttons
  const ctaBtns = document.querySelectorAll(".hero-cta .button");
  if (ctaBtns[0] && h.cta_primary) ctaBtns[0].childNodes[0].textContent = h.cta_primary + " ";
  if (ctaBtns[1] && h.cta_secondary) ctaBtns[1].textContent = h.cta_secondary;
  // ملاحظة
  const noteStrong = document.querySelector(".hero-note strong");
  const noteP      = document.querySelector(".hero-note p");
  if (noteStrong && h.note_title) noteStrong.textContent = h.note_title;
  if (noteP && h.note_subtitle) {
    const br = noteP.querySelector("br");
    if (br) br.nextSibling.textContent = h.note_subtitle;
  }
  // إحصائيات
  if (h.stats) {
    const statEls = document.querySelectorAll(".hero-stat");
    h.stats.forEach((s, i) => {
      if (!statEls[i]) return;
      const strong = statEls[i].querySelector("strong");
      const span   = statEls[i].querySelector("span");
      if (strong) strong.textContent = s.value;
      if (span)   span.textContent   = s.label;
    });
  }
  // صورة Hero
  const heroImg = document.querySelector(".hero-image-wrap img");
  if (heroImg && h.image) { heroImg.src = h.image; heroImg.alt = h.image_alt || ""; }
  const capSmall  = document.querySelector(".image-caption small");
  const capStrong = document.querySelector(".image-caption strong");
  if (capSmall  && h.image_caption_small)  capSmall.textContent  = h.image_caption_small;
  if (capStrong && h.image_caption_strong) capStrong.textContent = h.image_caption_strong;
}

function applyTrustStrip(ts) {
  if (!ts) return;
  const label = document.querySelector(".trust-inner > span");
  if (label && ts.label) label.textContent = ts.label;
  if (ts.items) {
    const list = document.querySelector(".trust-list");
    if (list) {
      list.innerHTML = ts.items.map(item => `<span>${item}</span>`).join("");
    }
  }
}

function applyServices(sv) {
  if (!sv) return;
  const sec = document.querySelector(".services");
  if (!sec) return;
  setText(".services .eyebrow", sv.eyebrow);
  setText(".services .section-heading h2", sv.heading);
  setText(".services .section-heading p", sv.description);
  // CTA card
  const ctaSmall  = document.querySelector(".services-cta small");
  const ctaStrong = document.querySelector(".services-cta strong");
  const ctaLink   = document.querySelector(".services-cta a");
  if (ctaSmall  && sv.cta_question) ctaSmall.textContent  = sv.cta_question;
  if (ctaStrong && sv.cta_text)     ctaStrong.textContent = sv.cta_text;
  if (ctaLink   && sv.cta_link)     ctaLink.childNodes[0].textContent = sv.cta_link + " ";
  // بطاقات الخدمات
  if (sv.items) {
    const cards = document.querySelectorAll(".service-card:not(.service-featured):not(.services-cta)");
    sv.items.forEach((s, i) => {
      if (!cards[i]) return;
      const h3 = cards[i].querySelector("h3");
      const p  = cards[i].querySelector("p");
      if (h3) h3.textContent = s.title;
      if (p)  p.textContent  = s.description;
    });
  }
}

function applyProperties(pr) {
  if (!pr) return;
  setText(".properties .eyebrow", pr.eyebrow);
  const propH2 = document.querySelector(".properties .section-heading h2");
  if (propH2 && pr.heading) propH2.innerHTML = pr.heading.replace("،", ",<br>").replace(",", "،<br>");
  setText(".properties .section-heading p", pr.description);
  const propCta = document.querySelector(".properties-footer .button");
  if (propCta && pr.cta) propCta.childNodes[0].textContent = pr.cta + " ";
  // العقارات
  if (pr.items && pr.items.length) {
    const grid = document.querySelector(".property-grid");
    if (!grid) return;
    grid.innerHTML = "";
    pr.items.forEach((p, i) => {
      const delay = i === 0 ? "" : i === 1 ? " reveal-delay-1" : " reveal-delay-2";
      grid.insertAdjacentHTML("beforeend", `
        <article class="property-card reveal${delay}">
          <div class="property-image">
            <img src="${p.image}" alt="${p.image_alt}" loading="lazy">
            <span class="property-tag">${p.tag}</span>
            <button class="property-favorite" type="button" data-property="${p.title}" aria-label="أضف ${p.title} إلى المفضلة" aria-pressed="false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20.8 8.7c0 5.4-8.8 11-8.8 11s-8.8-5.6-8.8-11A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z"/></svg>
            </button>
          </div>
          <div class="property-body">
            <div class="property-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
              ${p.location}
            </div>
            <h3>${p.title}</h3>
            <div class="property-specs">
              <span>${p.area}</span><span>${p.beds}</span><span>${p.baths}</span>
            </div>
            <div class="property-bottom">
              <span class="property-price">${p.price} <small>${p.price_suffix}</small></span>
              <a class="property-link" href="#contact">التفاصيل <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
            </div>
          </div>
        </article>`);
    });
  }
}

function applyAbout(ab) {
  if (!ab) return;
  setText(".about .eyebrow", ab.eyebrow);
  setText(".about .about-copy h2", ab.heading);
  setText(".about .about-copy > p", ab.description);
  const badgeStrong = document.querySelector(".about-badge strong");
  const badgeSpan   = document.querySelector(".about-badge span");
  if (badgeStrong && ab.badge_value) badgeStrong.textContent = ab.badge_value;
  if (badgeSpan   && ab.badge_label) badgeSpan.textContent   = ab.badge_label;
  const aboutCta = document.querySelector(".about-copy .button");
  if (aboutCta && ab.cta) aboutCta.childNodes[0].textContent = ab.cta + " ";
  const aboutImg = document.querySelector(".about-image img");
  if (aboutImg && ab.image) { aboutImg.src = ab.image; aboutImg.alt = ab.image_alt || ""; }
  // النقاط
  if (ab.points) {
    const pointsEl = document.querySelector(".about-points");
    if (pointsEl) {
      pointsEl.innerHTML = ab.points.map(pt => `
        <div class="about-point">
          <span class="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg></span>
          ${pt}
        </div>`).join("");
    }
  }
}

function applyLocations(lo) {
  if (!lo) return;
  setText(".locations .eyebrow", lo.eyebrow);
  setText(".locations .section-heading h2", lo.heading);
  setText(".locations .section-heading p", lo.description);
  if (lo.items) {
    const cards = document.querySelectorAll(".location-card");
    lo.items.forEach((l, i) => {
      if (!cards[i]) return;
      const img   = cards[i].querySelector("img");
      const small = cards[i].querySelector(".location-info small");
      const h3    = cards[i].querySelector(".location-info h3");
      if (img)   { img.src = l.image; img.alt = l.image_alt || ""; }
      if (small) small.textContent = l.subtitle;
      if (h3)    h3.textContent    = l.name;
    });
  }
}

function applyProcess(pc) {
  if (!pc) return;
  setText(".process .eyebrow", pc.eyebrow);
  setText(".process .section-heading h2", pc.heading);
  setText(".process .section-heading p", pc.description);
  if (pc.steps) {
    const steps = document.querySelectorAll(".process-step");
    pc.steps.forEach((s, i) => {
      if (!steps[i]) return;
      const small = steps[i].querySelector("small");
      const h3    = steps[i].querySelector("h3");
      const p     = steps[i].querySelector("p");
      if (small) small.textContent = s.number;
      if (h3)    h3.textContent    = s.title;
      if (p)     p.textContent     = s.description;
    });
  }
}

function applyContactSection(cs) {
  if (!cs) return;
  setText(".contact .eyebrow", cs.eyebrow);
  setText(".contact-box h2", cs.heading);
  setText(".contact-box > div > p", cs.description);
}

function applyFooter(ft) {
  if (!ft) return;
  setText(".footer-description", ft.description);
  const yr = document.getElementById("current-year");
  const copy = document.querySelector(".footer-bottom span:first-child");
  if (copy && ft.copyright) copy.innerHTML = `© <span id="current-year">${yr ? yr.textContent : new Date().getFullYear()}</span> ${ft.copyright}`;
  setText(".footer-bottom span:last-child", ft.location_line);
}

// ─── Helpers ──────────────────────────────────────────────
function setText(selector, text) {
  if (!text) return;
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

loadSiteData();
