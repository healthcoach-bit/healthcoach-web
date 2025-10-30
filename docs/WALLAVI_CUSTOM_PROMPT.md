# Wallavi Custom Prompt - Instrucciones de Timestamp

## Cómo Actualizar el Custom Prompt en Wallavi

Si necesitas reforzar las instrucciones de timestamp, puedes agregar esto al **Custom Prompt** en Wallavi:

### 📍 Ubicación:
1. Ve a: https://app.wallavi.com/dashboard/health-coach/wallavi/...
2. Click en **Agent Studio**
3. Sección: **Custom prompt**

---

## 📝 Instrucciones para Agregar

**AGREGAR DESPUÉS DE LAS INSTRUCCIONES EXISTENTES:**

```
---
⚠️ CRITICAL: TIMESTAMP FORMAT RULES (MUST FOLLOW EXACTLY)

When creating or updating food logs, exercise logs, or health metrics:

1. ALWAYS send timestamps as LOCAL TIME (the time the user mentions)
2. Format: YYYY-MM-DDTHH:MM:00.000Z
3. DO NOT convert to UTC - the .000Z is just a marker, NOT actual UTC
4. NEVER add or subtract hours for timezone conversion

Examples:
- User says "desayuno a las 7" → timestamp: "2025-10-29T07:00:00.000Z"
- User says "comida a la 1 PM" → timestamp: "2025-10-29T13:00:00.000Z"  
- User says "cena a las 8 PM" → timestamp: "2025-10-29T20:00:00.000Z"

Default times if user doesn't specify:
- breakfast (desayuno) = 07:00:00.000Z
- lunch (comida) = 13:00:00.000Z
- dinner (cena) = 20:00:00.000Z
- snack (colación) = current hour

WRONG EXAMPLES (DO NOT DO THIS):
- ❌ User says "7 AM" → "13:00:00.000Z" (WRONG - added 6 hours)
- ❌ User says "1 PM" → "19:00:00.000Z" (WRONG - added 6 hours)
- ❌ User says "8 PM" → "02:00:00.000Z" (WRONG - added 6 hours)

RIGHT EXAMPLES (DO THIS):
- ✅ User says "7 AM" → "07:00:00.000Z" (CORRECT - exactly as mentioned)
- ✅ User says "1 PM" → "13:00:00.000Z" (CORRECT - exactly as mentioned)
- ✅ User says "8 PM" → "20:00:00.000Z" (CORRECT - exactly as mentioned)
```

---

## 🎯 Resultado Esperado

Después de agregar estas instrucciones:

1. ✅ Wallavi siempre enviará timestamps en formato local
2. ✅ No habrá conversiones de timezone
3. ✅ Los registros aparecerán con la hora correcta en la UI
4. ✅ Consistencia total entre frontend y Wallavi

---

## ⚠️ Nota Importante

Ya tenemos `_environmentContext` implementado en el código que hace lo mismo automáticamente.

**Este Custom Prompt es solo BACKUP** por si Wallavi no respeta el `_environmentContext`.

Si ves que con el deploy actual ya funciona correctamente, **NO necesitas agregar nada al Custom Prompt**.

Pero si ves inconsistencias, agregar estas instrucciones al Custom Prompt las reforzará.

---

## 🧪 Cómo Probar

Después de actualizar el Custom Prompt (si decides hacerlo):

1. Refresca Wallavi en el browser
2. Di: "registra mi desayuno a las 7 de la mañana"
3. Verifica en la consola que el timestamp sea: `"2025-10-29T07:00:00.000Z"`
4. Verifica en la UI que aparezca "7:00 a. m."

Si ves "1:00 a. m." o "12:00 a. m.", entonces hubo conversión y necesitas agregar las instrucciones.
