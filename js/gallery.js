document.addEventListener("DOMContentLoaded", () => {
  const carouselEl = document.getElementById("gallery-carousel");
  const thumbsEl = document.getElementById("carousel-thumbs");
  const lightbox = document.getElementById("lightbox");
  const showcase = document.querySelector(".gallery-showcase");

  if (!carouselEl || !thumbsEl || !lightbox) return;

  const images = (window.GALLERY_IMAGES ?? []).map((item) =>
    typeof item === "string" ? item : item.src
  );

  if (!images.length) {
    if (showcase) {
      showcase.innerHTML =
        '<p style="text-align:center;color:var(--text-muted);">Galéria képek betöltése sikertelen.</p>';
    }
    return;
  }

  const slideEl = carouselEl.querySelector(".carousel-slide");
  const currentEl = carouselEl.querySelector(".carousel-current");
  const totalEl = carouselEl.querySelector(".carousel-total");
  const progressBar = carouselEl.querySelector(".carousel-progress-bar");
  const prevBtn = carouselEl.querySelector(".carousel-prev");
  const nextBtn = carouselEl.querySelector(".carousel-next");
  const expandBtn = carouselEl.querySelector(".carousel-expand");
  const viewport = carouselEl.querySelector(".carousel-viewport");

  const lightboxImg = lightbox.querySelector("img");
  const lightboxClose = lightbox.querySelector(".lightbox-close");
  const lightboxPrev = lightbox.querySelector(".lightbox-prev");
  const lightboxNext = lightbox.querySelector(".lightbox-next");

  let currentIndex = 0;
  let isAnimating = false;
  let touchStartX = 0;

  totalEl.textContent = String(images.length).padStart(2, "0");

  function pad(n) {
    return String(n + 1).padStart(2, "0");
  }

  function preload(index) {
    [index - 1, index + 1].forEach((i) => {
      if (i < 0 || i >= images.length) return;
      const img = new Image();
      img.src = images[i];
    });
  }

  function scrollThumbIntoView(index) {
    const thumb = thumbsEl.children[index];
    if (!thumb) return;
    thumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  function updateUI(index) {
    currentIndex = index;
    currentEl.textContent = pad(index);
    progressBar.style.width = `${((index + 1) / images.length) * 100}%`;

    thumbsEl.querySelectorAll(".carousel-thumb").forEach((btn, i) => {
      btn.classList.toggle("is-active", i === index);
    });

    scrollThumbIntoView(index);
    preload(index);
  }

  function goTo(index, force = false) {
    if (index < 0 || index >= images.length) return;
    if (!force && index === currentIndex && slideEl.classList.contains("is-active")) return;
    if (isAnimating && !force) return;

    if (force) {
      slideEl.src = images[index];
      slideEl.alt = `Galéria ${index + 1}`;
      slideEl.classList.add("is-active");
      updateUI(index);
      isAnimating = false;
      return;
    }

    isAnimating = true;

    slideEl.classList.remove("is-active");

    setTimeout(() => {
      slideEl.src = images[index];
      slideEl.alt = `Galéria ${index + 1}`;

      if (slideEl.complete) {
        slideEl.classList.add("is-active");
        updateUI(index);
        isAnimating = false;
      } else {
        slideEl.onload = () => {
          slideEl.classList.add("is-active");
          updateUI(index);
          isAnimating = false;
          slideEl.onload = null;
        };
      }
    }, 280);
  }

  function next() {
    goTo((currentIndex + 1) % images.length);
  }

  function prev() {
    goTo((currentIndex - 1 + images.length) % images.length);
  }

  function openLightbox(index) {
    lightboxImg.src = images[index];
    lightboxImg.alt = `Galéria ${index + 1}`;
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    currentIndex = index;
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    goTo(currentIndex, true);
  }

  // Thumbnails
  images.forEach((src, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "carousel-thumb";
    btn.setAttribute("aria-label", `Kép ${index + 1}`);

    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.loading = index < 8 ? "eager" : "lazy";

    btn.appendChild(img);
    btn.addEventListener("click", () => goTo(index));
    thumbsEl.appendChild(btn);
  });

  // Initial slide
  slideEl.src = images[0];
  slideEl.alt = "Galéria 1";
  slideEl.onload = () => slideEl.classList.add("is-active");
  if (slideEl.complete) slideEl.classList.add("is-active");
  updateUI(0);

  prevBtn?.addEventListener("click", prev);
  nextBtn?.addEventListener("click", next);
  expandBtn?.addEventListener("click", () => openLightbox(currentIndex));

  viewport?.addEventListener("click", (e) => {
    if (e.target.closest(".carousel-arrow, .carousel-expand")) return;
    openLightbox(currentIndex);
  });

  viewport?.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  viewport?.addEventListener(
    "touchend",
    (e) => {
      const diff = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(diff) < 50) return;
      if (diff < 0) next();
      else prev();
    },
    { passive: true }
  );

  lightboxClose?.addEventListener("click", closeLightbox);
  lightboxPrev?.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lightboxImg.src = images[currentIndex];
  });
  lightboxNext?.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    lightboxImg.src = images[currentIndex];
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (lightbox.classList.contains("open")) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lightboxPrev?.click();
      if (e.key === "ArrowRight") lightboxNext?.click();
      return;
    }

    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });

  showcase?.classList.add("visible");
});
