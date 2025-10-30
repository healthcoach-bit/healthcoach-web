# Backend: DELETE Health Profile Endpoint

El frontend ya tiene la funcionalidad para borrar perfiles. Necesitas agregar el endpoint DELETE en el backend.

---

## 📍 Ubicación del Handler

Archivo: `healthcoach-api/lambda/handlers/healthProfile.ts`

---

## ✅ Código para Agregar

Agrega este caso al switch del handler principal:

```typescript
case 'DELETE':
  return await handleDelete(event, userId);
```

Luego agrega esta función:

```typescript
async function handleDelete(
  event: any,
  userId: string
): Promise<APIGatewayProxyResult> {
  try {
    console.log('🗑️ Deleting health profile for user:', userId);

    await dynamoDB.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          userId: userId,
        },
      })
    );

    console.log('✅ Health profile deleted successfully');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      },
      body: JSON.stringify({
        message: 'Health profile deleted successfully',
      }),
    };
  } catch (error: any) {
    console.error('❌ Error deleting health profile:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      },
      body: JSON.stringify({
        error: 'Failed to delete health profile',
        message: error.message,
      }),
    };
  }
}
```

---

## 🔧 Asegúrate de Importar

Verifica que tengas el import de DeleteCommand:

```typescript
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand,
  DeleteCommand  // ⬅️ Agregar esto
} from '@aws-sdk/lib-dynamodb';
```

---

## 🌐 OpenAPI Spec

Agrega al `openapi.yaml` en la sección `/health-profile`:

```yaml
  /health-profile:
    get:
      # ... existing GET config ...
    
    post:
      # ... existing POST config ...
    
    delete:
      summary: Delete health profile
      description: Deletes the authenticated user's health profile
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Health profile deleted successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: "Health profile deleted successfully"
        '401':
          description: Unauthorized
        '500':
          description: Internal server error
```

---

## 🧪 Testing

Después de implementar:

1. **Deploy el backend**
2. **Abre la app** en el frontend
3. **Ve a Health Profile**
4. **Click en "🗑️ Borrar Perfil (Testing)"**
5. **Confirma** en el modal
6. **Verifica**:
   - Perfil borrado de DynamoDB
   - Redirect a dashboard
   - Wallavi muestra onboarding en próxima sesión

---

## 📊 DynamoDB

**Tabla:** `healthcoach-health-profile`

**Key Schema:** 
- `userId` (HASH)

**Operación:**
```typescript
DeleteCommand({
  TableName: 'healthcoach-health-profile',
  Key: { userId: '<user-id>' }
})
```

---

## ⚠️ Notas Importantes

- ✅ **No requiere confirmación adicional** - ya está en el frontend
- ✅ **userId viene del token** - no necesita validación extra
- ✅ **CORS configurado** - permite DELETE desde frontend
- ✅ **Idempotente** - si no existe perfil, no falla
- ⚠️ **Permanente** - no hay "soft delete"

---

## 🔍 Troubleshooting

### Error: "Method not allowed"
- Verifica que el case 'DELETE' esté agregado
- Confirma que API Gateway permita DELETE

### Error: "ResourceNotFoundException"
- Normal si el usuario no tiene perfil
- Retorna 200 de todas formas (idempotente)

### Error: "Access denied"
- Verifica permisos IAM del Lambda
- Debe tener `dynamodb:DeleteItem`

---

## ✨ Resultado Final

Después de implementar:

```bash
# Usuario borra perfil desde UI
DELETE /health-profile
Authorization: Bearer <token>

# Response
{
  "message": "Health profile deleted successfully"
}

# Frontend:
- Redirect a /dashboard
- React Query invalida cache
- useHealthProfile() retorna null
- WallaviAuth detecta perfil faltante
- Wallavi muestra onboarding
```

**¡Listo para probar el onboarding conversacional!** 🎉
