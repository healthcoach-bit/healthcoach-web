# WebSocket Backend Implementation Guide

Este documento describe cómo implementar el backend WebSocket para el sistema de eventos en tiempo real de HealthCoach.

## Arquitectura

```
┌─────────────┐          ┌──────────────────┐          ┌─────────────┐
│   Frontend  │          │  API Gateway     │          │   Lambda    │
│  (Browser)  │◄────────►│   WebSocket      │◄────────►│  Handlers   │
└─────────────┘          └──────────────────┘          └─────────────┘
                                  │                            │
                                  ▼                            ▼
                         ┌────────────────┐          ┌─────────────┐
                         │   DynamoDB     │          │   Lambda    │
                         │  Connections   │          │   Business  │
                         └────────────────┘          │   Logic     │
                                                      └─────────────┘
```

## 1. Recursos AWS Necesarios

### 1.1 API Gateway WebSocket

Crear una API WebSocket en API Gateway con:

- **Route Selection Expression**: `$request.body.action`
- **Rutas**:
  - `$connect` → Lambda `ws-connect-handler`
  - `$disconnect` → Lambda `ws-disconnect-handler`
  - `$default` (opcional) → Lambda `ws-default-handler`

### 1.2 DynamoDB Table: Connections

```yaml
Table: healthcoach_realtime_connections
Primary Key:
  - connectionId (String, PK)
Attributes:
  - userId (String)
  - connectedAt (String, ISO 8601)
Global Secondary Index (GSI1):
  - userId (String, PK)
  - connectionId (String, SK)
TTL: 7200 seconds (2 hours)
```

### 1.3 Variables de Entorno

Todas las Lambdas necesitan:

```bash
CONNECTIONS_TABLE=healthcoach_realtime_connections
WS_API_ENDPOINT=https://<api-id>.execute-api.<region>.amazonaws.com/<stage>
```

### 1.4 Permisos IAM

Las Lambdas de negocio (createFoodLog, etc.) necesitan:

```json
{
  "Effect": "Allow",
  "Action": [
    "execute-api:ManageConnections",
    "execute-api:Invoke"
  ],
  "Resource": "arn:aws:execute-api:<region>:<account>:<api-id>/*"
}
```

## 2. Handlers WebSocket

### 2.1 $connect Handler

**Archivo**: `src/handlers/websocket/connect.ts`

```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.CONNECTIONS_TABLE!;

// Verificador JWT de Cognito
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  tokenUse: 'id',
  clientId: process.env.USER_POOL_CLIENT_ID!,
});

export const handler = async (event: any) => {
  const { connectionId } = event.requestContext;

  try {
    // Extraer token del query string
    const token = event.queryStringParameters?.token;

    if (!token) {
      return { statusCode: 401, body: 'Unauthorized: No token provided' };
    }

    // Verificar token
    const payload = await verifier.verify(token);
    const userId = payload.sub;

    if (!userId) {
      return { statusCode: 401, body: 'Unauthorized: Invalid token' };
    }

    // Guardar conexión
    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          connectionId,
          userId,
          connectedAt: new Date().toISOString(),
          ttl: Math.floor(Date.now() / 1000) + 7200, // 2 hours
        },
      })
    );

    console.log(`✅ Connection registered: ${connectionId} for user ${userId}`);

    return { statusCode: 200, body: 'Connected' };
  } catch (error) {
    console.error('Connection error:', error);
    return { statusCode: 500, body: 'Failed to connect' };
  }
};
```

**package.json dependencies**:
```json
{
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.x",
    "@aws-sdk/lib-dynamodb": "^3.x",
    "aws-jwt-verify": "^4.x"
  }
}
```

### 2.2 $disconnect Handler

**Archivo**: `src/handlers/websocket/disconnect.ts`

```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.CONNECTIONS_TABLE!;

export const handler = async (event: any) => {
  const { connectionId } = event.requestContext;

  try {
    await ddb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { connectionId },
      })
    );

    console.log(`✅ Connection deleted: ${connectionId}`);

    return { statusCode: 200, body: 'Disconnected' };
  } catch (error) {
    console.error('Disconnect error:', error);
    return { statusCode: 500, body: 'Failed to disconnect' };
  }
};
```

## 3. Utilidad: Publicar Eventos a Usuarios

**Archivo**: `src/utils/realtimeEvents.ts`

```typescript
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.CONNECTIONS_TABLE!;
const WS_ENDPOINT = process.env.WS_API_ENDPOINT!;

const apiGw = new ApiGatewayManagementApiClient({
  endpoint: WS_ENDPOINT,
});

export type RealtimeEventType =
  | 'foodLogCreated'
  | 'foodLogUpdated'
  | 'foodLogDeleted'
  | 'exerciseLogCreated'
  | 'exerciseLogUpdated'
  | 'exerciseLogDeleted'
  | 'healthMetricCreated'
  | 'healthMetricUpdated'
  | 'healthMetricDeleted'
  | 'healthProfileUpdated';

export interface RealtimeEvent {
  type: RealtimeEventType;
  data: any;
}

/**
 * Enviar evento a todas las conexiones activas de un usuario
 */
export async function publishUserEvent(
  userId: string,
  event: RealtimeEvent
): Promise<void> {
  try {
    // Buscar todas las conexiones del usuario
    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'userId = :u',
        ExpressionAttributeValues: { ':u': userId },
      })
    );

    const connections = result.Items ?? [];

    if (connections.length === 0) {
      console.log(`No active connections for user ${userId}`);
      return;
    }

    const payload = Buffer.from(JSON.stringify(event));

    // Enviar a cada conexión
    await Promise.all(
      connections.map(async (conn) => {
        const connectionId = conn.connectionId as string;

        try {
          await apiGw.send(
            new PostToConnectionCommand({
              ConnectionId: connectionId,
              Data: payload,
            })
          );

          console.log(`✅ Sent ${event.type} to ${connectionId}`);
        } catch (err: any) {
          // HTTP 410 Gone = conexión muerta, borrarla
          if (err.statusCode === 410 || err.$metadata?.httpStatusCode === 410) {
            console.log(`🗑️ Deleting stale connection: ${connectionId}`);
            await ddb.send(
              new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { connectionId },
              })
            );
          } else {
            console.error(`Error sending to ${connectionId}:`, err);
          }
        }
      })
    );
  } catch (error) {
    console.error('Error publishing event:', error);
    throw error;
  }
}
```

