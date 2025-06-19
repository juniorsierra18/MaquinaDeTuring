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

function esBinario(str) {
  return str === "" || /^[01]+$/.test(str);
}

function verificarEntradas() {
  const b1 = document.getElementById("bin1").value.trim();
  const b2 = document.getElementById("bin2").value.trim();
  const btn = document.getElementById("btnInicializar");

  const validoB1 = esBinario(b1);
  const validoB2 = esBinario(b2);
  const alMenosUno = b1 !== "" || b2 !== "";

  btn.disabled = !(validoB1 && validoB2 && alMenosUno);
}

function iniciar() {
  const b1 = document.getElementById("bin1").value.trim();
  const b2 = document.getElementById("bin2").value.trim();
  const op = document.getElementById("operacion").value;
  const logDiv = document.getElementById('log');
  logDiv.innerHTML = "<strong>Pasos de ejecución:</strong>";

  const inputArr = (b1 + op + b2).split('');
  cinta = ['#', ...inputArr, '#'];
  cabeza = 1;
  estado = 'right';
  terminado = false;
  auto = false;

  renderCinta();

  document.getElementById("btnPaso").disabled = false;
  document.getElementById("btnEjecutar").disabled = false;
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
    case 'right':
      descripcion = s === '#' ? '← Retroceder y cambiar a estado read' : '→ Avanzar a la derecha';
      break;
    case 'read':
      if (s === '0') { cinta[cabeza] = 'c'; cabeza--; estado = 'have0'; }
      else if (s === '1') { cinta[cabeza] = 'c'; cabeza--; estado = 'have1'; }
      else if (s === '+') { cinta[cabeza] = '#'; cabeza++; estado = 'clean_right'; }
      break;
    case 'have0':
      if (s === '+') { cabeza--; estado = 'add0'; }
      else { cabeza--; }
      break;
    case 'have1':
      if (s === '+') { cabeza--; estado = 'add1'; }
      else { cabeza--; }
      break;
    case 'add0':
      if (s === '0' || s === '#') { cinta[cabeza] = 'O'; cabeza++; estado = 'back0'; }
      else if (s === '1') { cinta[cabeza] = 'I'; cabeza++; estado = 'back0'; }
      else { cabeza--; }
      break;
    case 'add1':
      if (s === '0' || s === '#') { cinta[cabeza] = 'I'; cabeza++; estado = 'back1'; }
      else if (s === '1') { cinta[cabeza] = 'O'; cabeza--; estado = 'carry'; }
      else { cabeza--; }
      break;
    case 'carry':
      if (s === '0' || s === '#') { cinta[cabeza] = '1'; cabeza++; estado = 'back1'; }
      else if (s === '1') { cinta[cabeza] = '0'; cabeza--; }
      break;
    case 'back0':
      if (['0','1','O','I','+'].includes(s)) cabeza++;
      else if (s === 'c') { cinta[cabeza] = '0'; cabeza--; estado = 'read'; }
      break;
    case 'back1':
      if (['0','1','O','I','+'].includes(s)) cabeza++;
      else if (s === 'c') { cinta[cabeza] = '1'; cabeza--; estado = 'read'; }
      break;
    case 'clean_right':
      if (s === '0' || s === '1') { cinta[cabeza] = '#'; cabeza++; }
      else if (s === '#') { cabeza--; estado = 'go_to_marker'; }
      break;
    case 'go_to_marker':
      if (s === 'O') { cinta[cabeza] = '0'; cabeza--; estado = 'rewrite'; }
      else if (s === 'I') { cinta[cabeza] = '1'; cabeza--; estado = 'rewrite'; }
      else { cabeza--; }
      break;
    case 'rewrite':
      if (s === 'O') { cinta[cabeza] = '0'; cabeza--; }
      else if (s === 'I') { cinta[cabeza] = '1'; cabeza--; }
      else if (s === '#') { cabeza++; estado = 'done'; }
      else { cabeza--; }
      break;
    case 'done':
      descripcion = '✅ Finalizado';
      terminado = true;
      document.getElementById("btnPaso").disabled = true;
      document.getElementById("btnEjecutar").disabled = true;
      break;
  }

  log(`Estado: ${estado}, Cabeza: ${cabeza}, Símbolo: '${s}' → ${descripcion}`);
  renderCinta();
}
