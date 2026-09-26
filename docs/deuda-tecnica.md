# Deuda técnica

## CSS responsive: especificidad

Ya hubo dos maniobras para que una regla desktop supere una regla mobile por
especificidad: `.hero__skip` y el globo inicial de `.hero__riddle-group`.
Cuando aparezca una tercera, migrar la composición responsive a `@layer`, con
mobile como capa base y desktop después, para que el orden de capas resuelva
la precedencia sin seguir apilando especificidad.

## Hero desktop: globo de respuesta del quiz

`.hero__question-ui .hero__riddle-balloon--answer` todavía no tiene medidas
desktop propias porque falta el frame de Figma. Cuando llegue, maquetar esa
variante por separado; no heredar las medidas del globo inicial.

## Orientación de los globos del hero

- `img/intro/globo.webp` y `img/intro/desktop/globo.svg` están espejados entre
  sí. La orientación de la cola depende del archivo que cargue el `<picture>`,
  no de una decisión explícita. Esto ya causó dos bugs: la cola del intro
  desktop y la del acertijo desktop.
- Salida limpia: usar `globo.svg` en las dos instancias desktop y fijar la
  orientación con un transform explícito por instancia, en vez de que sea un
  efecto secundario de la elección del asset.
