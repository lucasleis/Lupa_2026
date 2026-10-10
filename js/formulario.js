const form = document.querySelector('.formulario__form');
const message = form?.querySelector('.formulario__mensaje');
const submitButton = form?.querySelector('[type="submit"]');

let envioEnCurso = false;
let enviado = false;

if (form && message && submitButton) form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (envioEnCurso || enviado) return;

  envioEnCurso = true;
  submitButton.disabled = true;
  message.textContent = '';
  form.querySelectorAll('[aria-invalid="true"]').forEach((input) => input.removeAttribute('aria-invalid'));

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
    });
    const data = await response.json();

    if (data.success === 2) {
      enviado = true;
      message.textContent = '¡Listo! Tu registro quedó guardado.';
      form.querySelectorAll('input, button, select, textarea').forEach((control) => { control.disabled = true; });
      return;
    }
    if (data.already_registered) {
      message.textContent = 'Ese correo ya está registrado.';
      return;
    }
    if (Array.isArray(data.invalid_fields)) {
      form.querySelectorAll('input[name]').forEach((input) => {
        if (data.invalid_fields.includes(input.name)) input.setAttribute('aria-invalid', 'true');
      });
      message.textContent = 'Revisa los datos marcados y vuelve a intentarlo.';
      return;
    }
    message.textContent = 'No se pudo enviar. Inténtalo de nuevo.';
  } catch (error) {
    message.textContent = 'No se pudo enviar. Inténtalo de nuevo.';
  } finally {
    envioEnCurso = false;
    if (!enviado) submitButton.disabled = false;
  }
});
