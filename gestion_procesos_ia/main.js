import { fifo, hrrn, sjf, roundRobin, prioridad } from './js/scheduler.js';
import { recomendarAlgoritmo } from './js/heuristics.js';

const form = document.getElementById('form-procesos');
const tbody = document.getElementById('tbody');
const ejecutarBtn = document.getElementById('ejecutar');
const tablaResultadosBody = document.getElementById('tabla-resultados-body');
const iaOpinion = document.getElementById('ia-opinion');

let procesos = [];

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const id = document.getElementById('id').value.trim();
  const llegadaVal = document.getElementById('llegada').value.trim();
  const duracionVal = document.getElementById('duracion').value.trim();
  const prioridadVal = document.getElementById('prioridad').value.trim();
  const quantumVal = document.getElementById('quantum').value.trim();

  if (!id || !llegadaVal || !duracionVal) {
    alert("Los campos ID, Tiempo de llegada y Duración son obligatorios.");
    return;
  }

  if (procesos.some(p => p.id === id)) {
    alert(`El ID "${id}" ya existe. Usa un ID diferente.`);
    return;
  }

  const llegada = Number(llegadaVal);
  const duracion = Number(duracionVal);
  if (isNaN(llegada) || llegada < 0 || isNaN(duracion) || duracion <= 0) {
    alert("Tiempo de llegada y duración deben ser números válidos y positivos.");
    return;
  }

  let prioridad = prioridadVal === "" ? "-" : Number(prioridadVal);
  if (prioridad !== "-" && (isNaN(prioridad) || prioridad <= 0)) {
    alert("La prioridad debe ser un número positivo o dejarse vacía.");
    return;
  }

  let quantum = quantumVal === "" ? "-" : Number(quantumVal);
  if (quantum !== "-" && (isNaN(quantum) || quantum <= 0)) {
    alert("El quantum debe ser un número positivo o dejarse vacío.");
    return;
  }

  const proceso = { id, llegada, duracion, prioridad, quantum };
  procesos.push(proceso);
  agregarFilaProceso(proceso);
  form.reset();
  actualizarRecomendacion();
});

function agregarFilaProceso(p) {
  const emptyRow = tbody.querySelector('.empty-state');
  if (emptyRow) emptyRow.remove();

  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td contenteditable="true">${p.id}</td>
    <td contenteditable="true">${p.llegada}</td>
    <td contenteditable="true">${p.duracion}</td>
    <td contenteditable="true">${p.prioridad === "-" ? "-" : p.prioridad}</td>
    <td><button class="eliminar">Eliminar</button></td>
  `;
  tbody.appendChild(fila);

  fila.addEventListener('input', () => {
    const cells = fila.querySelectorAll('td');
    const nuevoId = cells[0].innerText.trim();

    if (procesos.some(proc => proc !== p && proc.id === nuevoId)) {
      alert(`El ID "${nuevoId}" ya existe.`);
      cells[0].innerText = p.id;
      return;
    }

    p.id = nuevoId;
    p.llegada = Number(cells[1].innerText);
    p.duracion = Number(cells[2].innerText);
    p.prioridad = cells[3].innerText === '-' ? '-' : Number(cells[3].innerText);
    actualizarRecomendacion();
    resetResultados();
  });

  fila.querySelector('.eliminar').addEventListener('click', () => {
    procesos = procesos.filter(proc => proc !== p);
    fila.remove();
    if (procesos.length === 0) {
      const emptyFila = document.createElement('tr');
      emptyFila.classList.add('empty-state');
      emptyFila.innerHTML = `<td colspan="5">No hay procesos agregados. Agrega uno para comenzar.</td>`;
      tbody.appendChild(emptyFila);
    }
    actualizarRecomendacion();
    resetResultados();
  });
}

ejecutarBtn.addEventListener('click', () => {
  if (procesos.length === 0) {
    alert("Agrega al menos un proceso para ejecutar los algoritmos.");
    return;
  }

  tablaResultadosBody.innerHTML = '';

  const algoritmos = [
    { nombre: 'FIFO', funcion: fifo },
    { nombre: 'HRRN', funcion: hrrn },
    { nombre: 'SJF', funcion: sjf },
    { nombre: 'Prioridad', funcion: prioridad },
    { nombre: 'Round Robin', funcion: roundRobin }
  ];

  const todosTienenQuantum = procesos.every(p => p.quantum !== '-' && !isNaN(p.quantum) && p.quantum > 0);
  const todosQuantumIguales = procesos.every(p => p.quantum === procesos[0].quantum);
  const todosTienenPrioridad = procesos.every(p => p.prioridad !== '-' && !isNaN(p.prioridad) && p.prioridad > 0);

  algoritmos.forEach(({ nombre, funcion }) => {
    if (nombre === 'Round Robin') {
      if (!todosTienenQuantum) {
        console.warn(`No se ejecutó ${nombre} porque faltan quantums válidos.`);
        return;
      }
      if (!todosQuantumIguales) {
        alert("Todos los procesos deben tener el mismo quantum para ejecutar Round Robin.");
        console.warn(`No se ejecutó ${nombre} porque los quantums no son iguales.`);
        return;
      }
      const quantum = procesos[0].quantum;
      const resultado = funcion(procesos, quantum);
      mostrarResultados(nombre, resultado);
    } else if (nombre === 'Prioridad') {
      if (!todosTienenPrioridad) {
        console.warn(`No se ejecutó ${nombre} porque hay procesos sin prioridad válida.`);
        return;
      }
      const resultado = funcion(procesos);
      mostrarResultados(nombre, resultado);
    } else {
      const resultado = funcion(procesos);
      mostrarResultados(nombre, resultado);
    }
  });
});

function agregarFilaResultado(nombre, resultados) {
  if (!resultados || resultados.length === 0) return;
  const { tep, tpr } = calcularTEP_TPR(resultados);
  const orden = resultados.map(p => p.id).join(' → ');
  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td><strong>${nombre}</strong></td>
    <td>${orden}</td>
    <td>${tep}</td>
    <td>${tpr}</td>
  `;
  tablaResultadosBody.appendChild(fila);
}

function calcularTEP_TPR(resultados) {
  let totalTE = 0;
  let totalTR = 0;
  resultados.forEach(p => {
    const tr = p.fin - p.llegada;
    const te = tr - p.duracion;
    totalTE += te;
    totalTR += tr;
  });
  return {
    tep: (totalTE / resultados.length).toFixed(2),
    tpr: (totalTR / resultados.length).toFixed(2)
  };
}

function mostrarResultados(nombre, resultado) {
  agregarFilaResultado(nombre, resultado);
}

function resetResultados() {
  tablaResultadosBody.innerHTML = '';
}

function actualizarRecomendacion() {
  if (procesos.length === 0) {
    iaOpinion.innerText = "Agrega procesos y ejecuta la simulación para recibir una recomendación personalizada.";
    return;
  }
  try {
    const { algoritmo, razon } = recomendarAlgoritmo(procesos);
    iaOpinion.innerText = `La IA recomienda usar el algoritmo: ${algoritmo.toUpperCase()}.\nRazón: ${razon}`;
  } catch {
    iaOpinion.innerText = "No se pudo calcular la recomendación de la IA.";
  }
}
