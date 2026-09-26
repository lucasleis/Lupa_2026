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

- `img/acertijo/nube-rta.webp` ya tiene la orientación de la cola declarada
  explícitamente con `--cola` en sus tres instancias: respuesta, resultado y
  prueba superada.
- Sigue abierto el par `img/intro/globo.webp` / `img/intro/desktop/globo.svg`:
  están espejados entre sí y la orientación todavía depende de cuál resuelva
  el `<picture>`. Fijar esa orientación por instancia y resolver el par sigue
  pendiente.
