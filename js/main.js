document.getElementById("year").textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const mainNav = document.querySelector(".main-nav");

navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ---------- Build grids from data files (js/artworks-data.js, js/design-data.js) ----------
function renderGrid(container, items) {
  container.innerHTML = items
    .map((item, i) => {
      const num = String(i + 1).padStart(2, "0");
      const tag = item.client ? `<span class="client-tag">${item.client}</span>` : "";
      const positionStyle = item.position ? ` style="object-position: ${item.position}"` : "";
      return `
        <button class="art-item" type="button" data-index="${i}" aria-label="放大檢視 作品 ${num}">
          <img src="images/${item.file}" alt="${item.alt}" loading="lazy"${positionStyle}>
          ${tag}
          <div class="art-placeholder">
            <span class="placeholder-mark">${num}</span>
            <span class="placeholder-text">作品尚未上傳</span>
          </div>
          <span class="art-overlay"><span class="zoom-icon">＋</span></span>
        </button>`;
    })
    .join("");

  container.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => img.closest(".art-item").classList.add("is-placeholder"));
  });
}

const artworkItems = ARTWORKS.map((entry, i) => ({
  file: entry.file,
  position: entry.position,
  alt: `電繪作品 ${String(i + 1).padStart(2, "0")}`,
}));
const designItems = DESIGN_WORKS.map((d, i) => ({
  file: d.file,
  client: d.client,
  alt: `視覺設計作品 ${String(i + 1).padStart(2, "0")} — ${d.client}`,
}));

renderGrid(document.getElementById("artGrid"), artworkItems);
renderGrid(document.getElementById("designGrid"), designItems);

// ---------- Horizontal gallery arrows (電繪作品) ----------
const artTrack = document.getElementById("artGrid");
const artPrev = document.getElementById("artPrev");
const artNext = document.getElementById("artNext");

function scrollGallery(track, direction) {
  const item = track.querySelector(".art-item");
  const step = item ? item.getBoundingClientRect().width + 20 : 280;
  track.scrollBy({ left: direction * step, behavior: "smooth" });
}

artPrev.addEventListener("click", () => scrollGallery(artTrack, -1));
artNext.addEventListener("click", () => scrollGallery(artTrack, 1));

// ---------- Lightbox (with prev/next navigation within the grid that was opened) ----------
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxPlaceholder = document.getElementById("lightboxPlaceholder");
const lightboxMark = document.getElementById("lightboxMark");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const lightboxCounter = document.getElementById("lightboxCounter");

let activeItems = [];
let activeIndex = 0;

function showLightboxItem(index) {
  const items = activeItems;
  activeIndex = (index + items.length) % items.length;
  const item = items[activeIndex];

  if (item.classList.contains("is-placeholder")) {
    lightboxImg.style.display = "none";
    lightboxPlaceholder.style.display = "flex";
    lightboxMark.textContent = item.querySelector(".placeholder-mark").textContent;
  } else {
    const img = item.querySelector("img");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxImg.style.display = "block";
    lightboxPlaceholder.style.display = "none";
  }

  lightboxCounter.textContent = items.length > 1 ? `${activeIndex + 1} / ${items.length}` : "";
}

function openLightbox(artItem) {
  activeItems = Array.from(artItem.closest(".art-grid").querySelectorAll(".art-item"));
  showLightboxItem(activeItems.indexOf(artItem));

  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.body.addEventListener("click", (e) => {
  const item = e.target.closest(".art-item");
  if (item) openLightbox(item);
});

lightboxClose.addEventListener("click", closeLightbox);
lightboxPrev.addEventListener("click", () => showLightboxItem(activeIndex - 1));
lightboxNext.addEventListener("click", () => showLightboxItem(activeIndex + 1));

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("is-open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showLightboxItem(activeIndex - 1);
  if (e.key === "ArrowRight") showLightboxItem(activeIndex + 1);
});
