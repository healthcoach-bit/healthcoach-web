# WebSocket Real-time Events - Setup Guide

## ¿Qué hace esta funcionalidad?

Permite que el dashboard se actualice automáticamente cuando:
- Wallavi crea un nuevo registro de comida
- Otro usuario/cliente modifica datos
- Se crean ejercicios o métricas de salud

**Sin WebSocket**: La app hace polling cada 8 segundos para buscar actualizaciones.  
**Con WebSocket**: Los cambios aparecen instantáneamente sin recargar la página.

## Componentes implementados (Frontend)

### 1. RealtimeProvider
**Ubicación**: `components/RealtimeProvider.tsx`

- Conecta WebSocket usando `NEXT_PUBLIC_WS_URL`
- Autentica con JWT de Cognito
- Reconexión automática si se cae
- Escucha eventos del backend y actualiza React Query

### 2. Integración en el layout
**Ubicación**: `app/layout.tsx`

El provider envuelve toda la app para que cualquier página reciba eventos en tiempo real.

### 3. Eventos soportados

| Evento | Acción |
|--------|--------|
| `foodLogCreated` | Refresca lista de comidas |
| `foodLogUpdated` | Refresca lista de comidas |
| `foodLogDeleted` | Refresca lista de comidas |
| `exerciseLogCreated` | Refresca lista de ejercicios |
| `exerciseLogUpdated` | Refresca lista de ejercicios |
| `exerciseLogDeleted` | Refresca lista de ejercicios |
| `healthMetricCreated` | Refresca métricas de salud |
| `healthMetricUpdated` | Refresca métricas de salud |
| `healthMetricDeleted` | Refresca métricas de salud |
| `healthProfileUpdated` | Refresca perfil de salud |

## Setup paso a paso

### Paso 1: Implementar backend

Sigue la guía completa en: [`docs/WEBSOCKET_BACKEND.md`](./WEBSOCKET_BACKEND.md)

Resumen rápido:
1. Crear API Gateway WebSocket
2. Crear tabla DynamoDB para conexiones
3. Implementar handlers `$connect` y `$disconnect`
4. Añadir función `publishUserEvent` en tus Lambdas de negocio

### Paso 2: Obtener URL WebSocket

Después de desplegar el backend, obtendrás una URL como:

```
wss://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
```

### Paso 3: Configurar frontend

1. **Editar `.env.local`**:
   ```bash
   NEXT_PUBLIC_WS_URL=wss://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
   ```

2. **Reiniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

### Paso 4: Verificar funcionamiento

1. Abrir navegador en `http://localhost:3000/dashboard`
2. Abrir consola del navegador (F12)
3. Deberías ver:
   ```
   ✅ WebSocket connected
   ```

4. Crear un registro desde Wallavi (ej: "registra un desayuno")
5. En la consola verás:
   ```
   🔄 Refreshed food logs (foodLogCreated)
   ```
6. El dashboard se actualiza sin recargar

## Comportamiento fallback

Si `NEXT_PUBLIC_WS_URL` no está configurado:

- La app sigue funcionando normalmente
- Usa polling cada 8 segundos (comportamiento anterior)
- Se muestra warning en consola:
  ```
  RealtimeProvider: NEXT_PUBLIC_WS_URL not configured
  ```

## Debugging

### El WebSocket no conecta

1. **Verificar URL**:
   ```bash
   echo $NEXT_PUBLIC_WS_URL
   ```

2. **Test manual con wscat**:
   ```bash
   npm install -g wscat
   wscat -c "$NEXT_PUBLIC_WS_URL?token=YOUR_JWT_TOKEN"
   ```

3. **Revisar CloudWatch Logs**:
   - Lambda `ws-connect-handler`: errores de autenticación
   - Lambda `ws-disconnect-handler`: desconexiones

### Los eventos no llegan

1. **Verificar backend emite eventos**:
   - Busca en CloudWatch logs del Lambda (ej: `createFoodLog`)
   - Debe haber línea: `✅ Sent foodLogCreated to <connectionId>`

2. **Verificar frontend recibe**:
   - Abrir consola del navegador
   - Debe aparecer: `🔄 Refreshed food logs (foodLogCreated)`

3. **Verificar token válido**:
   - El token JWT expira después de 1 hora
   - `RealtimeProvider` reconecta automáticamente con token fresco

## Próximos pasos (opcional)

Una vez que el WebSocket funcione bien:

### Desactivar polling

En `hooks/useFoodLogs.ts`, `hooks/useExercise.ts`, etc.:

```typescript
// Comentar o quitar:
// refetchInterval: 8000,
```

Mantener:
```typescript
refetchOnWindowFocus: true,  // Refresca al volver a la pestaña
refetchOnReconnect: true,    // Refresca si recupera internet
```

### Añadir más eventos

Si creas nuevos recursos (ej: `habits`, `goals`):

1. Backend: emitir eventos `habitCreated`, etc.
2. Frontend: añadir casos en `RealtimeProvider.tsx`

## Monitoreo en producción

- **CloudWatch Dashboard**: Conexiones activas, mensajes enviados
- **Logs frontend**: Mensajes en consola del navegador
- **Alertas**: Si tasa de error > 5% en `PostToConnection`

## Referencias

- [Documentación backend completa](./WEBSOCKET_BACKEND.md)
- [API Gateway WebSocket - AWS Docs](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html)
- [WebSocket API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
