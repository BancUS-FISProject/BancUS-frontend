# BancUS Frontend (React + Vite)

Interfaz web para la demo de microservicios BancUS. Consume:
- Cuentas y autenticación a través del API Gateway (`http://localhost:10000/v1`).
- Tarjetas y transferencias contra sus servicios desplegados aparte (puertos propios).

## Requisitos
- Node.js 18+ y npm
- Backend levantado (ver abajo)

## Arranque rápido
```bash
cd BancUS-frontend
npm install
# Dev con HMR
npm run dev
# Build producción
npm run build && npm run preview
```
Por defecto apunta a `http://localhost:10000/v1`. Puedes ajustar la URL base con variables de entorno.

## Variables de entorno
- `VITE_API_BASE_URL` (opcional): base para gateway (`http://localhost:10000/v1` por defecto).
- `VITE_TRANSFERS_API_BASE_URL` (opcional): base para microservice-transfers (`http://localhost:8001/v1` por defecto).

## Backend esperado
- **API Gateway** (nginx) en `:10000`, con upstreams activos para:
  - `accounts` → `/accounts`
  - `user-auth` → `/user-auth` (login, registro, perfil, patch)
- **Tarjetas**: servicio `microservice-cards` desplegado aparte (puerto 3000 por defecto en su repo). El gateway actual no lo expone; ajústalo o apunta el front a ese host/puerto.
- **Transferencias**: servicio `microservice-transfers` desplegado aparte en `:8001` (o la URL que definas en `VITE_TRANSFERS_API_BASE_URL`); no pasa por el gateway.

Para levantar todo lo del gateway:
```bash
cd api-gateway
docker compose up -d
# si actualizas imágenes, añade --pull o --build y --force-recreate
```
Para transfers (si no está detrás del gateway), levántalo en su repo y expón `http://localhost:8001/v1`.

## Flujos principales del front
- **Login/Registro**: `/user-auth/auth/login` y `/user-auth/users`. Guarda token en `localStorage` (`authToken`) y perfil en `authUser` (incluye IBAN).
- **Perfil**: consulta y actualiza datos de usuario por IBAN mediante `/user-auth/users/{identifier}` y PATCH.
- **Cuentas**: peticiones al gateway sobre `/accounts`.
- **Tarjetas**: peticiones al servicio de tarjetas (expón su puerto y, si quieres, proxéalo en el gateway).
- **Transferencias**: peticiones a `VITE_TRANSFERS_API_BASE_URL` (`/transactions` en `:8001` por defecto).

Si algún microservicio no está disponible, ciertas pantallas mostrarán datos estáticos o errores controlados.

## Notas
- Token JWT se lee de `localStorage` y se envía en `Authorization: Bearer` cuando existe.
- IBAN se genera en backend; el front no lo envía en el alta.
- Para limpiar estado local, borra `authToken` y `authUser` del `localStorage`.
