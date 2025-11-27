/* ========================================
   UI - AUTENTICACIÓN Y NAVEGACIÓN
   ======================================== */

const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const mainScreen = document.getElementById('mainScreen');
const scanScreen = document.getElementById('scanScreen');

// Login
document.getElementById('btnLogin').onclick = async () => {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  
  const loginBtn = document.getElementById('btnLogin');
  loginBtn.disabled = true;
  loginBtn.textContent = 'Iniciando sesión...';
  
  const success = await AUTH.login(username, password);
  
  if (success) {
    showMainInterface();
  } else {
    document.getElementById('loginInfo').innerHTML = 
      '<span style="color:#ff6b6b">Usuario o contraseña incorrectos</span>';
    loginBtn.disabled = false;
    loginBtn.textContent = 'Iniciar Sesión';
  }
};

// Logout
document.getElementById('btnLogout').onclick = () => {
  AUTH.logout();
  location.reload();
};

document.getElementById('btnLogoutAdmin').onclick = () => {
  AUTH.logout();
  location.reload();
};

document.getElementById('btnLogoutScan').onclick = () => {
  AUTH.logout();
  location.reload();
};

// Mostrar interfaz según rol
async function showMainInterface() {
  loginScreen.classList.add('hidden');
  
  if (AUTH.isAdmin()) {
    adminPanel.classList.remove('hidden');
    document.getElementById('adminUserPill').textContent = 'Admin: ' + AUTH.currentUser.username;
    await loadAdminPanel();
  } else {
    mainScreen.classList.remove('hidden');
    document.getElementById('userPill').textContent = AUTH.currentUser.username;
    await loadUserTasks();
  }
}

/* ========================================
   PANEL DE ADMINISTRACIÓN
   ======================================== */

async function loadAdminPanel() {
  await updateUsersList();
  await updateTaskAssignSelect();
  await updateAdminTasksList();
}

// Agregar usuario
document.getElementById('btnAddUser').onclick = async () => {
  const username = document.getElementById('newUsername').value.trim();
  const password = document.getElementById('newPassword').value;
  
  if (!username || !password) {
    alert('⚠️ Completa todos los campos');
    return;
  }
  
  const btn = document.getElementById('btnAddUser');
  btn.disabled = true;
  btn.textContent = 'Agregando...';
  
  const success = await AUTH.addUser(username, password);
  
  if (success) {
    alert('Usuario agregado correctamente');
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    await updateUsersList();
    await updateTaskAssignSelect();
  } else {
    alert('El usuario ya existe');
  }
  
  btn.disabled = false;
  btn.textContent = 'Agregar Usuario';
};

