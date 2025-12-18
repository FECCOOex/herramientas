async function loadFooter() {
  const mount = document.getElementById("site-footer");
  if (!mount) return;

  try {
    const res = await fetch("assets/footer.html", { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar assets/footer.html");
    mount.innerHTML = await res.text();

    const y = document.getElementById("anio-footer");
    if (y) y.textContent = new Date().getFullYear();
  } catch (e) {
    console.error(e);
  }
}
loadFooter();
