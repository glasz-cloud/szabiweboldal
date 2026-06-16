document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".gallery-grid");
  const lightbox = document.getElementById("lightbox");
  if (!grid || !lightbox) return;

  const images = window.GALLERY_IMAGES ?? [];
  if (!images.length) {
    grid.innerHTML =
      '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;">Galéria képek betöltése sikertelen.</p>';
    return;
  }

  const lightboxImg = lightbox.querySelector("img");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");

  const sources = images.map(({ src }) => src);
  let currentIndex = 0;

  images.forEach(({ src, span }, index) => {
    const item = document.createElement("div");
    item.className = `gallery-item ${span}`;
    item.dataset.src = src;

    const placeholder = document.createElement("div");
    placeholder.className = "gallery-placeholder";
    placeholder.textContent = String(index + 1).padStart(2, "0");

    const img = document.createElement("img");
    img.alt = `Galéria ${index + 1}`;
    img.loading = index < 6 ? "eager" : "lazy";
    img.decoding = "async";

    img.addEventListener("load", () => placeholder.remove());
    img.addEventListener("error", () => {
      placeholder.textContent = `Hiba: ${String(index + 1).padStart(2, "0")}`;
    });

    item.addEventListener("click", () => {
      if (!img.complete || img.naturalWidth === 0) return;
      const idx = sources.indexOf(src);
      if (idx !== -1) openLightbox(idx);
    });

    item.appendChild(placeholder);
    item.appendChild(img);
    grid.appendChild(item);

    img.src = src;
  });

  grid.classList.add("visible");

  function openLightbox(index) {
    if (!sources.length) return;
    currentIndex = index;
    lightboxImg.src = sources[currentIndex];
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + sources.length) % sources.length;
    lightboxImg.src = sources[currentIndex];
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % sources.length;
    lightboxImg.src = sources[currentIndex];
  }

  closeBtn?.addEventListener("click", closeLightbox);
  prevBtn?.addEventListener("click", showPrev);
  nextBtn?.addEventListener("click", showNext);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "ArrowRight") showNext();
  });
});
