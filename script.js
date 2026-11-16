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
    document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));

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
