let cinta = [];
let cabeza = 0;
let estado = 'right';
let terminado = false;
let auto = false;

function renderCinta() {
  const div = document.getElementById("tape");
  div.innerHTML = '';
  cinta.forEach((v, i) => {
    const c = document.createElement('div');
    c.className = 'cell' + (i === cabeza ? ' head' : '');
    c.textContent = v;
    div.appendChild(c);
  });
}

function log(mensaje) {
  const log = document.getElementById('log');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.textContent = mensaje;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

function iniciar() {
  const input = document.getElementById("input").value;
  const log = document.getElementById('log');
  log.innerHTML = "<strong>Pasos de ejecución:</strong>";
  const inputArr = input.split('');
  cinta = ['#', ...inputArr, '#'];
  cabeza = 1;
  estado = 'right';
  terminado = false;
  auto = false;
  renderCinta();
}

function paso() {
  if (terminado) return;
  if (cinta[0] !== '#') {
    cinta.unshift('#');
    cabeza++;
  }
  if (cinta[cinta.length - 1] !== '#') {
    cinta.push('#');
  }
  pasoSuma();
}

function ejecutar() {
  if (terminado) return;
  auto = true;
  function pasoAuto() {
    if (!terminado && auto) {
      paso();
      setTimeout(pasoAuto, 300);
    }
  }
  pasoAuto();
}

function pasoSuma() {
  const s = cinta[cabeza];
  let descripcion = '';
  switch (estado) {
    case 'right': descripcion = s === '#' ? '← Retroceder y cambiar a estado read' : '→ Avanzar a la derecha'; break;
    case 'read':
      if (s === '0' || s === '1') descripcion = `← Guardar '${s}' como 'c' y moverse a have${s}`;
      else if (s === '+') descripcion = "→ Reemplazar '+' por '#' y avanzar para limpiar";
      break;
    case 'clean_right':
      descripcion = s === '#' ? '← Ir a buscar marca (O/I)' : `→ Borrar '${s}'`;
      break;
    case 'go_to_marker':
      if (s === 'O' || s === 'I') descripcion = `← Restaurar marca '${s}' a bit real y cambiar a 'rewrite'`;
      else descripcion = '← Retroceder hasta encontrar marca';
      break;
    case 'have0': descripcion = s === '+' ? '← Cambiar a estado add0' : '← Retroceder buscando +'; break;
    case 'have1': descripcion = s === '+' ? '← Cambiar a estado add1' : '← Retroceder buscando +'; break;
    case 'add0':
      if (s === '0' || s === '#') descripcion = `→ Escribir O y avanzar a back0`;
      else if (s === '1') descripcion = `→ Escribir I y avanzar a back0`;
      else descripcion = '← Retroceder marca';
      break;
    case 'add1':
      if (s === '0' || s === '#') descripcion = `→ Escribir I y avanzar a back1`;
      else if (s === '1') descripcion = `← Escribir O y llevar acarreo`;
      else descripcion = '← Retroceder marca';
      break;
    case 'carry':
      if (s === '0' || s === '#') descripcion = `→ Escribir 1 y avanzar a back1`;
      else if (s === '1') descripcion = `← Escribir 0 y seguir llevando acarreo`;
      break;
    case 'back0': descripcion = s === 'c' ? '← Restaurar a 0 y volver a read' : '→ Avanzar hacia c'; break;
    case 'back1': descripcion = s === 'c' ? '← Restaurar a 1 y volver a read' : '→ Avanzar hacia c'; break;
    case 'rewrite':
      if (s === 'O' || s === 'I') descripcion = `← Reescribir marca '${s}' a bit real`;
      else if (s === '0' || s === '1') descripcion = '← Seguir limpiando';
      else if (s === '#') descripcion = '→ Terminar ejecución';
      break;
    case 'es#':
      if (s === 'O' || s === 'I') descripcion = `← Reescribir marca '${s}' a bit real`;
      else if (s === '0' || s === '1') descripcion = '← Seguir limpiando';
      else if (s === '#') descripcion = '→ Terminar ejecución';
      break;
    case 'done': descripcion = '✅ Finalizado'; break;
  }

  log(`Suma | Estado: ${estado}, Cabeza: ${cabeza}, Símbolo: '${s}' → ${descripcion}`);

  switch (estado) {
    case 'right':
      if (s === '0' || s === '1' || s === '+') cabeza++;
      else if (s === '#') { cabeza--; estado = 'read'; }
      break;

    case 'read':
      if (s === '0') { cinta[cabeza] = 'c'; cabeza--; estado = 'have0'; }
      else if (s === '1') { cinta[cabeza] = 'c'; cabeza--; estado = 'have1'; }
      else if (s === '+') { cinta[cabeza] = '#'; cabeza++; estado = 'clean_right'; }
      break;

    case 'clean_right':
      if (s === '0' || s === '1') { cinta[cabeza] = '#'; cabeza++; }
      else if (s === '#') { cabeza--; estado = 'go_to_marker'; }
      break;

    case 'go_to_marker':
      if (s === 'O') { cinta[cabeza] = '0'; cabeza--; estado = 'rewrite'; }
      else if (s === 'I') { cinta[cabeza] = '1'; cabeza--; estado = 'rewrite'; }
      else if (s === '#') { cabeza--; }
      else { cabeza--; estado = 'es#'; }
      break;

    case 'have0':
      if (s === '0' || s === '1') cabeza--;
      else if (s === '+') { cabeza--; estado = 'add0'; }
      break;

    case 'have1':
      if (s === '0' || s === '1') cabeza--;
      else if (s === '+') { cabeza--; estado = 'add1'; }
      break;

    case 'add0':
      if (s === '0' || s === '#') { cinta[cabeza] = 'O'; cabeza++; estado = 'back0'; }
      else if (s === '1') { cinta[cabeza] = 'I'; cabeza++; estado = 'back0'; }
      else if (s === 'O' || s === 'I') cabeza--;
      break;

    case 'add1':
      if (s === '0' || s === '#') { cinta[cabeza] = 'I'; cabeza++; estado = 'back1'; }
      else if (s === '1') { cinta[cabeza] = 'O'; cabeza--; estado = 'carry'; }
      else if (s === 'O' || s === 'I') cabeza--;
      break;

    case 'carry':
      if (s === '0' || s === '#') { cinta[cabeza] = '1'; cabeza++; estado = 'back1'; }
      else if (s === '1') { cinta[cabeza] = '0'; cabeza--; }
      break;

    case 'back0':
      if (['0', '1', 'O', 'I', '+'].includes(s)) cabeza++;
      else if (s === 'c') { cinta[cabeza] = '0'; cabeza--; estado = 'read'; }
      break;

    case 'back1':
      if (['0', '1', 'O', 'I', '+'].includes(s)) cabeza++;
      else if (s === 'c') { cinta[cabeza] = '1'; cabeza--; estado = 'read'; }
      break;

    case 'rewrite':
      if (s === 'O') { cinta[cabeza] = '0'; cabeza--; }
      else if (s === 'I') { cinta[cabeza] = '1'; cabeza--; }
      else if (s === '0' || s === '1') { cabeza--; estado = 'es#'; }
      else if (s === '#') { cabeza++; estado = 'done'; }
      break;

    case 'done':
      terminado = true;
      break;

    case 'es#':
      if (s === '#') { cabeza++; estado = 'done'; }
      else estado = 'rewrite';
      break;
  }

  renderCinta();
}
