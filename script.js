let cinta = [], cabeza = 0, estado = '', terminado = false, auto = false, operacionActual = '+', negativo = false;

function renderCinta() {
  const div = document.getElementById("tape");
  div.innerHTML = '';
  const plusIndex = cinta.indexOf('+');
  cinta.forEach((v, i) => {
    const c = document.createElement('div');
    let clases = 'cell';
    if (i === cabeza) clases += ' head';
    if (plusIndex !== -1 && i > plusIndex && (v === '0' || v === '1')) clases += ' resultado';
    c.className = clases;
    c.textContent = v === '#' ? '#' : v;
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
  const validoB1 = esBinario(b1);
  const validoB2 = esBinario(b2);
  const alMenosUno = b1 !== "" || b2 !== "";
  document.getElementById("btnInicializar").disabled = !(validoB1 && validoB2 && alMenosUno);
}

function iniciar() {
  let b1 = document.getElementById("bin1").value.trim() || "0";
  let b2 = document.getElementById("bin2").value.trim() || "0";
  operacionActual = document.getElementById("operacion").value;

  negativo = false;

  // Inversión de binarios para resta si b1 < b2
  if (operacionActual === '-' && parseInt(b1, 2) < parseInt(b2, 2)) {
    [b1, b2] = [b2, b1];
    negativo = true;
  }

  cinta = [...(b1 + operacionActual + b2).split('')];

  if (cinta[0] !== '#') cinta.unshift('#');
  if (cinta[cinta.length - 1] !== '#') cinta.push('#');

  cabeza = 1;
  estado = operacionActual === '+' ? 'right' : operacionActual === '-' ? 'right' : 'start';
  terminado = false;
  auto = false;
  document.getElementById("log").innerHTML = "<strong>Pasos de ejecución:</strong>";
  renderCinta();
  document.getElementById("btnPaso").disabled = false;
  document.getElementById("btnEjecutar").disabled = false;
}

function paso() {
  // Asegura que la primera y última celda sean '#'
  if (cinta[0] !== '#') {
    cinta.unshift('#');
    cabeza++;
  }
  if (cinta[cinta.length - 1] !== '#') {
    cinta.push('#');
  }

  if (operacionActual === '+') pasoSuma();
  else if (operacionActual === '-') pasoResta();
  else pasoMultiplicacion();


  // Verifica de nuevo después del paso
  if (cinta[0] !== '#') {
    cinta.unshift('#');
    cabeza++;
  }
  if (cinta[cinta.length - 1] !== '#') {
    cinta.push('#');
  }
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

// Lógica Suma
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
    case 'done': descripcion = 'Proceso finalizado.✅'; break;
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
      else { cabeza--; if (s !== '#') estado = 'es#'; }
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
    case 'es#':
      if (s === '#') { cabeza++; estado = 'done'; }
      else estado = 'rewrite';
      break;
    case 'done':
      terminado = true;
      document.getElementById("btnPaso").disabled = true;
      document.getElementById("btnEjecutar").disabled = true;
      break;
  }

  renderCinta();
}

// Lógica Multiplicacion
function pasoMultiplicacion() {
  const s = cinta[cabeza];
  let accion = "";
  switch (estado) {
    case 'start': accion = "Busca el inicio de la cinta para colocar '+' como delimitador."; if (s === '0' || s === '1') { cabeza--; estado = 'init'; } break;
    case 'init': accion = "Coloca '+' para separar la zona de acumulación del operando."; if (s === '#') { cinta[cabeza] = '+'; cabeza++; estado = 'right'; } break;
    case 'right': accion = "Se mueve a la derecha sobre A, '*', y B hasta llegar al final."; if (s === '0' || s === '1' || s === '*') cabeza++; else if (s === '#') { cabeza--; estado = 'readB'; } break;
    case 'readB':
      if (s === '1') { cinta[cabeza] = '#'; cabeza--; estado = 'addA'; accion = "Leyó '1': se borrará y se iniciará la suma de A en acumulador."; }
      else if (s === '0') { cinta[cabeza] = '#'; cabeza--; estado = 'doubleL'; accion = "Leyó '0': se borrará y se iniciará la duplicación de A."; }
      else if (s === '*') { cabeza--; estado = 'done'; accion = "Todos los bits de B procesados. Finalizando."; }
      break;
    case 'addA': accion = "Moviéndose hacia la izquierda para buscar el inicio de A."; if (s === '0' || s === '1') cabeza--; else if (s === '*') { cabeza--; estado = 'read'; } break;
    case 'doubleL': accion = "Moviéndose hacia la izquierda para empezar duplicación de A."; if (s === '0' || s === '1') cabeza--; else if (s === '*') { cinta[cabeza] = '0'; cabeza++; estado = 'shift'; } break;
    case 'shift':
      if (s === '0') { cinta[cabeza] = '*'; cabeza++; estado = 'shift0'; accion = "Duplica '0': escribe marcador y pasa a shift0."; }
      else if (s === '1') { cinta[cabeza] = '*'; cabeza++; estado = 'shift1'; accion = "Duplica '1': escribe marcador y pasa a shift1."; }
      else if (s === '#') { cabeza--; estado = 'tidy'; accion = "Fin de duplicación, inicia limpieza."; }
      break;
    case 'shift0':
      if (s === '0') { cabeza++; accion = "Continúa duplicando '0'."; }
      else if (s === '1') { cinta[cabeza] = '0'; cabeza++; estado = 'shift1'; accion = "Cambia '1' por '0' y pasa a duplicar '1'."; }
      else if (s === '#') { cinta[cabeza] = '0'; cabeza++; estado = 'right'; accion = "Escribe '0' al final como parte de la duplicación."; }
      break;
    case 'shift1':
      if (s === '1') { cabeza++; accion = "Continúa duplicando '1'."; }
      else if (s === '0') { cinta[cabeza] = '1'; cabeza++; estado = 'shift0'; accion = "Cambia '0' por '1' y pasa a duplicar '0'."; }
      else if (s === '#') { cinta[cabeza] = '1'; cabeza++; estado = 'right'; accion = "Escribe '1' al final como parte de la duplicación."; }
      break;
    case 'tidy': accion = "Limpieza de bits temporales tras duplicación."; if (s === '0' || s === '1') { cinta[cabeza] = '#'; cabeza--; } else if (s === '+') { cinta[cabeza] = '#'; cabeza--; estado = 'done'; } break;
    case 'read':
      if (s === '0') { cinta[cabeza] = 'c'; cabeza--; estado = 'have0'; accion = "Lee bit '0' de A para sumarlo."; }
      else if (s === '1') { cinta[cabeza] = 'c'; cabeza--; estado = 'have1'; accion = "Lee bit '1' de A para sumarlo."; }
      else if (s === '+') { cabeza--; estado = 'rewrite'; accion = "Fin de suma: empieza reescritura de bits temporales."; }
      break;
    case 'have0': accion = "Buscando acumulador para sumar 0."; if (s === '0' || s === '1') cabeza--; else if (s === '+') { cabeza--; estado = 'add0'; } break;
    case 'have1': accion = "Buscando acumulador para sumar 1."; if (s === '0' || s === '1') cabeza--; else if (s === '+') { cabeza--; estado = 'add1'; } break;
    case 'add0':
      if (s === '0' || s === '#') { cinta[cabeza] = 'O'; cabeza++; estado = 'back0'; accion = "Suma 0 sobre 0 o vacío: escribe 'O'."; }
      else if (s === '1') { cinta[cabeza] = 'I'; cabeza++; estado = 'back0'; accion = "Suma 0 sobre 1: escribe 'I'."; }
      else { cabeza--; accion = "Retrocede buscando posición de suma válida."; }
      break;
    case 'add1':
      if (s === '0' || s === '#') { cinta[cabeza] = 'I'; cabeza++; estado = 'back1'; accion = "Suma 1 sobre 0 o vacío: escribe 'I'."; }
      else if (s === '1') { cinta[cabeza] = 'O'; cabeza--; estado = 'carry'; accion = "Suma 1 sobre 1: escribe 'O' y activa acarreo."; }
      else { cabeza--; accion = "Retrocede buscando posición válida para acarreo."; }
      break;
    case 'carry':
      if (s === '0' || s === '#') { cinta[cabeza] = '1'; cabeza++; estado = 'back1'; accion = "Realiza acarreo: escribe '1'."; }
      else if (s === '1') { cinta[cabeza] = '0'; cabeza--; accion = "Propaga acarreo: cambia '1' a '0'."; }
      else { cabeza--; accion = "Retrocede propagando acarreo."; }
      break;
    case 'back0': accion = "Regresa para leer siguiente bit de A."; if (["0", "1", "O", "I", "+"].includes(s)) cabeza++; else if (s === 'c') { cinta[cabeza] = '0'; cabeza--; estado = 'read'; } break;
    case 'back1': accion = "Regresa para leer siguiente bit de A."; if (["0", "1", "O", "I", "+"].includes(s)) cabeza++; else if (s === 'c') { cinta[cabeza] = '1'; cabeza--; estado = 'read'; } break;
    case 'rewrite':
      if (s === 'O') { cinta[cabeza] = '0'; cabeza--; accion = "Reescribe 'O' como '0'."; }
      else if (s === 'I') { cinta[cabeza] = '1'; cabeza--; accion = "Reescribe 'I' como '1'."; }
      else if (s === '0' || s === '1') { cabeza--; accion = "Salta bit ya correcto."; }
      else if (s === '#') { cabeza++; estado = 'double'; accion = "Reescritura terminada, prepara siguiente paso."; }
      break;
    case 'double':
      if (["0", "1", "+"].includes(s)) { cabeza++; accion = "Moviéndose hacia '*' para duplicar."; }
      else if (s === '*') { cinta[cabeza] = '0'; cabeza++; estado = 'shift'; accion = "Reemplaza '*' por '0' e inicia duplicación."; }
      break;
    case 'done':
      cabeza++
      if (!cinta.includes('0') && !cinta.includes('1')) { cinta[cabeza] = '0'; accion = "Resultado es cero. Escribe '0'."; }
      terminado = true;
      document.getElementById("btnPaso").disabled = true;
      document.getElementById("btnEjecutar").disabled = true;
      accion = "Proceso finalizado.✅";
      break;
  }
  log(`Estado: ${estado}, Cabeza: ${cabeza}, Símbolo: '${s}' → ${accion}`);
  renderCinta();
}

// Lógica Resta
function pasoResta() {
  const s = cinta[cabeza];
  let accion = '';

  switch (estado) {
    case 'right':
      if (s === '0' || s === '1') { cabeza++; accion = '→ Avanza'; }
      else if (s === '-') { cabeza++; accion = "→ Pasa el '-'"; }
      else if (s === '#') { cabeza--; estado = 'read'; accion = '← Retrocede y va a read'; }
      break;

    case 'read':
      if (s === '0') { cinta[cabeza] = 'c'; cabeza--; estado = 'have0'; accion = "Marca 0 como 'c' y va a have0"; }
      else if (s === '1') { cinta[cabeza] = 'c'; cabeza--; estado = 'have1'; accion = "Marca 1 como 'c' y va a have1"; }
      else if (s === '-') { cinta[cabeza] = '#'; cabeza--; estado = 'rewrite'; accion = "Elimina '-' y va a rewrite"; }
      break;

    /*case 'clean_right':
      if (s === '0' || s === '1') { cinta[cabeza] = '#'; cabeza++; accion = `Limpia ${s}`; }
      else if (s === '#') { cabeza--; estado = 'go_to_marker'; accion = "← Va hacia go_to_marker"; }
      break;*/

    /*case 'change':
      if (s === 'O') { cinta[cabeza] = '0'; cabeza--; estado = 'rewrite'; accion = "Restablece O como 0 y va a rewrite"; }
      else if (s === 'I') { cinta[cabeza] = '1'; cabeza--; estado = 'rewrite'; accion = "Restablece I como 1 y va a rewrite"; }
      else if (s === '0' || s === '1' || s === '#') { cabeza--; accion = "← Retrocede"; }
      break;*/

    case 'have0':
      if (s === '0' || s === '1') { cabeza--; accion = "← Buscando -"; }
      else if (s === '-') { cabeza--; estado = 'res0'; accion = "← Va a res0"; }
      break;

    case 'have1':
      if (s === '0' || s === '1' ) { cabeza--; accion = "← Buscando -"; }
      else if (s === '-') { cabeza--; estado = 'res1'; accion = "← Va a res1"; }
      break;

    case 'res0':
      if (s === 'O' || s === 'I') { cabeza--; accion = "← Retrocede"; }
      else if (s === '0') { cinta[cabeza] = 'O'; cabeza++; estado = 'back0'; accion = "0 - 0 → O → back0"; }
      else if (s === '1') { cinta[cabeza] = 'I'; cabeza++; estado = 'back0'; accion = "1 - 0 → I → back0"; }
      else if (s === '#') { cinta[cabeza] = 'O'; cabeza++; estado = 'back0'; accion = "Resultado negativo"; }
      break;

    case 'res1':
      if (s === 'O' || s === 'I') { cabeza--; accion = "← Retrocede"; }
      else if (s === '0') { cinta[cabeza] = 'X'; cabeza--; estado = 'resX0'; accion = "0 - 1: inicia préstamo (resX0)"; }
      else if (s === '1') { cinta[cabeza] = 'O'; cabeza++; estado = 'back1'; accion = "1 - 1 → O → back1"; } 
      break;

    /*case 'verneg':
      if (s === 'O') { cabeza--; accion = "← Retrocede"; }
      else if (s === 'I') { cabeza--; estado = 'esneg'; }
      else if (s === '#') { cinta[cabeza] = 'I'; cabeza--; estado = 'esneg'; accion = "Negativo: marca con I → esneg"; }
      break;

    case 'esneg':
      if (s === '#') { cinta[cabeza] = '-'; cabeza++; estado = 'back1'; accion = "Escribe signo '-' y va a back1"; }
      else if (s === 'O') { cinta[cabeza] = '1'; cabeza++; estado = 'back1'; accion = "Escribe 1 → back1"; }
      break;*/

    case 'resX0':
      if (s === '0') { cinta[cabeza] = 'Z'; cabeza--; accion = "Marca Z"; }
      else if (s === '1') { cinta[cabeza] = '0'; cabeza++; accion = "Corrige préstamo"; }
      else if (s === 'Z') { cinta[cabeza] = '1'; cabeza++; accion = "Completa préstamo"; }
      else if (s === 'X') { cinta[cabeza] = 'I'; cabeza++; estado = 'back1'; accion = "Finaliza préstamo → back1"; }
      //else if (s === '#') { cinta[cabeza] = '-'; cabeza++; accion = "Marca negativo"; }
      break;

    case 'back0':
      if (["0", "1", "O", "I", "-"].includes(s)) { cabeza++; accion = "→"; }
      else if (s === 'c') { cinta[cabeza] = '#'; cabeza--; estado = 'read'; accion = "Elimina c y leer siguiente"; }
      break;

    case 'back1':
      if (["0", "1", "O", "I", "-"].includes(s)) { cabeza++; accion = "→"; }
      else if (s === 'c') { cinta[cabeza] = '#'; cabeza--; estado = 'read'; accion = "Elimina c y leer siguiente"; }
      break;

    case 'rewrite':
      if (s === 'O') { cinta[cabeza] = '0'; cabeza--; accion = "Reescribe O → 0"; }
      else if (s === 'I') { cinta[cabeza] = '1'; cabeza--; accion = "Reescribe I → 1"; }
      else if (s === '0' || s === '1') { cabeza--; accion = "←"; }
      //else if (s === '-') { cabeza++; estado = 'esmenos1'; accion = "→ Verifica si es -1"; }
      else if (s === '#') { cabeza++; estado = 'done'; accion = "→ done"; }
      break;

    /*case 'esmenos1':
      if (s === '1') { cabeza++; accion = "Avanza →"; }
      else if (s === '0') { cabeza++; estado = 'nomenos1'; accion = "→"; }
      else if (s === '#') { cabeza--; estado = 'menos1'; accion = "← El numero es -1"; }
      break;

    case 'menos1':
      if (s === '1') { cinta[cabeza] = '#'; cabeza--; accion = "← Elimina los 1 de mas"; }
      else if (s === '-') { cabeza++; accion = "→"; }
      else if (s === '#') { cinta[cabeza] = '1'; cabeza++; estado = 'done'; accion = "→ Escribe 1"; }
      break;

    case 'nomenos1':
      if (s === '0' || s === '1') { cabeza++; accion = "Avanza →"; }
      else if (s === '#') { cabeza--; estado = 'done'; }
      break;*/

    case 'done':
      if (negativo) {
        if (s === '0' || s === '1') { cabeza--; accion = "← Buscando -"; }
        else if (s === '#') { cinta[cabeza] = '-'; cabeza++; accion = "Ingreso signo negativo"; negativo = false; }
      } else {
        terminado = true;
        document.getElementById("btnPaso").disabled = true;
        document.getElementById("btnEjecutar").disabled = true;
        accion = "Proceso finalizado.✅";
      }
      break;
  }

  log(`Resta | Estado: ${estado}, Cabeza: ${cabeza}, Símbolo: '${s}' → ${accion}`);
  renderCinta();
}
