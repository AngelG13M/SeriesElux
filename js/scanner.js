/* ========================================
   MODO DE ESCANEO - ESTADO Y LÓGICA
   ======================================== */

const state = {
  bloques: [],
  itemsExpandidos: [],
  seriesRaw: [],
  salidaLineas: [],
  idxB: 0,
  iEnBloque: 1,
  ordenLibre: [],
  bloquesReordenados: [],
  modelosCompletados: [],
  seriesPorModelo: {},
  modoLibreActivo: false,
  serieSeleccionada: null
};

/* ========================================
   DOM - REFERENCIAS
   ======================================== */

const modoCard = document.getElementById('modoCard');
const modoS = document.getElementById('modoS');
const modoLibre = document.getElementById('modoLibre');
const modoN = document.getElementById('modoN');

const libreCard = document.getElementById('libreCard');
const modelosDisponibles = document.getElementById('modelosDisponibles');
const btnVolverModoLibre = document.getElementById('btnVolverModoLibre');
const btnVolverModelosLibre = document.getElementById('btnVolverModelosLibre');

const guiadoCard = document.getElementById('guiadoCard');
const progTop = document.getElementById('progTop');
const guiadoInfo = document.getElementById('guiadoInfo');
const serieInput = document.getElementById('serieInput');
const btnBack = document.getElementById('btnBack');
const previewS = document.getElementById('previewS');

const porModeloCard = document.getElementById('porModeloCard');
const modelBlocks = document.getElementById('modelBlocks');
const btnProcesarM = document.getElementById('btnProcesarM');
const btnVolverModo = document.getElementById('btnVolverModo');
const totBloques = document.getElementById('totBloques');

const resultadoCard = document.getElementById('resultadoCard');
const salida = document.getElementById('salida');
const btnDescargar = document.getElementById('btnDescargar');
const btnCopiar = document.getElementById('btnCopiar');

/* ========================================
   EVENTOS - SELECCIÓN DE MODO
   ======================================== */

modoS.onclick = () => {
  state.modoLibreActivo = false;
  modoCard.style.display = 'none';
  guiadoCard.classList.remove('hidden');
  resultadoCard.classList.add('hidden');
  porModeloCard.classList.add('hidden');
  libreCard.classList.add('hidden');
  
  // Cargar progreso guardado si existe
  cargarProgresoTarea();
  
  // Si no hay progreso guardado, inicializar
  if (state.seriesRaw.length === 0) {
    state.idxB = 0;
    state.iEnBloque = 1;
  }
  
  document.getElementById('currentModeLabel').textContent = 'Series Al orden del picking';
  
  // Cambiar texto del botón según el modo
  btnVolverModelosLibre.textContent = '← Volver a Mis Tareas';
  
  actualizarGuiadoUI();
  serieInput.focus();
};

modoLibre.onclick = () => {
  state.modoLibreActivo = true;
  mostrarSeleccionOrden();
};

modoN.onclick = () => {
  modoCard.style.display = 'none';
  state.salidaLineas = state.itemsExpandidos.map(m => m);
  mostrarResultado();
};

/* ========================================
   MODO S - GUIADO
   ======================================== */

serieInput.addEventListener('keydown', e => {
  if (e.key === "Enter") {
    e.preventDefault();
    const v = serieInput.value.trim();
    if (!v) return;
    if (v.toLowerCase() === "b") {
      // Usar deshacerUnaLibre si estamos en modo libre
      if (state.modoLibreActivo) {
        deshacerUnaLibre();
      } else {
        deshacerUna();
      }
      return;
    }
    agregarSerieGuiada(v);
  }
});

btnBack.onclick = () => {
  // Usar deshacerUnaLibre si estamos en modo libre
  if (state.modoLibreActivo) {
    deshacerUnaLibre();
  } else {
    deshacerUna();
  }
};

