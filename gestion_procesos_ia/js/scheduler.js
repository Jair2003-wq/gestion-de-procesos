// FIFO
export function fifo(procesos) {
  let lista = [...procesos].sort((a, b) => a.llegada - b.llegada);
  let tiempo = 0;
  return lista.map(p => {
    if (tiempo < p.llegada) tiempo = p.llegada;
    const inicio = tiempo;
    const fin = tiempo + p.duracion;
    tiempo = fin;
    return { ...p, inicio, fin };
  });
}

// HRRN
export function hrrn(procesos) {
  let lista = [...procesos];
  let tiempo = 0;
  let resultado = [];

  while (lista.length > 0) {
    let disponibles = lista.filter(p => p.llegada <= tiempo);
    if (disponibles.length === 0) {
      tiempo = lista[0].llegada;
      disponibles = lista.filter(p => p.llegada <= tiempo);
    }

    let siguiente = disponibles.reduce((max, p) => {
      const tiempoEspera = tiempo - p.llegada;
      const rr = (tiempoEspera + p.duracion) / p.duracion;
      const maxRR = (tiempo - max.llegada + max.duracion) / max.duracion;
      return rr > maxRR ? p : max;
    });

    const inicio = tiempo;
    const fin = tiempo + siguiente.duracion;
    tiempo = fin;

    resultado.push({ ...siguiente, inicio, fin });
    lista = lista.filter(p => p !== siguiente);
  }

  return resultado;
}

// SJF
export function sjf(procesos) {
  let lista = [...procesos];
  let tiempo = 0;
  let resultado = [];
  while (lista.length > 0) {
    let disponibles = lista.filter(p => p.llegada <= tiempo);
    if (disponibles.length === 0) {
      tiempo = lista[0].llegada;
      disponibles = lista.filter(p => p.llegada <= tiempo);
    }
    let siguiente = disponibles.reduce((min, p) => p.duracion < min.duracion ? p : min);
    const inicio = tiempo;
    const fin = tiempo + siguiente.duracion;
    tiempo = fin;
    resultado.push({ ...siguiente, inicio, fin });
    lista = lista.filter(p => p !== siguiente);
  }
  return resultado;
}

// Round Robin
export function roundRobin(procesos, quantum) {
  let lista = [...procesos].sort((a, b) => a.llegada - b.llegada);
  let tiempo = 0;
  let cola = [];
  let resultado = [];

  while (lista.length > 0 || cola.length > 0) {
    while (lista.length > 0 && lista[0].llegada <= tiempo) cola.push(lista.shift());
    if (cola.length === 0) {
      tiempo = lista[0].llegada;
      continue;
    }

    let p = { ...cola.shift() };
    const inicio = p.inicio ?? tiempo;

    if (p.duracion <= quantum) {
      tiempo += p.duracion;
      resultado.push({ ...p, inicio, fin: tiempo });
    } else {
      p.duracion -= quantum;
      tiempo += quantum;
      p.inicio = inicio;
      while (lista.length > 0 && lista[0].llegada <= tiempo) cola.push(lista.shift());
      cola.push(p);
    }
  }

  return resultado;
}

// Prioridad
export function prioridad(procesos) {
  let lista = [...procesos];
  let tiempo = 0;
  let resultado = [];

  while (lista.length > 0) {
    let disponibles = lista.filter(p => p.llegada <= tiempo);
    if (disponibles.length === 0) {
      tiempo = lista[0].llegada;
      disponibles = lista.filter(p => p.llegada <= tiempo);
    }

    let siguiente = disponibles.reduce((min, p) => p.prioridad < min.prioridad ? p : min);
    const inicio = tiempo;
    const fin = tiempo + siguiente.duracion;
    tiempo = fin;

    resultado.push({ ...siguiente, inicio, fin });
    lista = lista.filter(p => p !== siguiente);
  }

  return resultado;
}

