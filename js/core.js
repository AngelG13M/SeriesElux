/* ========================================
   NÚCLEO - PROCESAMIENTO DE DATOS
   ======================================== */

function parseTabla(raw) {
  const bloques = [];
  const lineas = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  for (const ln of lineas) {
    let partes = ln.split("\t");
    if (partes.length < 3) {
      partes = ln.split(" ").filter(Boolean);
      if (partes.length < 3) continue;
    }
    
    const modelo = (partes[0] || "").trim();
    let cstr = (partes[2] || "").trim().replace(",", ".");
    const cantidad = Math.trunc(Number(cstr));
    
    if (!modelo || !Number.isFinite(cantidad)) continue;
    bloques.push({ modelo, cantidad });
  }
  
  const itemsExpandidos = [];
  for (const b of bloques) {
    for (let i = 0; i < b.cantidad; i++) {
      itemsExpandidos.push(b.modelo);
    }
  }
  
  return { bloques, itemsExpandidos };
}

/* ========================================
   NORMALIZACIÓN DE SERIES
   ======================================== */

function ultimos8(s) {
  const d = (s.match(/\d/g) || []);
  return d.length ? d.slice(-8).join("") : "";
}

function brasil8Despues2do(s) {
  const d = (s.match(/\d/g) || []);
  if (d.length < 10) return "";
  const slice = d.slice(2, 10).join("");
  return slice.length === 8 ? slice : "";
}

function normalizarAuto(s) {
  if (!s || !s.trim()) return "";
  
  // Si comienza con "EJWL" (al principio), usar últimos 8 dígitos
  if (s.toUpperCase().startsWith("EJWL")) {
    return ultimos8(s);
  }
  
  // Si tiene letras, intentar brasil (8 después del 2do), si no, últimos 8
  const tieneLetra = /[A-Za-z]/.test(s);
  if (tieneLetra) {
    return brasil8Despues2do(s) || ultimos8(s);
  }
  
  // Si no tiene letras, últimos 8
  return ultimos8(s);
}

/* ========================================
   UTILIDADES
   ======================================== */

function descargarTexto(nombre, contenido) {
  const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function copiarTexto(txt) {
  try {
    await navigator.clipboard.writeText(txt);
    alert("Resultado copiado al portapapeles");
  } catch (e) {
    alert("No se pudo copiar: " + e);
  }
}

function beep() {
  try {
    new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=").play();
  } catch {}
}

function vibrar(ms = 150) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

/* ========================================
   HELPERS PARA MODO M
   ======================================== */

function splitParts(text) {
  return text.replace(/\r/g, '\n').split(/[\n,]+/).map(s => s.trim());
}

function joined(parts) {
  return parts.join("\n");
}

function countFilled(parts) {
  return parts.filter(p => p.length > 0).length;
}
