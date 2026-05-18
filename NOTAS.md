# 📋 OWN Cuentos Mágicos — Notas del Proyecto

## 🐛 BUGS RESUELTOS

### Bug: elemento con getBoundingClientRect() = {width:0, height:0}
**Causa:** El elemento está dentro de un contenedor del DOM con dimensiones 0, aunque tenga `position:fixed` y `display:flex`.  
**Solución:**
```javascript
var el = document.getElementById('miElemento');
if(el && el.parentElement !== document.body) document.body.appendChild(el);
el.style.display = 'flex';
// Para ocultar:
el.style.display = 'none';
```
**Regla:** Todo elemento que deba flotar sobre la pantalla (menú fijo, modal, pantalla dedicada) debe ser hijo directo de `document.body`.

**Afectó a:**
- Menú inferior del niño (`ownKidMenu`)
- Pantalla dedicada de mensajes del hijo (`msgDetailScreen`)

---

### Bug: `kidPlay is not defined` en `injectNavSprites`
**Causa:** Se usaba la variable `kidPlay` sin declararla.  
**Fix:**
```javascript
// Antes (MAL):
if(kidPlay) { ... }
// Después (BIEN):
const kidPlay = document.getElementById('kidPlayBtn');
if(kidPlay) { ... }
```

---

### Bug: `openEditStory is not defined`
**Causa:** La función se llama `editStory` pero se referenciaba como `openEditStory`.  
**Fix:** Reemplazar `openEditStory('${s.id}')` por `editStory('${s.id}')`.

---

### Bug: Audio se borraba al entrar a editar un cuento
**Causa:** `editStory()` hacía `appState.recordedBlob=null` al inicio.  
**Fix:** Quitar ese null, y en cambio cargar el audio existente con `dbGetAudio(id)`. Solo limpiar el audio cuando el padre empieza a grabar uno nuevo.

---

### Bug: Al editar, el paso 2 pedía regenerar imágenes obligatoriamente
**Causa:** El botón "Siguiente" del paso 2 estaba `disabled` hasta generar imágenes.  
**Fix:** En `goRecStep(2)`, si `appState._editingStoryId` existe y hay imágenes, habilitar el botón y mostrar las imágenes existentes con texto "Regenerar (opcional)".

---

## ✅ FEATURES IMPLEMENTADAS (esta sesión)

- **Menú inferior del niño** con iconos de sprites2_OWN.png (auriculares, mano escribiendo, control)
- **Pantalla dedicada para mensajes del hijo** — al tocar una card abre pantalla completa con reproductor, carrusel, descarga y quiz
- **Play directo en biblioteca del padre** — botón ▶ en cada cuento sin entrar a editar
- **Audio no se borra al editar** — se carga el existente
- **Sin cambios no guarda** — detecta si hubo modificaciones reales antes de guardar
- **Paso 2 edición** — no obliga a regenerar imágenes
- **Escenas simplificadas** — solo elegir acción (sin personaje). Última escena solo elige festejo
- **Distorsión de voz** — 3 opciones: Hada, Ogro, Dragón con preview antes de aplicar
- **Pantalla de planes detallada** — Gratis / Familia / Premium con specs
- **Campo texto extra del padre en IA** — el padre agrega su toque personal al cuento
- **Línea de progreso visual** — hitos del camino del niño con barra de avance
- **Botón nav padre → Premium** — reemplazó el de Ajustes
- **Cards de historias con textura sprite** — igual diseño que las de juegos
- **Quitar textarea texto cuento** del paso 4

---

## 🔧 PENDIENTE

- [ ] Voces distorsionadas de personajes en área IA (Hada, Ogro, Dragón)
- [ ] Favicon (404 en consola) — agregar favicon.ico al repo
- [ ] Reset contraseña padre: `UPDATE familias SET password_hash = 'pendiente' WHERE codigo = 'OWN-XXXX';`

---

## 🏗️ ARQUITECTURA

**Stack:** HTML puro + Supabase + Vercel + GitHub  
**Repo:** `OWNEstudioJ55/cuentos-magicos-propios` (privado)  
**Deploy:** `cuentos-magicos-propios.vercel.app`  
**DB:** `hqhnjyiureadmdqhgfbk.supabase.co`  
**Tablas:** `familias`, `cuentos`, `mensajes_nino`  
**Storage:** `own-audios` (privado), `own-imagenes` (público)  
**Archivos principales:** `index.html`, `app.js`, `style.css`, `api/generar-cuento.js`

---

## 📦 FLUJO DE TRABAJO

```
1. Modificar index.html / app.js con Claude
2. Descargar archivos
3. Copiar a C:\Users\sebas\cuentos-magicos-propios
4. git add . && git commit -m "mensaje max 50 chars" && git push
5. Vercel publica automáticamente
```

**Si Git rechaza:**
```
git stash && git pull --rebase && git stash pop && git push
```

---

## 🎯 CONCEPTO OWN

OWN es un osito de peluche que pasó por muchas manos y familias. El puente entre el mundo del adulto y el mundo del niño. Lo más importante es el momento después — cuando el teléfono se apaga y el recuerdo queda.