// Actualizar lista de usuarios
async function updateUsersList() {
  const list = document.getElementById('usersList');
  list.innerHTML = '<div class="muted">Cargando usuarios...</div>';
  
  const users = await AUTH.getAllUsers();
  list.innerHTML = '';
  
  Object.keys(users).forEach(username => {
    const user = users[username];
    const div = document.createElement('div');
    div.className = 'user-item';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <strong>${username}</strong>
          <span class="badge">${user.role === 'admin' ? '👑 Admin' : '👤 Usuario'}</span>
        </div>
        ${username !== 'admin' ? 
          `<button class="btn btn-warn" onclick="deleteUser('${username}')" 
                   style="width:auto;padding:6px 12px">Eliminar</button>` : ''}
      </div>
    `;
    list.appendChild(div);
  });
}

async function deleteUser(username) {
  if (confirm(`¿Eliminar usuario "${username}"?`)) {
    const success = await AUTH.deleteUser(username);
    if (success) {
      await updateUsersList();
      await updateTaskAssignSelect();
      await updateAdminTasksList();
    }
  }
}

// Actualizar selector de usuarios para asignar tareas
async function updateTaskAssignSelect() {
  const select = document.getElementById('taskAssignUser');
  select.innerHTML = '<option value="">Cargando usuarios...</option>';
  
  // Ya no se necesita cargar usuarios
}

// Crear tarea
document.getElementById('btnCreateTask').onclick = async () => {
  const taskName = document.getElementById('taskName').value.trim();
  const tableData = document.getElementById('taskTable').value.trim();
  
  if (!taskName || !tableData) {
    alert('Completa el nombre y la tabla de la tarea');
    return;
  }
  
  const btn = document.getElementById('btnCreateTask');
  btn.disabled = true;
  btn.textContent = 'Creando tarea...';
  
  const task = await AUTH.createTask(taskName, tableData);
  
  if (task) {
    alert('Tarea creada correctamente. Disponible para todos los usuarios.');
    document.getElementById('taskName').value = '';
    document.getElementById('taskTable').value = '';
    await updateAdminTasksList();
  }
  
  btn.disabled = false;
  btn.textContent = 'Crear y Asignar Tarea';
};

// Actualizar lista de tareas (admin)
async function updateAdminTasksList() {
  const list = document.getElementById('tasksList');
  list.innerHTML = '<div class="muted">Cargando tareas...</div>';
  
  const tasks = await AUTH.getAllTasks();
  list.innerHTML = '';
  
  if (tasks.length === 0) {
    list.innerHTML = '<div class="muted">No hay tareas creadas</div>';
    return;
  }
  
  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'task-item ' + (task.status === 'completed' ? 'completed' : '');
    
    let statusText = '';
    let statusClass = '';
    if (task.status === 'pending') {
      statusText = 'Pendiente';
      statusClass = 'status-pending';
    } else if (task.status === 'in-progress') {
      statusText = 'En Progreso';
      statusClass = 'status-progress';
    } else {
      statusText = 'Completada';
      statusClass = 'status-completed';
    }
    
    let userInfo = 'Disponible para todos';
    if (task.status === 'completed' && task.completedBy) {
      userInfo = `Completada por: ${task.completedBy}`;
    } else if (task.status === 'in-progress' && task.takenBy) {
      userInfo = `En progreso por: ${task.takenBy}`;
    } else if (task.takenBy) {
      userInfo = `Tomada por: ${task.takenBy}`;
    }
    
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="flex:1">
          <strong>${task.name}</strong>
          <span class="task-status ${statusClass}">${statusText}</span>
          <div class="muted">${userInfo} · Creado: ${new Date(task.createdAt).toLocaleString()}</div>
          ${task.status === 'completed' ? '<div class="muted" style="color:#51cf66">Haz clic para ver el resultado</div>' : ''}
          ${task.status === 'in-progress' ? '<div class="muted" style="color:#4da3ff">Haz clic para ver el progreso actual</div>' : ''}
        </div>
        <button class="btn btn-warn" onclick="deleteTask('${task.id}')" 
                style="width:auto;padding:6px 12px">Eliminar</button>
      </div>
    `;
    
    // Hacer que la tarea sea clickeable si está completada o en progreso
    if (task.status === 'completed' || task.status === 'in-progress') {
      div.style.cursor = 'pointer';
      div.onclick = (e) => {
        // No mostrar modal si se hace clic en el botón eliminar
        if (e.target.tagName !== 'BUTTON') {
          showTaskResultModal(task);
        }
      };
    }
    
    list.appendChild(div);
  });
}

async function deleteTask(id) {
  if (confirm('¿Eliminar esta tarea?')) {
    const success = await AUTH.deleteTask(id);
    if (success) {
      await updateAdminTasksList();
    }
  }
}

/* ========================================
   MODAL PARA VER RESULTADO
   ======================================== */

