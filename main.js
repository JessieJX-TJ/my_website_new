const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".site-nav__links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    });
  });
}

const caseNav = document.querySelector(".case-side-nav");
const caseLinks = caseNav ? [...caseNav.querySelectorAll("a[data-section]")] : [];
const caseSubLinks = caseNav ? [...caseNav.querySelectorAll(".case-side-nav__sub a")] : [];
const caseSections = caseLinks
  .map((link) => document.getElementById(link.dataset.section))
  .filter(Boolean);
const caseSubSections = caseSubLinks
  .map((link) => document.getElementById(link.getAttribute("href")?.slice(1)))
  .filter(Boolean);

if (caseLinks.length && caseSections.length) {
  const setActive = (id) => {
    caseLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.section === id);
    });
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive(visible[0].target.id);
    },
    { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] }
  );

  caseSections.forEach((section) => sectionObserver.observe(section));
  setActive(caseSections[0].id);
}

if (caseSubLinks.length && caseSubSections.length) {
  const setSubActive = (id) => {
    caseSubLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  };

  const subObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setSubActive(visible[0].target.id);
    },
    { rootMargin: "-25% 0px -55% 0px", threshold: [0.2, 0.4] }
  );

  caseSubSections.forEach((section) => subObserver.observe(section));
}
