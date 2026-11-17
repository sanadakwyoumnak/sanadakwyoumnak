// برمجة: إسماعيل علي
    const header = document.querySelector("#site-header");
    const menuToggle = document.querySelector("#menu-toggle");
    const navLinks = document.querySelectorAll(".nav-links a");

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
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    const sections = document.querySelectorAll("main section[id]");
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(section => sectionObserver.observe(section));

    document.querySelectorAll(".property-favorite").forEach(button => {
      button.addEventListener("click", () => {
        const saved = button.classList.toggle("saved");
        button.setAttribute("aria-pressed", String(saved));
        button.setAttribute("aria-label", `${saved ? "إزالة" : "أضف"} ${button.dataset.property} ${saved ? "من" : "إلى"} المفضلة`);
      });
    });

    document.querySelector("#current-year").textContent = new Date().getFullYear();

    // ─── Dynamic Data from data.json ──────────────────────────
    async function loadSiteData() {
      try {
        const res = await fetch("data.json?v=" + Date.now());
        if (!res.ok) return;
        const data = await res.json();
        applyContact(data.contact);
        applyStats(data.hero?.stats);
        applyProperties(data.properties);
        // إعادة تهيئة المراقبين بعد إضافة العناصر الجديدة
        document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
        document.querySelectorAll(".property-favorite").forEach(button => {
          button.addEventListener("click", () => {
            const saved = button.classList.toggle("saved");
            button.setAttribute("aria-pressed", String(saved));
            button.setAttribute("aria-label", `${saved ? "إزالة" : "أضف"} ${button.dataset.property} ${saved ? "من" : "إلى"} المفضلة`);
          });
        });
      } catch (e) {
        console.warn("data.json not loaded, using static content.", e);
      }
    }

    function applyContact(c) {
      if (!c) return;
      // رقم الهاتف في الـ nav وجميع روابط tel:
      document.querySelectorAll("a[href^='tel:']").forEach(a => {
        a.href = "tel:+" + c.phone;
        const span = a.querySelector("span[dir='ltr']") || a.querySelector("span");
        if (span) span.textContent = c.phone_display || c.phone;
      });
      // واتساب
      document.querySelectorAll("a[href*='wa.me']").forEach(a => {
        a.href = "https://wa.me/" + c.whatsapp;
      });
    }

    function applyStats(stats) {
      if (!stats) return;
      const statEls = document.querySelectorAll(".hero-stat");
      stats.forEach((s, i) => {
        if (!statEls[i]) return;
        const strong = statEls[i].querySelector("strong");
        const span   = statEls[i].querySelector("span");
        if (strong) strong.textContent = s.value;
        if (span)   span.textContent   = s.label;
      });
    }

    function applyProperties(properties) {
      if (!properties || !properties.length) return;
      const grid = document.querySelector(".property-grid");
      if (!grid) return;
      grid.innerHTML = "";
      properties.forEach((p, i) => {
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
                <span>${p.area}</span>
                <span>${p.beds}</span>
                <span>${p.baths}</span>
              </div>
              <div class="property-bottom">
                <span class="property-price">${p.price} <small>${p.price_suffix}</small></span>
                <a class="property-link" href="#contact">التفاصيل
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </a>
              </div>
            </div>
          </article>
        `);
      });
    }

    loadSiteData();
