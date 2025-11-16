import { fifo, hrrn, sjf, roundRobin, prioridad } from './scheduler.js';

export function recomendarAlgoritmo(procesos) {
  if (procesos.length === 0) 
    return { algoritmo: null, razon: 'No hay procesos para analizar.' };

  const algoritmos = [
    { nombre: 'FIFO', funcion: fifo },
    { nombre: 'HRRN', funcion: hrrn },
    { nombre: 'SJF', funcion: sjf },
    { nombre: 'Prioridad', funcion: prioridad },
    { nombre: 'Round Robin', funcion: (p) => roundRobin(p, 2) } 
  ];

  let mejorAlg = null;
  let mejorScore = Infinity;

  algoritmos.forEach(({ nombre, funcion }) => {
    const resultados = funcion([...procesos]);
    const { tep, tpr } = calcularTEP_TPR(resultados);

    const score = 0.5 * tep + 0.5 * tpr;

    if (score < mejorScore) {
      mejorScore = score;
      mejorAlg = { nombre, tep, tpr };
    }
  });

  const razon = `La IA recomienda ${mejorAlg.nombre} porque combina un TEP de ${mejorAlg.tep} y un TPR de ${mejorAlg.tpr}, logrando la mejor eficiencia general.`;

  return { algoritmo: mejorAlg.nombre, razon };
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
    tep: totalTE / resultados.length,
    tpr: totalTR / resultados.length
  };
}