function actualizarGuiadoUI() {
  const totalBloques = state.bloques.length;
  const bloque = state.bloques[state.idxB];
  const cant = bloque.cantidad;
  progTop.textContent = `Bloque ${state.idxB + 1}/${totalBloques}`;
  guiadoInfo.textContent = `${bloque.modelo} ${state.iEnBloque}/${cant}`;
  
  // Mostrar últimas 20 series como elementos clicables
  const ultimasSeries = state.seriesRaw.slice(-20);
  
  if (ultimasSeries.length === 0) {
    previewS.innerHTML = '<div style="color: var(--muted);">Aún no has escaneado ninguna serie...</div>';
  } else {
    previewS.innerHTML = '';
    ultimasSeries.forEach((serie, i) => {
      const realIndex = state.seriesRaw.length - ultimasSeries.length + i;
      const div = document.createElement('div');
      div.textContent = serie;
      div.style.cssText = 'padding: 8px 12px; margin: 2px 0; cursor: pointer; border-radius: 4px; transition: all 0.2s; border: 1px solid transparent;';
      div.dataset.serieIndex = realIndex;
      
      // Si esta serie está seleccionada
      if (state.serieSeleccionada === realIndex) {
        div.style.background = '#2a4a80';
        div.style.color = '#fff';
        div.style.borderColor = '#4da3ff';
      } else {
        div.style.background = '#1a2336';
      }
      
      // Click para seleccionar/deseleccionar
      div.addEventListener('click', function(e) {
        e.stopPropagation();
        if (state.serieSeleccionada === realIndex) {
          state.serieSeleccionada = null;
        } else {
          state.serieSeleccionada = realIndex;
        }
        actualizarGuiadoUI();
      });
      
      // Hover effect
      div.addEventListener('mouseenter', function() {
        if (state.serieSeleccionada !== realIndex) {
          div.style.background = '#253654';
          div.style.borderColor = '#2a4a80';
        }
      });
      div.addEventListener('mouseleave', function() {
        if (state.serieSeleccionada !== realIndex) {
          div.style.background = '#1a2336';
          div.style.borderColor = 'transparent';
        }
      });
      
      previewS.appendChild(div);
    });
  }
  
  serieInput.value = "";
}

function agregarSerieGuiada(v) {
  // Si estamos en modo libre, usar la función especial
  if (state.modoLibreActivo) {
    agregarSerieGuiadaLibre(v);
    return;
  }
  
  state.seriesRaw.push(v);
  state.serieSeleccionada = null; // Limpiar selección al agregar nueva serie
  
  // Guardar progreso en Modo S
  guardarProgresoTarea();
  
  const bloque = state.bloques[state.idxB];
  
  if (state.iEnBloque < bloque.cantidad) {
    state.iEnBloque++;
    actualizarGuiadoUI();
    return;
  }
  
  state.idxB++;
  if (state.idxB < state.bloques.length) {
    state.iEnBloque = 1;
    beep();
    vibrar();
    actualizarGuiadoUI();
    return;
  }
  
  finalizarConSeries(state.seriesRaw);
}

function deshacerUna() {
  // Si estamos en modo libre, usar la función especial
  if (state.modoLibreActivo) {
    deshacerUnaLibre();
    return;
  }
  
  if (!state.seriesRaw.length) return;
  
  // Si hay una serie seleccionada, eliminar esa
  if (state.serieSeleccionada !== null && state.serieSeleccionada !== undefined) {
    const indexToRemove = state.serieSeleccionada;
    if (indexToRemove >= 0 && indexToRemove < state.seriesRaw.length) {
      state.seriesRaw.splice(indexToRemove, 1);
      state.serieSeleccionada = null; // Limpiar selección
      
      // Recalcular posición en el bloque
      let totalAntes = 0;
      for (let i = 0; i < state.bloques.length; i++) {
        const cantBloque = state.bloques[i].cantidad;
        if (totalAntes + cantBloque > state.seriesRaw.length) {
          state.idxB = i;
          state.iEnBloque = state.seriesRaw.length - totalAntes + 1;
          break;
        }
        totalAntes += cantBloque;
      }
      
      // Guardar progreso
      guardarProgresoTarea();
      
      actualizarGuiadoUI();
      serieInput.focus();
      return;
    }
  }
  
  // Si no hay selección, quitar la última serie
  state.seriesRaw.pop();
  
  if (state.iEnBloque > 1) {
    state.iEnBloque--;
  } else {
    if (state.idxB > 0) {
      state.idxB--;
      const prev = state.bloques[state.idxB];
      state.iEnBloque = prev.cantidad;
    } else {
      state.iEnBloque = 1;
    }
  }
  
  // Guardar progreso
  guardarProgresoTarea();
  
  actualizarGuiadoUI();
  serieInput.focus();
}

