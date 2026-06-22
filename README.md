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
- Resumen de ganancias(cartera) para el técnico
- Carga de foto, documento y certificado con selectores nativos
- Reputación contextual y calificación en ambas direcciones
- Cierre de sesión visible desde la cuenta
- Solicitud de verificación de correo desde `Mi perfil`
- Estimado del cliente visible para técnicos en solicitudes cercanas
- Recuperación por correo, confirmación de contraseña y cambio desde perfil
- Historial separado de solicitudes y servicios asignados
- Inicio técnico dinámico según servicios activos y doble pulsación para salir en Android

El registro inicial solicita nombre, correo, contraseña y tipo de cuenta. Las fotos y
el documento se cargan después desde el perfil. La cuenta muestra su estado de
identidad: `CREATED`, `PENDING_VERIFICATION` o `VERIFIED`.

Los enlaces `https://tecn-go.com/reset-password?token=...` y
`tecngo://reset-password?token=...` se resuelven a la pantalla de nueva contraseña
cuando la aplicación no tiene una sesión activa.

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
  `app.config.ts` la configura para Google Maps en Android y iOS.
- Descarga `google-services.json` desde Firebase para la app Android
  `com.tecngo` y configura `GOOGLE_SERVICES_JSON` con su ruta.
- `src/services/notifications.ts` solicita permisos, crea el canal Android, registra el
  token FCM y maneja notificaciones foreground y pulsaciones.
- `app.config.ts` enlaza `GOOGLE_SERVICES_JSON` con `android.googleServicesFile` para
  builds EAS. Debe configurarse como variable de tipo archivo con el
  `google-services.json` de la app Android `com.tecngo`.
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

## Referidos y actualización obligatoria

El técnico dispone de **Invita y gana**, con copia y Share API. La invitación incluye
la URL de Google Play definida en `EXPO_PUBLIC_PLAY_STORE_URL` y el código que debe
digitarse durante el registro. El registro valida el código contra el backend.

Al iniciar, `AppVersionGate` consulta `/v1/app-version/check` usando
`Constants.expoConfig.version`. Una actualización obligatoria bloquea la navegación y
abre la URL configurada por ADMIN; una recomendada permite continuar. Los fallos de red
se registran localmente y nunca bloquean el acceso.

Los perfiles EAS `development` y `preview` configuran
`EXPO_PUBLIC_ENFORCE_VERSION_CHECK=false`, por lo que los APK internos no quedan
bloqueados por una versión que todavía no existe en Google Play. El perfil
`production` mantiene el control activo. Para probar un AAB de producción antes de
publicarlo, configure temporalmente en el panel web `APP_VERSION_CHECK_ENABLED=false`
o deje Android en versión mínima/última `1.0.0` con **Forzar actualización** apagado.
# TecnGo Mobile

## Sincronización en tiempo real

- FCM avisa eventos importantes y dispara invalidación selectiva de caché.
- Polling de respaldo cada 10 segundos; chat cada 5 segundos.
- Las consultas periódicas se detienen cuando la app pasa a segundo plano.
- Las pantallas fuera de foco no mantienen polling.
- Al regresar a la app o abrir una notificación se refrescan los datos relacionados.
- La API REST sigue siendo la fuente de verdad; el contenido del push no reemplaza la consulta.

## Almacenamiento seguro de sesión

El JWT se guarda en `expo-secure-store` usando almacenamiento ligado al dispositivo.
Al actualizar desde una versión anterior, la app migra una vez la sesión desde
AsyncStorage y elimina la copia antigua. AsyncStorage queda reservado para borradores
no sensibles del onboarding.

Los accesos `ADMIN` y `VERIFIER` muestran una segunda pantalla para ingresar el código
MFA enviado por correo. Cerrar sesión llama `/v1/auth/logout` y luego elimina el token
local incluso si la red no está disponible.

## Calidad

```bash
npm test
npm run test:watch
npm run test:coverage
npm run test:coverage:all
npm run typecheck
npm run doctor
```

Jest Expo y React Native Testing Library generan el reporte en `coverage/`. CodeQL y
Dependabot están configurados en `.github`.

La infraestructura compartida vive en `src/test`:

- `setup.ts`: mocks configurables para ubicación, cámara, galería, documentos,
  notificaciones, SecureStore, Maps y Sentry;
- `render.tsx`: `renderWithProviders`, sesión simulada, QueryClient aislado y
  NavigationContainer opcional;
- `fixtures.ts`: datos tipados para usuarios, perfiles, solicitudes, cotizaciones,
  categorías y notificaciones.

`npm run test:coverage` aplica el umbral obligatorio sobre los módulos incorporados
a la cobertura por etapas. `npm run test:coverage:all` mide todo `src` sin umbral y
sirve para observar la deuda real mientras se agregan pruebas de nuevos flujos.

