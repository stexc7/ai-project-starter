const form = document.getElementById('join');
const connected = document.getElementById('connected');
const message = document.getElementById('message');

function show(text, kind = '') {
  message.textContent = text;
  message.className = kind;
}

function render(session) {
  form.hidden = session !== null;
  connected.hidden = session === null;
  if (session) document.getElementById('room-code').textContent = session.code;
}

async function refresh() {
  const status = await chrome.runtime.sendMessage({ type: 'status' });
  render(status?.session ?? null);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  show('Conectando…');

  const origin = new URL(document.getElementById('origin').value.trim()).origin;
  const code = document.getElementById('code').value.trim().toUpperCase();

  // Chrome exige pedir permiso para un dominio que no está en el manifiesto, y
  // la dirección de la app la pone cada pareja.
  const granted = await chrome.permissions.request({ origins: [`${origin}/*`] });
  if (!granted) {
    show('Hace falta permiso para hablar con esa dirección.', 'error');
    return;
  }

  const result = await chrome.runtime.sendMessage({
    type: 'join',
    origin,
    code,
    name: document.getElementById('name').value.trim(),
    pin: document.getElementById('pin').value.trim(),
  });

  if (!result?.ok) {
    show(result?.error ?? 'No se ha podido conectar.', 'error');
    return;
  }

  show('');
  await refresh();
});

document.getElementById('leave').addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'leave' });
  show('');
  await refresh();
});

void refresh();