/* ========================================
   MODO M - POR BLOQUES
   ======================================== */

function buildPorBloques() {
  guiadoCard.classList.add('hidden');
  resultadoCard.classList.add('hidden');
  porModeloCard.classList.remove('hidden');
  modelBlocks.innerHTML = '';
  totBloques.textContent = `${state.bloques.length} bloques`;

  state.bloques.forEach((b, idx) => {
    const block = document.createElement('div');
    block.className = 'model-block';
    block.innerHTML = `
      <div>
        <strong>${b.modelo}</strong>
        <span class="badge">bloque ${idx + 1} · cantidad ${b.cantidad}</span>
        <span class="badge" id="prog-${idx}">0/${b.cantidad}</span>
      </div>
      <textarea class="monospace" id="area-${idx}" 
                placeholder="Hasta ${b.cantidad} series (una por línea o separadas por comas)"></textarea>
    `;
    modelBlocks.appendChild(block);
  });

  // Listeners por bloque con tope + beep
  state.bloques.forEach((b, idx) => {
    const area = document.getElementById(`area-${idx}`);
    const prog = document.getElementById(`prog-${idx}`);

    const enforce = () => {
      let parts = splitParts(area.value);
      const over = parts.length > b.cantidad;
      if (over) {
        parts = parts.slice(0, b.cantidad);
        area.value = joined(parts);
        beep();
      }
      prog.textContent = `${countFilled(parts)}/${b.cantidad}`;
    };

    area.addEventListener('input', enforce);
    area.addEventListener('paste', () => {
      setTimeout(enforce, 0);
    });
    enforce();
  });
}

btnProcesarM.onclick = () => {
  const areas = [...modelBlocks.querySelectorAll('textarea')];
  const seriesRaw = [];
  
  for (let i = 0; i < state.bloques.length; i++) {
    const b = state.bloques[i];
    let parts = splitParts(areas[i].value);
    
    while (parts.length < b.cantidad) parts.push("");
    parts = parts.slice(0, b.cantidad);
    seriesRaw.push(...parts);
  }
  
  finalizarConSeries(seriesRaw);
};

btnVolverModo.onclick = () => {
  porModeloCard.classList.add('hidden');
  resultadoCard.classList.add('hidden');
  modoCard.style.display = 'grid';
};

/* ========================================
   FINALIZAR Y MOSTRAR RESULTADO
   ======================================== */

function finalizarConSeries(seriesRaw) {
  const seriesNorm = seriesRaw.map(normalizarAuto);
  state.salidaLineas = state.itemsExpandidos.map((m, idx) => `${m}\t${seriesNorm[idx] || ""}`);
  mostrarResultado();
}

function mostrarResultado() {
  resultadoCard.classList.remove('hidden');
  salida.value = state.salidaLineas.join("\n");
  
  // NO seleccionar ni enfocar el textarea para evitar copiado automático
  salida.blur();
  
  resultadoCard.scrollIntoView({ behavior: 'smooth' });
  
  // Guardar resultado en la tarea si estamos en modo tarea
  if (currentTaskId) {
    AUTH.updateTaskStatus(currentTaskId, 'completed', state.salidaLineas.join("\n"));
    alert('Tarea completada y guardada correctamente');
  }
}

btnDescargar.onclick = () => descargarTexto('resultado.txt', state.salidaLineas.join("\n") + "\n");
btnCopiar.onclick = () => copiarTexto(state.salidaLineas.join("\n"));

/* ========================================
   MODO LIBRE - ESCOGER ORDEN DE MODELOS
   ======================================== */