La suite de seguridad, sesión y navegación verifica:

- persistencia del JWT en SecureStore y migración desde AsyncStorage;
- limpieza local ante logout o respuesta `401`;
- manejo de bloqueos funcionales `403` y correlation IDs;
- cambio entre modos cliente/técnico y limpieza de caché;
- control de versión previo al login;
- selección de navegación por rol y apertura de rutas desde notificaciones.

La suite de hooks y estado verifica:

- polling activo solo con pantalla enfocada y frecuencias de 10/5 segundos;
- invalidación selectiva de caché al recibir eventos FCM;
- consultas y mutaciones de solicitudes, cotizaciones y seguimiento;
- fusión incremental de chat y notificaciones sin duplicados;
- disponibilidad, perfil y cotización del técnico;
- saldo, movimientos y apertura de recargas Wompi;
- estados compartidos de carga, vacío y error.

La suite de flujos críticos verifica:

- inicio de sesión por correo, MFA, teléfono y persistencia correcta de sesión;
- registro por celular bloqueado hasta validar el OTP;
- captura de selfie y documento de identidad por ambos lados;
- onboarding profesional con categoría y experiencia obligatorias;
- creación de solicitudes usando ciudad y ubicación del perfil;
- cotización con valor COP, comentario y limpieza al cambiar de solicitud;
- calificación única, ocultamiento tras enviarla y reportes de usuarios/contenido;
- carga y consulta de evidencias y comprobantes con invalidación de caché.

La captura de cédula conserva por separado la vista previa frontal y posterior, y
solo permite volver al wizard cuando ambas imágenes fueron capturadas.

La suite de componentes y pantallas verifica:

- campos, botones, estados de carga, toast y ajuste de formularios al teclado;
- carga directa y autenticada de imágenes privadas;
- headers, footers, disponibilidad y menús de cliente/técnico;
- cambio de contraseña con confirmación y limpieza del formulario;
- exportación de datos y solicitud confirmada de anonimización;
- envío, revisión y reporte de mensajes de chat;
- apertura, lectura y eliminación de notificaciones;
- evidencias, comprobantes, denuncias y reportes de contenido;
- cotizaciones, cancelación, chat, cierre y calificación desde el detalle.

## E2E Android con Maestro

Los smoke tests viven en `.maestro/flows` y se ejecutan sobre un APK real del
perfil EAS `preview`:

```bash
eas build --platform android --profile preview
maestro test .maestro/flows/login.yaml
maestro test .maestro/flows/onboarding.yaml
maestro test .maestro/flows/create-request.yaml
maestro test .maestro/flows/quote-and-accept.yaml
```

El workflow manual `Mobile Android E2E` permite suministrar una URL de APK ya
generado o construirlo con `EXPO_TOKEN`. Ejecuta login/logout, onboarding
opcional, creación de solicitud y el flujo técnico cotiza/cliente acepta.

Antes de ejecutarlo:

- configurar en EAS `preview` las variables públicas de API, Maps y Firebase;
- crear cuentas E2E exclusivas para cliente, técnico aprobado y onboarding;
- configurar los secretos `E2E_*` y variables indicados en `.maestro/README.md`;
- mantener cliente y técnico en la misma ciudad y con ubicación compatible.

Los reportes JUnit, capturas y diagnósticos de Maestro se conservan como
artefacto de GitHub Actions durante 14 días.

## Cobertura gradual

La CI conserva el umbral estricto por métricas sobre módulos críticos y además
mide todo `src` con exclusiones para adaptadores puramente nativos, variantes
web/native, tipos y archivos de estilos.

El umbral global incremental se controla con la variable de repositorio
`MOBILE_COVERAGE_THRESHOLD`:

1. `35`: etapa actual.
2. `50`: activar cuando la cobertura global alcance 50%.
3. `65`: objetivo final.

El control gradual usa cobertura global de líneas; las métricas críticas
continúan exigiendo 75% en líneas, funciones y statements, y 65% en branches.
El directorio completo `coverage/` se publica como artefacto en cada ejecución.

## Sentry y builds de producción

La captura de errores mediante `EXPO_PUBLIC_SENTRY_DSN` funciona sin subir
sourcemaps. La subida automática está deshabilitada por defecto para que una
configuración incompleta de Sentry no bloquee la generación del AAB.

Para habilitarla, configure en EAS o en el entorno de compilación:

```text
SENTRY_UPLOAD_SOURCEMAPS=true
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

`SENTRY_ORG` y `SENTRY_PROJECT` son los slugs visibles en Sentry, no sus nombres
descriptivos. El token debe tener permisos para publicar releases y artefactos.
