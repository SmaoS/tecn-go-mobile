# Maestro Android smoke tests

Los flujos se ejecutan contra el APK generado con el perfil EAS `preview`.
Requieren cuentas y datos dedicados de E2E; no deben usar usuarios reales.

Orden recomendado:

```bash
maestro test .maestro/flows/login.yaml
maestro test .maestro/flows/onboarding.yaml
maestro test .maestro/flows/create-request.yaml
maestro test .maestro/flows/quote-and-accept.yaml
```

Variables obligatorias:

- `E2E_CLIENT_EMAIL`, `E2E_CLIENT_PASSWORD`
- `E2E_TECHNICIAN_EMAIL`, `E2E_TECHNICIAN_PASSWORD`
- `E2E_ONBOARDING_EMAIL`, `E2E_ONBOARDING_PASSWORD`
- datos `E2E_ONBOARDING_*`
- `E2E_SERVICE_CATEGORY`, `E2E_REQUEST_DESCRIPTION`, `E2E_REQUEST_ADDRESS`
- `E2E_REQUEST_ESTIMATED_PRICE`, `E2E_QUOTE_PRICE`, `E2E_QUOTE_COMMENT`

La cuenta de onboarding debe existir sin pasos completados. El técnico debe estar
aprobado, disponible, ubicado en la misma ciudad y con saldo/reglas habilitadas
para cotizar.
