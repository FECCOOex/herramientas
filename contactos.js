// contactos.js
// Carga y muestra contactos desde contactos.csv

const CSV_PATH = "contactos.csv";

const inputBusqueda = document.getElementById("q");
const selectServicio = document.getElementById("servicioFiltro");
const resultados = document.getElementById("resultados");
const estado = document.getElementById("estado");

let contactos = [];

/* ---------------- UTILIDADES ---------------- */

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines.shift().split(",");

  return lines.map(line => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = (values[i] || "").trim();
    });
    return obj;
  });
}

function normalizar(txt) {
  return (txt || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/* ---------------- RENDER ---------------- */

function renderContactos(lista) {
  resultados.innerHTML = "";

  if (lista.length === 0) {
    resultados.innerHTML = `<div class="empty">No hay resultados.</div>`;
    estado.textContent = "0 resultados";
    return;
  }

  lista.forEach(c => {
    const card = document.createElement("div");
    card.className = "contact-card";

    card.innerHTML = `
      <div class="title">${c.servicio || "Servicio sin nombre"}</div>
      ${c.nombre ? `<div class="who">${c.nombre}</div>` : ""}

      <div class="meta">
        ${c.cargo ? `<div><span>Cargo:</span> ${c.cargo}</div>` : ""}
        ${c.telefono ? `<div><span>Teléfono:</span> ${c.telefono}</div>` : ""}
        ${c.email ? `<div><span>Email:</span> <a href="mailto:${c.email}">${c.email}</a></div>` : ""}
      </div>

      ${c.notas ? `<div class="notes">${c.notas}</div>` : ""}
    `;

    resultados.appendChild(card);
  });

  estado.textContent = `${lista.length} resultado(s)`;
}

/* ---------------- FILTROS ---------------- */

function aplicarFiltros() {
  const texto = normalizar(inputBusqueda.value);
  const servicio = selectServicio.value;

  const filtrados = contactos.filter(c => {
    const textoCompleto = normalizar(
      `${c.servicio} ${c.cargo} ${c.nombre} ${c.email} ${c.unidad}`
    );

    const coincideTexto = texto === "" || textoCompleto.includes(texto);
    const coincideServicio = servicio === "" || c.servicio === servicio;

    return coincideTexto && coincideServicio;
  });

  renderContactos(filtrados);
}

/* ---------------- INICIALIZACIÓN ---------------- */

fetch(CSV_PATH)
  .then(r => {
    if (!r.ok) throw new Error("No se pudo cargar contactos.csv");
    return r.text();
  })
  .then(text => {
    contactos = parseCSV(text);

    // Rellenar selector de servicios
    const servicios = [...new Set(contactos.map(c => c.servicio).filter(Boolean))].sort();
    servicios.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      selectServicio.appendChild(opt);
    });

    estado.textContent = `${contactos.length} contacto(s) cargado(s)`;
    renderContactos(contactos);
  })
  .catch(err => {
    console.error(err);
    estado.textContent = "Error al cargar contactos";
  });

inputBusqueda.addEventListener("input", aplicarFiltros);
selectServicio.addEventListener("change", aplicarFiltros);
