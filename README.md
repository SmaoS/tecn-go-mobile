# TecnGo Mobile

La aplicación mantiene funciones operativas: loaders, domicilio, selección de imágenes,
disponibilidad GPS del técnico cada 10 segundos y consulta de la ubicación del técnico
asignado. La edición de parámetros permanece solo en Web Admin.

Aplicación móvil del MVP construida con React Native 0.81, Expo SDK 54 y TypeScript.

## Arquitectura

- `src/navigation`: navegadores `Auth`, `Client`, `Technician` y `Staff`.
- `src/features`: pantallas, APIs, hooks y componentes agrupados por funcionalidad.
- `src/context`: sesión, restauración del JWT y cierre de sesión.
- `src/shared`: estados remotos y manejo común de errores.
- `src/components`: componentes visuales reutilizables.

TanStack Query administra caché, polling, loading, errores e invalidaciones. Las
pantallas conservan localmente únicamente formularios y estado de interacción.

## Pantallas

- Login y registro básico conectados a la API
- Home del cliente
- Solicitud de servicio
- Técnicos cercanos con mapa preparado
- Detalle de solicitud
- Chat básico
- Calificación
- Perfil y cierre de sesión
- Registro y navegación diferenciados para cliente y técnico
- Perfil técnico con estado de aprobación
- Solicitudes disponibles, aceptación y cambio de estado técnico
- Categorías activas y selección múltiple de oficios técnicos
- Ubicación manual o GPS mediante `expo-location`
- Filtro por radio, múltiples cotizaciones y selección de una oferta por el cliente
- Chat persistente y lista de notificaciones
- Registro del token nativo FCM en Android
- Seguimiento con llegada del técnico y actualización de estado
- Confirmación de pago en efectivo y calificación después del estado `PAID`
- Resumen de ganancias para el técnico
- Carga de foto, documento y certificado con selectores nativos
- Reputación contextual y calificación en ambas direcciones
- Cierre de sesión visible desde la cuenta
- Solicitud de verificación de correo desde `Mi perfil`
- Estimado del cliente visible para técnicos en solicitudes cercanas

El registro inicial solicita nombre, correo, contraseña y tipo de cuenta. Las fotos y
el documento se cargan después desde el perfil. La cuenta muestra su estado de
identidad: `CREATED`, `PENDING_VERIFICATION` o `VERIFIED`.

## Requisitos

- Node.js 22.22.2 LTS
- npm 10+
- Expo Go o emulador Android/iOS

## Ejecución

```bash
cp .env.example .env
npm install
npm start
```

Para Android Emulator, `10.0.2.2` apunta al localhost del equipo anfitrión. En un
dispositivo físico, cambia `EXPO_PUBLIC_API_URL` por la IP LAN del equipo, por ejemplo
`http://192.168.1.20:8080/api`.

## Mapas y notificaciones

- Define `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` antes de generar un build nativo.
- Descarga `google-services.json` desde Firebase para la app Android
  `com.tecngo.app` y configura `GOOGLE_SERVICES_JSON` con su ruta.
- `src/services/notifications.ts` solicita permisos, crea el canal Android, registra el
  token FCM y maneja notificaciones foreground y pulsaciones.
- Configura `EAS_PROJECT_ID`; las credenciales Firebase deben permanecer fuera de Git.
- Expo Go permite probar la interfaz, pero mapas y push deben verificarse finalmente en
  un development build.

## Comandos

```bash
npm run android
npm run ios
npm run web
npm run typecheck
npm run doctor
```

El rol y el estado de verificación se conservan junto con la sesión JWT. Un técnico
debe cargar su documento, ser verificado y luego ser aprobado por un administrador
antes de ver o aceptar solicitudes publicadas.

La ubicación GPS y las notificaciones requieren permisos en tiempo de ejecución. También puede ingresarse
latitud y longitud manualmente para pruebas en simulador o web.

El token push nativo Android se registra en `/users/me/fcm-token`. La recepción remota
debe probarse en un development build con Firebase configurado; Expo Go no cubre el
flujo FCM nativo completo. Al pulsar una notificación de chat se abre el chat, y una
nueva solicitud dirige al técnico a solicitudes disponibles.

TanStack Query actualiza solicitudes y notificaciones cada 10 segundos y el chat cada
5 segundos. Al cerrar sesión se limpia completamente el caché remoto.

## EAS y producción

La app requiere `EXPO_PUBLIC_API_URL=https://BACKEND_RAILWAY/api`; no contiene fallback
a localhost. Configura `EAS_PROJECT_ID` y crea las variables para los entornos
`development`, `preview` y `production` en Expo.

```bash
npm install --global eas-cli
eas login
eas init
eas build --platform android --profile preview
eas build --platform all --profile production
```

`eas.json` incluye perfiles de desarrollo, preview y tiendas. Un `401` elimina la
sesión persistida y devuelve la navegación al login.

## Evidencias y captura de perfil

`ServiceSupportScreen` usa hooks para evidencias, comprobantes y denuncias. Las
pantallas legales permiten aceptar cada versión activa. `CaptureProfilePhotoScreen`
usa `expo-camera` y cámara frontal.

En Expo managed no se incluyó ML Kit: la foto queda
`profilePhotoFaceValidated=false` y requiere revisión manual. No hay reconocimiento de
identidad ni comparación con el documento.

Al crear una solicitud se pueden tomar fotos con la cámara o elegir varias desde la
galería. La categoría se compacta después de seleccionarla. Las notificaciones
conservan `route` y `requestId`: términos abre la pantalla legal, `NEW_REQUEST` abre
solicitudes disponibles y los mensajes abren el chat.
