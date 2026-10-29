# Ledger

**Stack:** NestJS · TypeORM · PostgreSQL · decimal.js

Libro contable de **doble partida** como servicio. Registra movimientos de
dinero entre cuentas de forma auditable y consistente. Cada transferencia genera
dos asientos (débito + crédito) por el mismo monto; si no balancean, se rechaza.

- **Nada se pierde ni se duplica** — cada movimiento es una operación atómica.
- **La plata siempre cuadra** — débito y crédito por el mismo monto; si no, el sistema rechaza.
- **Todo es auditable** — se puede reconstruir la historia de cada cuenta asiento por asiento.

| Capacidad                        | Para qué sirve en el negocio                                           |
| -------------------------------- | ---------------------------------------------------------------------- |
| **Crear cuentas**                | Abrir cuentas para usuarios y comercios (billeteras, cuentas internas) |
| **Activar / suspender cuentas**  | Controlar quién puede operar y quién no (compliance, fraude)           |
| **Registrar transacciones**      | Guardar cualquier movimiento contable de forma inmutable               |
| **Transferencias entre cuentas** | Mover plata de una cuenta a otra de forma atómica y balanceada         |
| **Consultar saldos e historial** | Ver el estado actual y reconstruir el pasado                           |

### Ejemplos de uso

- **Fintech / Billetera digital**:
  Usuario A le transfiere USD 100 a usuario B → el ledger registra el débito de A y el crédito de B en **una sola operación**.
- **Marketplace**:
  La plata del comprador se mueve a una cuenta "escrow" y luego al vendedor, con comisión retenida — todo trazable.
- **Sistema de pagos**:
  Registrar el depósito del banco, la liquidación al comercio, y la comisión — cada paso como un asiento separado y auditable.

### Fuera de alcance hoy

- No procesa pagos con tarjetas ni se conecta a bancos.
- No hace conversión de monedas (cada movimiento es en una sola moneda).
- No es un sistema de fraude ni de scoring de crédito.
- No expone una UI — es la **infraestructura** sobre la que se construye un producto.

---

## 🏗️ System Design

**Doble partida:** toda transacción tiene débitos y créditos por el mismo monto. `Σ débitos = Σ créditos` se valida **en el dominio**, no en la DB.

### Arquitectura hexagonal

**Dominio:**

- `Transaction` es un aggregate: garantiza que sus asientos balanceen.
- `Account` es su propio aggregate con ciclo de vida (INACTIVE → ACTIVE → SUSPENDED → CLOSED).
- `Entry` es la unidad mínima del ledger.
- `Money`, `Currency`, `EntityId` son value objects que validan al construirse.

#### Estructura

```
src/
├── domain/          entidades, VOs, errores, interfaces de repo
├── application/     use cases, DTOs, PostingService
├── infrastructure/  ORM entities, mappers, repos TypeORM
├── presentation/    controllers
└── shared/          config, logger, health, database
```

### Separación Account / Transaction (bounded contexts)

- `Account` responde _¿quién puede operar y con qué saldo?_
- `Transaction` responde _¿qué pasó y entre quiénes?_

Se conectan mediante `PostingService`, que es el único lugar donde una transacción
toca los saldos. Esta separación permite:

- Escalar lecturas de cuentas (cacheables) y escrituras de transacciones por separado.
- Auditar transacciones sin bloquear consultas de saldo.
- Futuro: proyecciones de saldo en un read model distinto (CQRS real).

### Entry

La unidad mínima del ledger. Cada entry es `{ accountId, direction (DEBIT|CREDIT), amount, currency }`.

- **No es aggregate root**: vive dentro de `Transaction` y hereda su identidad (`transactionId`).
- **Inmutable**: se crea vinculada a la transacción y no se modifica después.
- **Regla de balanceo**: toda transacción válida tiene **≥2 entries** y `Σ débitos = Σ créditos` (misma moneda).
- **Sign convention**: `applyDebit` suma saldo, `applyCredit` resta.
- **Fuente de verdad**: `Account.balance` es una **materialización** de la suma de sus entries. Ante duda, los entries son el registro histórico real.

### Roadmap de diseño (lo que sigue)

1. **UnitOfWork transaccional** para postings.
2. **Idempotencia de transferencias**.
3. **Reversión de transacciones**.
4. **Read models CQRS** para reportes y conciliación.
5. **Sign convention por tipo de cuenta** (hoy solo ASSET/EXPENSE están correctos;
   LIABILITY/EQUITY/REVENUE requieren invertir DEBIT/CREDIT — ver TODO en el código).

### Flujo de una transferencia (end-to-end)

```
POST /transfers
   │
   ▼
TransfersController.create(dto)
   │
   ▼
TransferUseCase.execute(dto)
   ├─ valida same-account
   ├─ carga source + dest vía AccountRepository
   ├─ valida status/currency
   ├─ construye Money
   ├─ verifica saldo suficiente
   ├─ crea Transaction DRAFT con 2 entries (debit dest, credit source)
   └─ delega a PostingService.post(tx)
        ├─ tx.post() → valida balance + status
        ├─ carga cuentas afectadas
        ├─ aplica entry.amount a cada cuenta
        └─ persiste tx + cuentas
   │
   ▼
Transaction (POSTED)
```

---

## Técnico

### Arranque

```bash
pnpm install
docker compose -f .docker/docker-compose.yml up -d
cp .env.example .env
pnpm db:migrate
pnpm start:dev
```

### Endpoints

| Método | Path                     | Qué hace                                                                                |
| ------ | ------------------------ | --------------------------------------------------------------------------------------- |
| GET    | `/health`                | Health general (DB + memoria)                                                           |
| GET    | `/health/liveness`       | Proceso vivo (k8s liveness)                                                             |
| GET    | `/health/readiness`      | Proceso + DB (k8s readiness)                                                            |
| POST   | `/accounts`              | Crear cuenta `{ ownerId, type, currencyCode }`                                          |
| GET    | `/accounts`              | Listar cuentas (opcional `?type=`)                                                      |
| GET    | `/accounts/:id`          | Obtener una cuenta                                                                      |
| POST   | `/accounts/:id/activate` | Activar cuenta                                                                          |
| POST   | `/transactions`          | Crear transacción DRAFT con `entries[]`                                                 |
| POST   | `/transactions/:id/post` | Postear DRAFT (valida balance y aplica a saldos)                                        |
| GET    | `/transactions/:id`      | Obtener transacción con sus entries                                                     |
| POST   | `/transfers`             | Transferir `{ sourceAccountId, destinationAccountId, amount, currencyCode, reference }` |

### Testing

```bash
./.scripts/test-endpoints.sh    # suite completa (curl + jq)
pnpm test                        # unit
pnpm test:e2e
```