function mostrarSeleccionOrden() {
  modoCard.style.display = 'none';
  libreCard.classList.remove('hidden');
  guiadoCard.classList.add('hidden');
  porModeloCard.classList.add('hidden');
  resultadoCard.classList.add('hidden');
  
  // Limpiar input y estado al volver
  serieInput.value = '';
  state.seriesRaw = [];
  
  // Cargar progreso guardado si existe
  cargarProgresoTarea();
  
  modelosDisponibles.innerHTML = '';
  
  // Crear botones para cada bloque/modelo
  state.bloques.forEach((bloque, idx) => {
    const btn = document.createElement('button');
    const escaneadas = (state.seriesPorModelo[idx] || []).length;
    const total = bloque.cantidad;
    const completado = escaneadas >= total;
    
    btn.className = completado ? 'btn btn-success' : 'btn';
    btn.textContent = `${bloque.modelo} (${escaneadas}/${total})`;
    btn.dataset.idx = idx;
    
    if (completado) {
      btn.textContent += ' ✓';
    }
    
    // Siempre permitir hacer clic para editar/revisar
    btn.onclick = () => iniciarEscaneoModelo(idx);
    
    modelosDisponibles.appendChild(btn);
  });
  
  actualizarProgresoGeneral();
}

function iniciarEscaneoModelo(idx) {
  const bloque = state.bloques[idx];
  state.idxB = idx;
  state.iEnBloque = 1;
  state.seriesRaw = []; // Limpiar series raw al cambiar de modelo
  state.serieSeleccionada = null; // Limpiar selección de serie
  
  // Inicializar array de series si no existe
  if (!state.seriesPorModelo[idx]) {
    state.seriesPorModelo[idx] = [];
  }
  
  libreCard.classList.add('hidden');
  guiadoCard.classList.remove('hidden');
  
  document.getElementById('currentModeLabel').textContent = `Modo: Escaneo por Modelo - ${bloque.modelo}`;
  
  // Cambiar texto del botón en modo libre
  btnVolverModelosLibre.textContent = '← Volver a Lista de Modelos';
  
  // Limpiar el input antes de actualizar UI
  serieInput.value = '';
  
  actualizarGuiadoUILibre();
  serieInput.focus();
}

function actualizarProgresoGeneral() {
  const totalModelos = state.bloques.length;
  const completados = state.bloques.filter((bloque, idx) => {
    const escaneadas = (state.seriesPorModelo[idx] || []).length;
    return escaneadas >= bloque.cantidad;
  }).length;
  
  const totalUnidades = state.bloques.reduce((sum, b) => sum + b.cantidad, 0);
  const escaneadas = Object.values(state.seriesPorModelo).reduce((sum, arr) => sum + arr.length, 0);
  
  const progresoEl = document.getElementById('progresoModelos');
  if (progresoEl) {
    progresoEl.innerHTML = `
      <strong>Progreso:</strong> ${completados}/${totalModelos} modelos completados | ${escaneadas}/${totalUnidades} unidades escaneadas
    `;
  }
  
  // Mostrar botón de finalizar si todos están completos
  const btnFinalizar = document.getElementById('btnFinalizarTarea');
  if (btnFinalizar) {
    if (completados === totalModelos) {
      btnFinalizar.style.display = 'inline-block';
    } else {
      btnFinalizar.style.display = 'none';
    }
  }
}

btnVolverModoLibre.onclick = () => {
  // Guardar progreso antes de salir
  guardarProgresoTarea();
  
  libreCard.classList.add('hidden');
  guiadoCard.classList.add('hidden');
  
  // Volver a la lista de tareas
  if (typeof loadUserTasks === 'function') {
    scanScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    loadUserTasks();
  } else {
    modoCard.style.display = 'grid';
  }
};

btnVolverModelosLibre.onclick = () => {
  // Guardar progreso antes de salir
  guardarProgresoTarea();
  
  // Limpiar input
  serieInput.value = '';
  
  // Ocultar la vista de escaneo
  guiadoCard.classList.add('hidden');
  
  if (state.modoLibreActivo) {
    // En Modo Libre: volver a la lista de modelos
    mostrarSeleccionOrden();
  } else {
    // En Modo S: volver a la lista de tareas
    if (typeof loadUserTasks === 'function') {
      scanScreen.classList.add('hidden');
      mainScreen.classList.remove('hidden');
      loadUserTasks();
    } else {
      modoCard.style.display = 'grid';
    }
  }
};

