document.addEventListener("DOMContentLoaded", () => {
  const heroBg = document.querySelector(".hero-bg");
  if (!heroBg) return;

  const style = heroBg.getAttribute("style") ?? "";
  const match = style.match(/url\(['"]?([^'")]+)['"]?\)/);
  if (!match) return;

  const img = new Image();
  img.onload = () => {
    heroBg.style.backgroundImage = `url('${match[1]}')`;
  };
  img.src = match[1];
});