## 4. Integración en Lambdas de Negocio

### Ejemplo: createFoodLog

**Archivo**: `src/handlers/food-logs/create.ts`

```typescript
import { publishUserEvent } from '../../utils/realtimeEvents';

export async function handler(event: any) {
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  const body = JSON.parse(event.body);

  // ... crear el food log en DynamoDB ...
  const foodLog = await createFoodLogInDB(userId, body);

  // 🔔 Enviar evento WebSocket
  await publishUserEvent(userId, {
    type: 'foodLogCreated',
    data: foodLog,
  });

  return {
    statusCode: 201,
    body: JSON.stringify({ foodLog }),
  };
}
```

### Ejemplo: updateFoodLog

```typescript
await publishUserEvent(userId, {
  type: 'foodLogUpdated',
  data: updatedFoodLog,
});
```

### Ejemplo: deleteFoodLog

```typescript
await publishUserEvent(userId, {
  type: 'foodLogDeleted',
  data: { id: foodLogId },
});
```

## 5. CDK Stack Example

**Archivo**: `lib/websocket-stack.ts`

```typescript
import * as cdk from 'aws-cdk-lib';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class WebSocketStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const connectionsTable = new dynamodb.Table(this, 'ConnectionsTable', {
      tableName: 'healthcoach_realtime_connections',
      partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: 'ttl',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // GSI for querying by userId
    connectionsTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
    });

    // WebSocket API
    const webSocketApi = new apigatewayv2.WebSocketApi(this, 'WebSocketApi', {
      apiName: 'HealthCoachRealtimeAPI',
      description: 'WebSocket API for real-time events',
    });

    const stage = new apigatewayv2.WebSocketStage(this, 'ProdStage', {
      webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
    });

    // Connect Handler
    const connectHandler = new lambda.Function(this, 'ConnectHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'connect.handler',
      code: lambda.Code.fromAsset('dist/handlers/websocket'),
      environment: {
        CONNECTIONS_TABLE: connectionsTable.tableName,
        USER_POOL_ID: process.env.USER_POOL_ID!,
        USER_POOL_CLIENT_ID: process.env.USER_POOL_CLIENT_ID!,
      },
    });

    connectionsTable.grantWriteData(connectHandler);

    // Disconnect Handler
    const disconnectHandler = new lambda.Function(this, 'DisconnectHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'disconnect.handler',
      code: lambda.Code.fromAsset('dist/handlers/websocket'),
      environment: {
        CONNECTIONS_TABLE: connectionsTable.tableName,
      },
    });

    connectionsTable.grantWriteData(disconnectHandler);

    // Routes
    webSocketApi.addRoute('$connect', {
      integration: new apigatewayv2Integrations.WebSocketLambdaIntegration(
        'ConnectIntegration',
        connectHandler
      ),
    });

    webSocketApi.addRoute('$disconnect', {
      integration: new apigatewayv2Integrations.WebSocketLambdaIntegration(
        'DisconnectIntegration',
        disconnectHandler
      ),
    });

    // Outputs
    new cdk.CfnOutput(this, 'WebSocketURL', {
      value: `wss://${webSocketApi.apiId}.execute-api.${this.region}.amazonaws.com/${stage.stageName}`,
      description: 'WebSocket URL for frontend',
    });
  }
}
```

## 6. Testing

### Test Connection

```bash
# Install wscat
npm install -g wscat

# Connect
wscat -c "wss://your-api-id.execute-api.us-east-1.amazonaws.com/prod?token=YOUR_JWT_TOKEN"

# Should see: Connected (press CTRL+C to quit)
```

### Test Event Publishing

En CloudWatch Logs del Lambda `createFoodLog`, deberías ver:

```
✅ Sent foodLogCreated to <connectionId>
```

En el navegador con la app abierta, verás en la consola:

```
✅ WebSocket connected
🔄 Refreshed food logs (foodLogCreated)
```

## 7. Monitoreo

- **CloudWatch Metrics**:
  - Conexiones activas: Custom metric en `$connect`
  - Mensajes enviados: Logs en `publishUserEvent`
  
- **Logs importantes**:
  - Lambda `ws-connect-handler`: autenticación
  - Lambda business: eventos publicados
  - Frontend console: recepción de eventos

## 8. Próximos Pasos

Una vez implementado el backend:

1. Desplegar infraestructura CDK
2. Obtener la URL WebSocket del output
3. Configurar en frontend: `NEXT_PUBLIC_WS_URL=wss://...`
4. Probar creando logs desde Wallavi
5. Confirmar actualizaciones en tiempo real
6. Desactivar polling en hooks del frontend