const btnFinalizarTareaEl = document.getElementById('btnFinalizarTarea');
if (btnFinalizarTareaEl) {
  btnFinalizarTareaEl.onclick = () => {
    // Construir resultado final - solo modelo y serie
    state.salidaLineas = [];
    
    state.bloques.forEach((bloque, idx) => {
      const series = state.seriesPorModelo[idx] || [];
      const seriesNorm = series.map(normalizarAuto);
      
      for (let i = 0; i < seriesNorm.length; i++) {
        state.salidaLineas.push(`${bloque.modelo}\t${seriesNorm[i]}`);
      }
    });
    
    mostrarResultado();
    
    // Limpiar progreso guardado
    if (currentTaskId) {
      localStorage.removeItem(`taskProgress_${currentTaskId}`);
    }
  };
}

// Modificar la función agregarSerieGuiada para guardar por modelo
function agregarSerieGuiadaLibre(serie) {
  if (!state.bloques[state.idxB]) return;
  
  const bloqueActual = state.bloques[state.idxB];
  const idx = state.idxB;
  
  // Inicializar array si no existe
  if (!state.seriesPorModelo[idx]) {
    state.seriesPorModelo[idx] = [];
  }
  
  const escaneadas = state.seriesPorModelo[idx].length;
  
  // No permitir más series si ya alcanzó el límite
  if (escaneadas >= bloqueActual.cantidad) {
    alert(`No puedes agregar más series. Este modelo ya tiene ${escaneadas}/${bloqueActual.cantidad} escaneadas.`);
    serieInput.value = '';
    return;
  }
  
  // Agregar serie
  state.seriesPorModelo[idx].push(serie);
  state.serieSeleccionada = null; // Limpiar selección al agregar nueva serie
  
  const nuevasEscaneadas = state.seriesPorModelo[idx].length;
  
  // Guardar progreso después de cada serie
  guardarProgresoTarea();
  
  if (nuevasEscaneadas >= bloqueActual.cantidad) {
    // Modelo completado
    serieInput.value = '';
    
    // Verificar si todos los modelos están completos
    const todosCompletos = state.bloques.every((bloque, i) => {
      const escaneadas = (state.seriesPorModelo[i] || []).length;
      return escaneadas >= bloque.cantidad;
    });
    
    if (todosCompletos) {
      // Todos los modelos completos - mostrar resultado final
      alert(`¡Todos los modelos completados! Mostrando resultado final.`);
      guiadoCard.classList.add('hidden');
      libreCard.classList.add('hidden');
      
      // Construir resultado final - solo modelo y serie
      state.salidaLineas = [];
      state.bloques.forEach((bloque, i) => {
        const series = state.seriesPorModelo[i] || [];
        const seriesNorm = series.map(normalizarAuto);
        for (let j = 0; j < seriesNorm.length; j++) {
          state.salidaLineas.push(`${bloque.modelo}\t${seriesNorm[j]}`);
        }
      });
      
      mostrarResultado();
      
      // Limpiar progreso guardado
      if (currentTaskId) {
        localStorage.removeItem(`taskProgress_${currentTaskId}`);
      }
    } else {
      // Aún hay modelos pendientes - volver a la lista
      alert(`Modelo ${bloqueActual.modelo} completado (${nuevasEscaneadas}/${bloqueActual.cantidad}).`);
      guiadoCard.classList.add('hidden');
      mostrarSeleccionOrden();
    }
    return;
  }
  
  // Continuar escaneando este modelo
  state.iEnBloque++;
  serieInput.value = '';
  actualizarGuiadoUILibre();
  serieInput.focus();
}

