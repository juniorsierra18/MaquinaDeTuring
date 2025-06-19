
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
  const necesitaInicio = cinta[0] !== '#';
  const necesitaFinal = cinta[cinta.length - 1] !== '#';
  let expandio = false;

  if (necesitaInicio) {
    cinta.unshift('#');
    cabeza++;
    expandio = true;
  }
  if (necesitaFinal) {
    cinta.push('#');
    expandio = true;
  }
  if (cabeza < 0) {
    cinta.unshift('#');
    cabeza = 0;
    expandio = true;
  }
  if (cabeza >= cinta.length) {
    cinta.push('#');
    expandio = true;
  }

  renderCinta();
  if (expandio) {
    setTimeout(() => paso(), 200);
    return;
  }

  if (terminado) return;
  const s = cinta[cabeza];
  log(`Estado: ${estado}, Cabeza: [${cabeza}], Símbolo: '${s}'`);

  switch (estado) {
    case 'right':
      if (['0', '1', '+'].includes(s)) cabeza++;
      else if (s === '#') { cabeza--; estado = 'read'; }
      break;
    case 'read':
      if (s === '0') { cinta[cabeza] = 'c'; estado = 'have0'; cabeza--; }
      else if (s === '1') { cinta[cabeza] = 'c'; estado = 'have1'; cabeza--; }
      else if (s === '+') { cinta[cabeza] = '#'; estado = 'clean_right'; cabeza++; }
      break;
    case 'clean_right':
      if (s === '0' || s === '1') { cinta[cabeza] = '#'; cabeza++; }
      else if (s === '#') { estado = 'go_to_marker'; cabeza--; }
      break;
    case 'go_to_marker':
      if (s === 'O') { cinta[cabeza] = '0'; estado = 'rewrite'; cabeza--; }
      else if (s === 'I') { cinta[cabeza] = '1'; estado = 'rewrite'; cabeza--; }
      else { cabeza--; }
      break;
    case 'have0':
      if (['0', '1'].includes(s)) cabeza--;
      else if (s === '+') { cabeza--; estado = 'add0'; }
      break;
    case 'have1':
      if (['0', '1'].includes(s)) cabeza--;
      else if (s === '+') { cabeza--; estado = 'add1'; }
      break;
    case 'add0':
      if (s === '0' || s === '#') { cinta[cabeza] = 'O'; estado = 'back0'; cabeza++; }
      else if (s === '1') { cinta[cabeza] = 'I'; estado = 'back0'; cabeza++; }
      else if (['O', 'I'].includes(s)) cabeza--;
      break;
    case 'add1':
      if (s === '0' || s === '#') { cinta[cabeza] = 'I'; estado = 'back1'; cabeza++; }
      else if (s === '1') { cinta[cabeza] = 'O'; estado = 'carry'; cabeza--; }
      else if (['O', 'I'].includes(s)) cabeza--;
      break;
    case 'carry':
      if (s === '0' || s === '#') { cinta[cabeza] = '1'; estado = 'back1'; cabeza++; }
      else if (s === '1') { cinta[cabeza] = '0'; cabeza--; }
      break;
    case 'back0':
      if (['0', '1', 'O', 'I', '+'].includes(s)) cabeza++;
      else if (s === 'c') { cinta[cabeza] = '0'; estado = 'read'; cabeza--; }
      break;
    case 'back1':
      if (['0', '1', 'O', 'I', '+'].includes(s)) cabeza++;
      else if (s === 'c') { cinta[cabeza] = '1'; estado = 'read'; cabeza--; }
      break;
    case 'rewrite':
      if (s === 'O') { cinta[cabeza] = '0'; cabeza--; }
      else if (s === 'I') { cinta[cabeza] = '1'; cabeza--; }
      else if (['0', '1'].includes(s)) cabeza--;
      else if (s === '#') { estado = 'done'; cabeza++; terminado = true; }
      break;
  }

  renderCinta();
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