async function showTaskResultModal(task) {
  const modal = document.getElementById('taskResultModal');
  
  document.getElementById('modalTaskTitle').textContent = task.name;
  
  let resultadoTexto = '';
  
  if (task.status === 'completed') {
    // Tarea completada - mostrar resultado final
    document.getElementById('modalTaskInfo').innerHTML = `
      <strong>Tarea:</strong> ${task.name}<br>
      <strong>Completada por:</strong> ${task.completedBy || task.takenBy || task.assignedTo || 'Desconocido'}<br>
      <strong>Creado:</strong> ${new Date(task.createdAt).toLocaleString()}<br>
      <strong>Completado:</strong> ${new Date(task.completedAt).toLocaleString()}<br>
      <strong>Estado:</strong> <span style="color:#51cf66">Completada</span>
    `;
    resultadoTexto = task.result || 'Sin resultado';
  } else if (task.status === 'in-progress') {
    // Tarea en progreso - mostrar progreso actual
    const progreso = await obtenerProgresoTarea(task.id);
    
    document.getElementById('modalTaskInfo').innerHTML = `
      <strong>Tarea:</strong> ${task.name}<br>
      <strong>En progreso por:</strong> ${task.takenBy || task.assignedTo || 'Desconocido'}<br>
      <strong>Creado:</strong> ${new Date(task.createdAt).toLocaleString()}<br>
      <strong>Estado:</strong> <span style="color:#4da3ff">En Progreso</span><br>
      <strong>Última actualización:</strong> ${progreso.timestamp ? new Date(progreso.timestamp).toLocaleString() : 'No disponible'}
    `;
    
    if (progreso.seriesPorModelo) {
      // Modo Libre - mostrar series por modelo
      resultadoTexto = generarResultadoProgreso(task.tableData, progreso.seriesPorModelo, progreso.modoLibreActivo);
    } else if (progreso.seriesRaw && progreso.seriesRaw.length > 0) {
      // Modo S - mostrar series escaneadas
      const bloques = parseTabla(task.tableData);
      resultadoTexto = generarResultadoModoS(bloques, progreso.seriesRaw);
    } else {
      resultadoTexto = 'El usuario aún no ha escaneado ninguna serie.';
    }
  }
  
  document.getElementById('modalResultado').value = resultadoTexto;
  
  modal.classList.remove('hidden');
  
  // Configurar botones del modal
  document.getElementById('btnModalDescargar').onclick = () => {
    const filename = task.status === 'completed' ? `${task.name}_resultado.txt` : `${task.name}_progreso.txt`;
    descargarTexto(filename, resultadoTexto || '');
  };
  
  document.getElementById('btnModalCopiar').onclick = () => {
    copiarTexto(resultadoTexto || '');
  };
}

// Obtener progreso guardado desde Firebase
async function obtenerProgresoTarea(taskId) {
  // Primero intentar desde Firebase (sincronizado entre dispositivos)
  if (typeof AUTH !== 'undefined' && AUTH.loadTaskProgress) {
    const progreso = await AUTH.loadTaskProgress(taskId);
    if (progreso) {
      return progreso;
    }
  }
  
  // Fallback a localStorage (respaldo local)
  const saved = localStorage.getItem(`taskProgress_${taskId}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return {};
    }
  }
  return {};
}

// Generar resultado del progreso para Modo Libre
function generarResultadoProgreso(tableData, seriesPorModelo, modoLibreActivo) {
  const bloques = parseTabla(tableData);
  const lineas = [];
  
  bloques.forEach((bloque, idx) => {
    const series = seriesPorModelo[idx] || [];
    if (series.length > 0) {
      const seriesNorm = series.map(s => normalizarAuto(s));
      seriesNorm.forEach(serie => {
        lineas.push(`${bloque.modelo}\t${serie}`);
      });
    }
  });
  
  if (lineas.length === 0) {
    return 'El usuario aún no ha escaneado ninguna serie.';
  }
  
  return lineas.join('\n');
}

// Generar resultado del progreso para Modo S
function generarResultadoModoS(bloques, seriesRaw) {
  const lineas = [];
  const itemsExpandidos = [];
  
  bloques.forEach(b => {
    for (let i = 0; i < b.cantidad; i++) {
      itemsExpandidos.push(b.modelo);
    }
  });
  
  const seriesNorm = seriesRaw.map(s => normalizarAuto(s));
  
  itemsExpandidos.forEach((modelo, idx) => {
    if (idx < seriesNorm.length) {
      lineas.push(`${modelo}\t${seriesNorm[idx]}`);
    }
  });
  
  return lineas.join('\n');
}

document.getElementById('btnCloseModal').onclick = () => {
  document.getElementById('taskResultModal').classList.add('hidden');
};

// Cerrar modal al hacer clic fuera
document.getElementById('taskResultModal').onclick = (e) => {
  if (e.target.id === 'taskResultModal') {
    document.getElementById('taskResultModal').classList.add('hidden');
  }
};
