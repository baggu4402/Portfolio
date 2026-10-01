(() => {
  "use strict";

  const config = window.PORTFOLIO_CONFIG || {};
  const projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
  const grid = document.querySelector("#project-grid");
  const filters = document.querySelector("#project-filters");
  const dialog = document.querySelector("#project-dialog");
  const dialogContent = document.querySelector("#dialog-content");
  const imageDialog = document.querySelector("#image-dialog");
  const lightboxContent = document.querySelector("#lightbox-content");
  const filterCategories = ["Unity", "Unreal Engine", "Digital Twin"];
  const imageLoader = window.PORTFOLIO_IMAGE_LOADER;
  const coverRequests = new WeakMap();
  let lastDetailButton = null;
  let lastGalleryButton = null;
  let detailsVersion = 0;
  let currentProject = null;
  let pendingGalleryRefresh = null;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Reject executable URL schemes. Keep relative URLs usable under a Pages subpath and file://.
  function safeUrl(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    const raw = value.trim();
    try {
      const url = new URL(raw, window.location.href);
      if (["https:", "http:"].includes(url.protocol)) return raw;
      if (url.protocol === "file:" && window.location.protocol === "file:" && !/^[a-z][a-z\d+.-]*:/i.test(raw)) return raw;
    } catch { /* A malformed or unset URL does not create a broken link. */ }
    return "";
  }

  function link(label, href, className) {
    const anchor = element("a", className, label);
    anchor.href = href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.append(element("span", "sr-only", " (opens in a new tab)"));
    return anchor;
  }

  function tags(technologies) {
    const list = element("ul", "tag-list");
    list.setAttribute("aria-label", "Technologies");
    for (const technology of Array.isArray(technologies) ? technologies : []) {
      list.append(element("li", "tag", technology));
    }
    return list;
  }

  function categories(project) {
    return Array.isArray(project.categories) ? project.categories : [];
  }

  function mediaTheme(project) {
    if (categories(project).includes("Digital Twin")) return "ai";
    return categories(project).some(category => ["Unity", "Unreal Engine"].includes(category)) ? "game" : "software";
  }

  function imageAlt(project, index) {
    return project.imageAlts?.[index] || `${project.title} — project image ${imageNumber(project, index)}`;
  }

  function imageNumber(project, index) {
    return /\/(\d{2})\.[^/]+$/.exec(project.images?.[index] || "")?.[1] || String(index + 1).padStart(2, "0");
  }

  function applyFoundImages(project, images) {
    const alts = new Map((project.images || []).map((source, index) => [source, project.imageAlts?.[index]]));
    project.images = images;
    project.imageAlts = images.map((source, index) => alts.get(source) || `${project.title} — project image ${imageNumber(project, index)}`);
    updateRenderedCover(project);
  }

  function updateRenderedCover(project) {
    const wrappers = [...grid.querySelectorAll(".project-card")]
      .filter(card => card.dataset.projectId === project.id)
      .map(card => card.querySelector(".project-media"));
    if (dialog.open && currentProject === project) wrappers.push(dialogContent.querySelector(".project-media"));
    for (const wrapper of wrappers) {
      if (!wrapper || wrapper.querySelector('.media-toggle[aria-pressed="true"]')) continue;
      const source = safeUrl(project.images?.[0]);
      if (source && wrapper.querySelector(".project-image").getAttribute("src") !== source) {
        wrapper.replaceWith(projectMedia(project, wrapper.closest("#project-dialog") !== null));
      }
    }
  }

  function ensureCover(project) {
    if (!imageLoader || !project.imageFolder || coverRequests.has(project)) return;
    const request = imageLoader.findProjectCover(project.imageFolder, project.images).then(async source => {
      if (source) {
        if (project.images?.[0] !== source) {
          applyFoundImages(project, [source, ...(project.images || []).filter(image => image !== source)]);
        }
      } else {
        applyFoundImages(project, await imageLoader.findProjectImages(project.imageFolder, project.images));
      }
    });
    coverRequests.set(project, request);
  }

  const coverObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const project = projects.find(item => item.id === entry.target.dataset.projectId);
      if (project) ensureCover(project);
      coverObserver.unobserve(entry.target);
    }
  }, { rootMargin: "240px" }) : null;

  function fillGallery(project, slot) {
    const focusedPath = slot.contains(document.activeElement) ? document.activeElement.dataset.imagePath : null;
    slot.replaceChildren();
    slot.removeAttribute("aria-busy");
    if (project.images?.length > 1) slot.append(projectGallery(project));
    if (focusedPath) [...slot.querySelectorAll(".gallery-image")].find(button => button.dataset.imagePath === focusedPath)?.focus();
  }

  function projectMedia(project, detail = false) {
    const category = mediaTheme(project);
    const fallback = `./assets/images/placeholder-${category}.svg`;
    // Do not filter or reorder images: index zero is always the cover.
    const thumbnail = safeUrl(project.images?.[0]);
    const gif = safeUrl(project.gif);
    const wrapper = element("div", `project-media media-${category}`);
    const img = element("img", "project-image");
    img.width = 640;
    img.height = 400;
    img.loading = detail ? "eager" : "lazy";
    img.decoding = "async";
    img.alt = thumbnail ? imageAlt(project, 0) : `${project.title} — image coming soon`;
    const caption = element("span", "media-caption", "Image coming soon");
    caption.hidden = Boolean(thumbnail);
    const status = element("span", "media-status");
    status.setAttribute("role", "status");
    wrapper.append(img, caption, status);

    let playing = false;
    let thumbnailFailed = false;
    let toggle;
    function restoreThumbnail() {
      img.alt = thumbnail && !thumbnailFailed ? imageAlt(project, 0) : `${project.title} — image coming soon`;
      img.src = thumbnail && !thumbnailFailed ? thumbnail : fallback;
      caption.hidden = Boolean(thumbnail && !thumbnailFailed);
      playing = false;
      if (toggle) {
        toggle.textContent = "▷ Play GIF";
        toggle.setAttribute("aria-pressed", "false");
      }
    }
    img.addEventListener("error", () => {
      if (playing) {
        status.textContent = "Unable to load the GIF.";
        restoreThumbnail();
        toggle.disabled = true;
      } else {
        thumbnailFailed = true;
        caption.hidden = false;
        img.alt = `${project.title} — image coming soon`;
        if (img.getAttribute("src") !== fallback) img.src = fallback;
        else img.hidden = true;
      }
    });
    restoreThumbnail();
    if (gif) {
      toggle = element("button", "media-toggle", "▷ Play GIF");
      toggle.type = "button";
      toggle.setAttribute("aria-pressed", "false");
      toggle.setAttribute("aria-label", `Play or pause ${project.title} GIF`);
      toggle.addEventListener("click", () => {
        status.textContent = "";
        if (playing) restoreThumbnail();
        else {
          playing = true;
          caption.hidden = true;
          img.hidden = false;
          img.alt = `${project.title} gameplay or demonstration GIF`;
          img.src = gif;
          toggle.textContent = "Ⅱ Pause GIF";
          toggle.setAttribute("aria-pressed", "true");
        }
      });
      wrapper.append(toggle);
    }
    return wrapper;
  }

  function projectLinks(project, className) {
    const group = element("div", className);
    for (const item of Array.isArray(project.links) ? project.links : []) {
      const href = safeUrl(item?.url);
      if (!href || !item.label) continue;
      group.append(link(item.label, href, "project-link"));
    }
    return group;
  }

  function openImage(src, alt, button) {
    lastGalleryButton = button;
    const image = element("img", "lightbox-image");
    image.alt = alt;
    image.addEventListener("error", () => {
      image.hidden = true;
      lightboxContent.append(element("p", "empty-state", "Unable to load this image."));
    }, { once: true });
    image.src = src;
    lightboxContent.replaceChildren(image);
    imageDialog.showModal();
    imageDialog.querySelector(".dialog-close").focus();
  }

  function projectGallery(project) {
    const gallery = element("section", "project-gallery");
    gallery.setAttribute("aria-label", `${project.title} image gallery`);
    gallery.append(element("h3", "", "Project Gallery"));
    const galleryGrid = element("div", "gallery-grid");
    for (const [offset, path] of project.images.slice(1).entries()) {
      const index = offset + 1;
      const source = safeUrl(path);
      const fallback = `./assets/images/placeholder-${mediaTheme(project)}.svg`;
      const button = element("button", "gallery-image");
      button.type = "button";
      button.setAttribute("aria-label", `View ${project.title} image ${imageNumber(project, index)} full size`);
      button.dataset.imagePath = source;
      const image = element("img");
      image.width = 640;
      image.height = 400;
      image.loading = "lazy";
      image.decoding = "async";
      image.alt = imageAlt(project, index);
      const caption = element("span", "gallery-caption", `Image ${imageNumber(project, index)} ↗`);
      function unavailable() {
        button.disabled = true;
        caption.textContent = "Image unavailable";
        image.alt = `${project.title} — image unavailable`;
      }
      image.addEventListener("error", () => {
        unavailable();
        if (image.getAttribute("src") !== fallback) image.src = fallback;
        else image.hidden = true;
      });
      image.src = source || fallback;
      if (!source) unavailable();
      button.addEventListener("click", () => openImage(source, imageAlt(project, index), button));
      button.append(image, caption);
      galleryGrid.append(button);
    }
    gallery.append(galleryGrid);
    return gallery;
  }

  function openDetails(project, button) {
    const version = ++detailsVersion;
    currentProject = project;
    pendingGalleryRefresh = null;
    lastDetailButton = button;
    dialogContent.replaceChildren();
    const heading = element("div", "dialog-heading");
    heading.append(element("p", "eyebrow", categories(project).join(" / ") || "Project"));
    const title = element("h2", "dialog-title", project.title);
    title.id = "dialog-title";
    heading.append(title);
    if (project.type) heading.append(element("p", "dialog-type", project.type));
    dialogContent.append(heading, projectMedia(project, true));
    const text = element("div", "dialog-body");
    const about = element("section", "detail-section");
    about.append(element("h3", "dialog-section-label", "About"), element("p", "dialog-description", project.description));
    text.append(about);
    if (project.role || project.period) {
      const role = element("section", "detail-section");
      role.append(element("h3", "dialog-section-label", "Role"));
      if (project.role) role.append(element("p", "dialog-role", project.role));
      if (project.period) {
        const metadata = element("dl", "project-metadata");
        const item = element("div");
        item.append(element("dt", "", "Development period"), element("dd", "", project.period));
        metadata.append(item);
        role.append(metadata);
      }
      text.append(role);
    }
    if (Array.isArray(project.technicalChallenges) && project.technicalChallenges.length) {
      const detailSection = element("section", "detail-section project-details");
      detailSection.append(element("h3", "dialog-section-label", "Technical Challenges"));
      const challenges = element("ul", "challenge-list");
      for (const challenge of project.technicalChallenges) challenges.append(element("li", "", challenge));
      detailSection.append(challenges);
      text.append(detailSection);
    }
    const technologies = element("section", "detail-section");
    technologies.append(element("h3", "dialog-section-label", "Technologies"), tags(project.technologies));
    text.append(technologies);
    const links = projectLinks(project, "dialog-links");
    if (links.childElementCount) {
      const linkSection = element("section", "detail-section");
      linkSection.append(element("h3", "dialog-section-label", "Links"), links);
      text.append(linkSection);
    }
    const gallerySlot = element("div", "gallery-slot");
    fillGallery(project, gallerySlot);
    text.append(gallerySlot);
    dialogContent.append(text);
    dialog.showModal();
    document.body.classList.add("dialog-open");
    dialog.querySelector(".dialog-close").focus();
    if (imageLoader && project.imageFolder) {
      gallerySlot.setAttribute("aria-busy", "true");
      const status = element("p", "sr-only", "Checking project images.");
      status.setAttribute("role", "status");
      gallerySlot.append(status);
      imageLoader.findProjectImages(project.imageFolder, project.images).then(images => {
        applyFoundImages(project, images);
        const refresh = () => {
          if (dialog.open && version === detailsVersion && currentProject === project) fillGallery(project, gallerySlot);
        };
        if (dialog.open && version === detailsVersion && currentProject === project && imageDialog.open) pendingGalleryRefresh = refresh;
        else refresh();
      });
    }
  }

  function projectCard(project, index) {
    const card = element("article", "project-card");
    card.dataset.projectId = project.id;
    card.append(projectMedia(project));
    const body = element("div", "project-card-body");
    const top = element("div", "card-topline");
    top.append(element("p", "card-category", categories(project).join(" / ") || "Project"), element("span", "card-index", String(index + 1).padStart(2, "0")));
    body.append(top, element("h3", "", project.title));
    if (project.type) body.append(element("p", "card-type", project.type));
    body.append(element("p", "card-description", project.description), tags(project.technologies));
    const metadata = element("div", "card-metadata");
    if (project.role) metadata.append(element("span", "role-label", "Role"), element("span", "card-role", project.role));
    if (project.period) metadata.append(element("span", "", project.period));
    if (metadata.childElementCount) body.append(metadata);
    const actions = projectLinks(project, "card-actions");
    const button = element("button", "detail-button");
    button.type = "button";
    button.append(element("span", "", "View Details"), element("span", "", "↗"));
    button.setAttribute("aria-label", `View ${project.title} details`);
    button.setAttribute("aria-haspopup", "dialog");
    button.addEventListener("click", () => openDetails(project, button));
    actions.prepend(button);
    body.append(actions);
    card.append(body);
    return card;
  }

  function renderProjects(category = "All") {
    coverObserver?.disconnect();
    grid.replaceChildren();
    const visible = projects.filter(project => category === "All" || categories(project).includes(category));
    for (const project of visible) grid.append(projectCard(project, projects.indexOf(project)));
    if (coverObserver) for (const card of grid.children) coverObserver.observe(card);
    else for (const project of visible) ensureCover(project);
    document.querySelector("#project-count").textContent = `${String(visible.length).padStart(2, "0")} projects`;
    document.querySelector("#empty-state").hidden = visible.length > 0;
    for (const button of filters.children) button.setAttribute("aria-pressed", String(button.dataset.category === category));
  }

  function initializeFilters() {
    const available = ["All", ...new Set([...filterCategories, ...projects.flatMap(categories)])];
    for (const category of available) {
      const button = element("button", "filter-button", category);
      button.type = "button";
      button.dataset.category = category;
      button.setAttribute("aria-pressed", String(category === "All"));
      button.addEventListener("click", () => renderProjects(category));
      filters.append(button);
    }
  }

  function initializeProfile() {
    if (config.about) document.querySelector("#about-text").textContent = config.about;
    const github = safeUrl(config.github);
    if (github) {
      for (const anchor of document.querySelectorAll("[data-profile-github]")) anchor.href = github;
      const url = new URL(github, window.location.href);
      document.querySelector("#contact-github-label").textContent = url.hostname + url.pathname.replace(/\/$/, "");
    }
    const discord = safeUrl(config.discord);
    if (discord) for (const anchor of document.querySelectorAll("[data-profile-discord]")) anchor.href = discord;
    const profileImage = safeUrl(config.profileImage);
    for (const avatar of document.querySelectorAll("[data-profile-image]")) {
      avatar.addEventListener("error", () => {
        const fallback = "./assets/profile/placeholder.svg";
        if (avatar.getAttribute("src") !== fallback) avatar.src = fallback;
        else {
          avatar.hidden = true;
          avatar.parentElement.classList.add("profile-fallback");
        }
      });
      if (profileImage) avatar.src = profileImage;
    }
    if (typeof config.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email.trim())) {
      const email = config.email.trim();
      const anchor = document.querySelector("#contact-email");
      anchor.href = `mailto:${email}`;
      for (const profileEmail of document.querySelectorAll("[data-profile-email]")) profileEmail.href = `mailto:${email}`;
      document.querySelector("#email-label").textContent = email;
      anchor.hidden = false;
    }
    const focusList = document.querySelector("#focus-list");
    for (const focus of config.focuses || []) {
      const item = element("div", "focus-item");
      item.append(element("span", "focus-number", focus.number));
      const copy = element("div");
      copy.append(element("h3", "", focus.title), element("p", "", focus.description));
      item.append(copy);
      focusList.append(item);
    }
    const skills = document.querySelector("#skills-groups");
    for (const group of config.skillGroups || []) {
      const row = element("div", "skill-group");
      row.append(element("h3", "skill-group-label", group.title));
      const list = element("ul", "skill-list");
      for (const skill of group.skills || []) list.append(element("li", "skill-chip", skill));
      row.append(list);
      skills.append(row);
    }
    document.querySelector("#year").textContent = new Date().getFullYear();
  }

  function initializeNavigation() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector("#primary-nav");
    const mobile = window.matchMedia("(max-width: 700px)");
    toggle.hidden = false;
    document.documentElement.classList.add("js");
    function closeMenu() {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    }
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("is-open", !expanded);
    });
    nav.addEventListener("click", event => { if (event.target.closest("a")) closeMenu(); });
    document.addEventListener("click", event => { if (!event.target.closest(".header-inner")) closeMenu(); });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        closeMenu();
        toggle.focus();
      }
    });
    nav.addEventListener("focusout", event => {
      if (mobile.matches && !nav.contains(event.relatedTarget) && event.relatedTarget !== toggle) closeMenu();
    });
    mobile.addEventListener("change", closeMenu);
  }

  function finishClose() {
    // A queued native close event must not clear a newly opened project.
    if (dialog.open || !dialogContent.childElementCount) return;
    detailsVersion++;
    currentProject = null;
    pendingGalleryRefresh = null;
    document.body.classList.remove("dialog-open");
    dialogContent.replaceChildren();
    if (lastDetailButton?.isConnected) lastDetailButton.focus();
  }

  function closeDetails() {
    if (!dialog.open) return;
    closeImage();
    dialog.close();
    // Dispose media and restore focus immediately, including Escape dismissal.
    finishClose();
  }

  dialog.querySelector(".dialog-close").addEventListener("click", closeDetails);
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    closeDetails();
  });
  function trapFocus(event, surface) {
    if (event.key !== "Tab") return;
    const controls = [...surface.querySelectorAll('a[href], button:not(:disabled), [tabindex="0"]')].filter(node => node.getClientRects().length);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  dialog.addEventListener("keydown", event => trapFocus(event, dialog));
  dialog.addEventListener("click", event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeDetails();
  });
  dialog.addEventListener("close", finishClose);

  function finishImageClose() {
    if (imageDialog.open || !lightboxContent.childElementCount) return;
    lightboxContent.replaceChildren();
    if (lastGalleryButton?.isConnected) lastGalleryButton.focus();
    const refresh = pendingGalleryRefresh;
    pendingGalleryRefresh = null;
    if (refresh) refresh();
  }

  function closeImage() {
    if (!imageDialog.open) return;
    imageDialog.close();
    finishImageClose();
  }

  imageDialog.querySelector(".dialog-close").addEventListener("click", closeImage);
  imageDialog.addEventListener("cancel", event => { event.preventDefault(); closeImage(); });
  imageDialog.addEventListener("keydown", event => trapFocus(event, imageDialog));
  imageDialog.addEventListener("click", event => {
    const bounds = imageDialog.getBoundingClientRect();
    if (event.target === imageDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeImage();
  });
  imageDialog.addEventListener("close", finishImageClose);

  initializeProfile();
  initializeFilters();
  renderProjects();
  initializeNavigation();
})();