function actualizarGuiadoUILibre() {
  if (!state.bloques[state.idxB]) return;
  
  const bloqueActual = state.bloques[state.idxB];
  const idx = state.idxB;
  const escaneadas = (state.seriesPorModelo[idx] || []).length;
  const total = bloqueActual.cantidad;
  
  progTop.textContent = `${escaneadas} / ${total}`;
  guiadoInfo.innerHTML = `
    <strong>Modelo:</strong> ${bloqueActual.modelo}<br>
    <strong>Progreso:</strong> ${escaneadas} de ${total} escaneadas
  `;
  
  // Actualizar preview - mostrar series como elementos clicables
  const series = state.seriesPorModelo[idx] || [];
  
  if (series.length === 0) {
    previewS.innerHTML = '<div style="color: var(--muted);">Aún no has escaneado ninguna serie de este modelo...</div>';
  } else {
    // Crear elementos clicables para cada serie
    previewS.innerHTML = '';
    series.forEach((serie, i) => {
      const div = document.createElement('div');
      div.textContent = serie;
      div.style.cssText = 'padding: 8px 12px; margin: 2px 0; cursor: pointer; border-radius: 4px; transition: all 0.2s; border: 1px solid transparent;';
      div.dataset.serieIndex = i;
      
      // Si esta serie está seleccionada
      if (state.serieSeleccionada === i) {
        div.style.background = '#2a4a80';
        div.style.color = '#fff';
        div.style.borderColor = '#4da3ff';
      } else {
        div.style.background = '#1a2336';
      }
      
      // Click para seleccionar/deseleccionar
      div.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('Click en serie', i, 'Actual seleccionada:', state.serieSeleccionada);
        if (state.serieSeleccionada === i) {
          // Deseleccionar si se hace clic en la misma
          state.serieSeleccionada = null;
          console.log('Deseleccionada');
        } else {
          // Seleccionar esta serie
          state.serieSeleccionada = i;
          console.log('Seleccionada:', i);
        }
        actualizarGuiadoUILibre();
      });
      
      // Hover effect
      div.addEventListener('mouseenter', function() {
        if (state.serieSeleccionada !== i) {
          div.style.background = '#253654';
          div.style.borderColor = '#2a4a80';
        }
      });
      div.addEventListener('mouseleave', function() {
        if (state.serieSeleccionada !== i) {
          div.style.background = '#1a2336';
          div.style.borderColor = 'transparent';
        }
      });
      
      previewS.appendChild(div);
    });
  }
}

function deshacerUnaLibre() {
  if (!state.bloques[state.idxB]) return;
  
  const idx = state.idxB;
  const series = state.seriesPorModelo[idx] || [];
  
  console.log('deshacerUnaLibre - Series:', series.length, 'Seleccionada:', state.serieSeleccionada);
  
  if (series.length === 0) return;
  
  // Si hay una serie seleccionada, eliminar esa
  if (state.serieSeleccionada !== null && state.serieSeleccionada !== undefined) {
    const indexToRemove = state.serieSeleccionada;
    console.log('Eliminando serie en índice:', indexToRemove);
    if (indexToRemove >= 0 && indexToRemove < series.length) {
      console.log('Serie eliminada:', series[indexToRemove]);
      series.splice(indexToRemove, 1);
      state.serieSeleccionada = null; // Limpiar selección
      
      // Guardar progreso
      guardarProgresoTarea();
      
      actualizarGuiadoUILibre();
      serieInput.value = '';
      serieInput.focus();
      return;
    }
  }
  
  // Si no hay selección, quitar la última serie
  console.log('Eliminando última serie:', series[series.length - 1]);
  series.pop();
  
  if (state.iEnBloque > 1) state.iEnBloque--;
  
  // Guardar progreso
  guardarProgresoTarea();
  
  actualizarGuiadoUILibre();
  serieInput.value = '';
  serieInput.focus();
}

// Guardar y cargar progreso
function guardarProgresoTarea() {
  if (!currentTaskId) return;
  
  const progreso = {
    seriesPorModelo: state.seriesPorModelo,
    modoLibreActivo: state.modoLibreActivo,
    // Para Modo S
    seriesRaw: state.seriesRaw,
    idxB: state.idxB,
    iEnBloque: state.iEnBloque,
    timestamp: Date.now()
  };
  
  localStorage.setItem(`taskProgress_${currentTaskId}`, JSON.stringify(progreso));
}

function cargarProgresoTarea() {
  if (!currentTaskId) {
    state.seriesPorModelo = {};
    state.seriesRaw = [];
    state.idxB = 0;
    state.iEnBloque = 1;
    return;
  }
  
  const saved = localStorage.getItem(`taskProgress_${currentTaskId}`);
  if (saved) {
    const progreso = JSON.parse(saved);
    state.seriesPorModelo = progreso.seriesPorModelo || {};
    state.modoLibreActivo = progreso.modoLibreActivo || false;
    // Restaurar progreso del Modo S
    state.seriesRaw = progreso.seriesRaw || [];
    state.idxB = progreso.idxB || 0;
    state.iEnBloque = progreso.iEnBloque || 1;
  } else {
    state.seriesPorModelo = {};
    state.seriesRaw = [];
    state.idxB = 0;
    state.iEnBloque = 1;
  }
}

