const form = document.querySelector('.formulario__form');
const message = form?.querySelector('.formulario__mensaje');
const submitButton = form?.querySelector('[type="submit"]');

// Qué corregir en cada campo. Mismas reglas que valida Formularios.php.
const AYUDA = {
  nombre: 'Escribe tu nombre y apellido.',
  email: 'Escribe un correo válido, como nombre@correo.com.',
  codigo_postal: 'El código postal lleva 5 números.',
  telefono: 'El teléfono lleva 9 números; puedes añadir +34 delante.',
  terminos: 'Acepta los términos y condiciones para continuar.',
};

let envioEnCurso = false;
let enviado = false;

const mostrar = (texto, estado = 'error') => {
  message.textContent = texto;
  message.dataset.estado = estado;
};

// El hueco del mensaje es de una o dos líneas: se explica el primer campo marcado
// (el que tiene el foco) y se cuenta el resto. Al corregirlo, pasa al siguiente.
const explicarMarcas = () => {
  form.querySelectorAll('[aria-describedby="formulario-mensaje"]').forEach((control) => control.removeAttribute('aria-describedby'));
  const [primero, ...resto] = form.querySelectorAll('[aria-invalid="true"]');
  if (!primero) {
    message.textContent = '';
    return;
  }
  primero.setAttribute('aria-describedby', 'formulario-mensaje');
  const cola = resto.length === 0 ? '' : resto.length === 1 ? ' Y otro campo marcado.' : ` Y ${resto.length} campos marcados más.`;
  mostrar(`${AYUDA[primero.name] ?? 'Revisa este campo.'}${cola}`);
};

const marcar = (controles) => {
  controles.forEach((control) => control.setAttribute('aria-invalid', 'true'));
  explicarMarcas();
  controles[0]?.focus();
};

if (form && message && submitButton) form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (envioEnCurso || enviado) return;

  form.querySelectorAll('[aria-invalid="true"]').forEach((control) => control.removeAttribute('aria-invalid'));
  explicarMarcas();

  if (!form.checkValidity()) {
    marcar([...form.querySelectorAll(':invalid')]);
    return;
  }

  envioEnCurso = true;
  submitButton.disabled = true;

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      signal: AbortSignal.timeout(15000),
    });
    // Un 500 de PHP puede llegar como HTML: sin JSON se trata como fallo del servidor.
    const data = await response.json().catch(() => ({}));

    if (data.success === 2) {
      enviado = true;
      mostrar(data.email_sent
        ? '¡Listo! Te enviamos los vales a tu correo. Si no los ves, revisa la carpeta de spam.'
        : '¡Listo! Tu registro quedó guardado.', 'info');
      form.querySelectorAll('input, button, select, textarea').forEach((control) => { control.disabled = true; });
      document.dispatchEvent(new CustomEvent('formulario:enviado'));
      return;
    }
    if (data.already_registered) {
      mostrar('Ese correo ya está registrado. Si no encuentras los vales, revisa la carpeta de spam.', 'info');
      return;
    }
    if (Array.isArray(data.invalid_fields)) {
      marcar([...form.querySelectorAll('input[name]')].filter((input) => data.invalid_fields.includes(input.name)));
      return;
    }
    mostrar('Algo falló de nuestro lado. Inténtalo de nuevo en unos minutos.');
  } catch (error) {
    mostrar('No pudimos enviar tus datos. Revisa tu conexión e inténtalo de nuevo.');
  } finally {
    envioEnCurso = false;
    if (!enviado) submitButton.disabled = false;
  }
});

if (form && message) {
  // Al tocar un campo marcado se le quita la marca y el mensaje pasa al siguiente.
  const limpiarMarca = ({ target }) => {
    if (target.getAttribute('aria-invalid') !== 'true') return;
    target.removeAttribute('aria-invalid');
    explicarMarcas();
  };
  form.addEventListener('input', limpiarMarca);
  form.addEventListener('change', limpiarMarca);
}
