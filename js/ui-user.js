/* ========================================
   PANEL DE USUARIO - TAREAS
   ======================================== */

let currentTaskId = null;

async function loadUserTasks() {
  const list = document.getElementById('userTasksList');
  list.innerHTML = '<div class="muted">Cargando tareas...</div>';
  
  const tasks = await AUTH.getTasksByUser(AUTH.currentUser.username);
  list.innerHTML = '';
  
  if (tasks.length === 0) {
    list.innerHTML = '<div class="muted">No tienes tareas asignadas</div>';
    return;
  }
  
  tasks.forEach(task => {
    const div = document.createElement('div');
    let statusClass = '';
    if (task.status === 'in-progress') statusClass = 'in-progress';
    if (task.status === 'completed') statusClass = 'completed';
    
    div.className = 'task-item ' + statusClass;
    div.onclick = () => startTask(task.id);
    
    let statusText = '';
    let statusBadgeClass = '';
    if (task.status === 'pending') {
      statusText = 'Pendiente';
      statusBadgeClass = 'status-pending';
    } else if (task.status === 'in-progress') {
      statusText = 'En Progreso';
      statusBadgeClass = 'status-progress';
    } else {
      statusText = 'Completada';
      statusBadgeClass = 'status-completed';
    }
    
    div.innerHTML = `
      <div>
        <strong>${task.name}</strong>
        <span class="task-status ${statusBadgeClass}">${statusText}</span>
        <div class="muted">Creado: ${new Date(task.createdAt).toLocaleString()}</div>
        ${task.status === 'completed' ? 
          '<div class="muted">Haz clic para ver el resultado</div>' : 
          `<div class="muted">Haz clic para ${task.status === 'pending' ? 'comenzar' : 'continuar'}</div>`}
      </div>
    `;
    list.appendChild(div);
  });
}

async function startTask(taskId) {
  currentTaskId = taskId;
  const task = await AUTH.getTaskById(taskId);
  
  if (!task) {
    alert('Error al cargar la tarea');
    return;
  }
  
  // Si está completada, mostrar resultado
  if (task.status === 'completed' && task.result) {
    showTaskResult(task);
    return;
  }
  
  // Marcar como en progreso y registrar quién la toma
  if (task.status === 'pending') {
    await AUTH.takeTask(taskId, AUTH.currentUser.username);
    await AUTH.updateTaskStatus(taskId, 'in-progress');
  } else if (task.status === 'in-progress' && !task.takenBy) {
    // Si ya está en progreso pero no tiene takenBy, registrar este usuario
    await AUTH.takeTask(taskId, AUTH.currentUser.username);
  }
  
  // Cargar datos de la tarea
  document.getElementById('scanTitle').textContent = task.name;
  document.getElementById('taskInfo').innerHTML = `
    <strong>Tarea:</strong> ${task.name}<br>
    <strong>Creado:</strong> ${new Date(task.createdAt).toLocaleString()}<br>
    <strong>Estado:</strong> En Progreso
  `;
  
  // Parsear tabla y cargar en el estado
  const {bloques, itemsExpandidos} = parseTabla(task.tableData);
  state.bloques = bloques;
  state.itemsExpandidos = itemsExpandidos;
  state.seriesRaw = [];
  state.idxB = 0;
  
  // Mostrar pantalla de escaneo
  mainScreen.classList.add('hidden');
  scanScreen.classList.remove('hidden');
  
  // Mostrar opciones de modo
  document.getElementById('modoCard').style.display = 'grid';
}

function showTaskResult(task) {
  document.getElementById('scanTitle').textContent = `${task.name} - Completada`;
  document.getElementById('taskInfo').innerHTML = `
    <strong>Tarea:</strong> ${task.name}<br>
    <strong>Completado:</strong> ${new Date(task.completedAt).toLocaleString()}<br>
    <strong>Estado:</strong> Completada
  `;
  
  mainScreen.classList.add('hidden');
  scanScreen.classList.remove('hidden');
  
  // Ocultar opciones de modo
  document.getElementById('modoCard').style.display = 'none';
  document.getElementById('guiadoCard').classList.add('hidden');
  document.getElementById('porModeloCard').classList.add('hidden');
  
  // Mostrar resultado
  resultadoCard.classList.remove('hidden');
  salida.value = task.result;
}

document.getElementById('btnBackToTasks').onclick = async () => {
  scanScreen.classList.add('hidden');
  mainScreen.classList.remove('hidden');
  
  // Limpiar interfaz de escaneo
  document.getElementById('modoCard').style.display = 'none';
  document.getElementById('guiadoCard').classList.add('hidden');
  document.getElementById('porModeloCard').classList.add('hidden');
  resultadoCard.classList.add('hidden');
  
  await loadUserTasks();
};
