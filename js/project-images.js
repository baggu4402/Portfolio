(() => {
  "use strict";

  const extensions = ["webp", "png", "jpg", "jpeg", "gif"];
  const limits = Object.freeze({ maxNumber: 30, consecutiveMissing: 3, maxRequests: 60, timeoutMs: 8000 });
  const probes = new Map();
  const folders = new Map();

  function folderState(projectFolder, knownImages) {
    if (typeof projectFolder !== "string" || !projectFolder.trim()) return null;
    const path = projectFolder.trim().replace(/\/+$/, "");
    let url;
    try {
      url = new URL(`${path}/`, window.location.href);
      if (!["http:", "https:", "file:"].includes(url.protocol)) return null;
    } catch { return null; }
    if (!folders.has(url.href)) {
      const known = new Map();
      for (const source of Array.isArray(knownImages) ? knownImages : []) {
        try {
          const imageUrl = new URL(source, window.location.href);
          const filename = imageUrl.pathname.split("/").pop();
          const match = /^(\d{2})\.(webp|png|jpg|jpeg|gif)$/i.exec(filename);
          if (match && new URL("./", imageUrl).href === url.href) known.set(Number(match[1]), source);
        } catch { /* Ignore malformed optional paths. */ }
      }
      folders.set(url.href, { path, known, preferred: "webp", requests: 0, cover: null, images: null });
    }
    return folders.get(url.href);
  }

  function probeImage(source, state) {
    const key = new URL(source, window.location.href).href;
    if (probes.has(key)) return probes.get(key);
    if (state.requests >= limits.maxRequests) return Promise.resolve(false);
    state.requests++;
    const promise = new Promise(resolve => {
      const image = new Image();
      let timer;
      let complete = false;
      function finish(found) {
        if (complete) return;
        complete = true;
        clearTimeout(timer);
        image.onload = null;
        image.onerror = null;
        resolve(found);
      }
      image.onload = () => finish(image.naturalWidth > 0 && image.naturalHeight > 0);
      image.onerror = () => finish(false);
      timer = setTimeout(() => finish(false), limits.timeoutMs);
      image.src = source;
    });
    probes.set(key, promise);
    return promise;
  }

  async function findNumber(state, number) {
    const stem = String(number).padStart(2, "0");
    const candidates = [...new Set([
      state.known.get(number),
      ...[state.preferred, ...extensions.filter(extension => extension !== state.preferred)].map(extension => `${state.path}/${stem}.${extension}`)
    ].filter(Boolean))];
    for (const source of candidates) {
      if (await probeImage(source, state)) {
        state.preferred = new URL(source, window.location.href).pathname.split(".").pop().toLowerCase();
        return source;
      }
      if (state.requests >= limits.maxRequests) break;
    }
    return null;
  }

  function findProjectCover(projectFolder, knownImages = []) {
    const state = folderState(projectFolder, knownImages);
    if (!state) return Promise.resolve(null);
    if (!state.cover) state.cover = findNumber(state, 1);
    return state.cover;
  }

  function findProjectImages(projectFolder, knownImages = []) {
    const state = folderState(projectFolder, knownImages);
    if (!state) return Promise.resolve([]);
    // Reopening a modal or changing filters reuses the same scan for this page load.
    if (!state.images) state.images = (async () => {
      const images = [];
      const lastKnown = Math.max(0, ...state.known.keys());
      let missing = 0;
      for (let number = 1; number <= limits.maxNumber; number++) {
        const source = await findNumber(state, number);
        if (source) {
          images.push(source);
          missing = 0;
        } else missing++;
        if ((missing >= limits.consecutiveMissing && number >= lastKnown) || state.requests >= limits.maxRequests) break;
      }
      return images;
    })();
    return state.images;
  }

  window.PORTFOLIO_IMAGE_LOADER = Object.freeze({ findProjectCover, findProjectImages, limits });
})();
