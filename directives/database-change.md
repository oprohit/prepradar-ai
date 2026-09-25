# Directive: Database Change

## Objective

Apply and verify a schema or data-model change without corrupting data, bypassing authorization, or silently hiding failure.

## When to Use

- Adding tables, columns, indexes, policies, migrations, seed data, or persistence rules.

## Inputs

- Data-model requirements, migration plan, authorization model, and affected environments.

## Preconditions

- Confirm the target environment and current migration state.
- Obtain explicit confirmation before production data changes or irreversible migrations.

## Required Tools & MCPs

- **Primary:** Selected database migration/CLI tooling.
- **Preferred MCPs:** None are required; Postman/native clients may validate an exposed CRUD path.
- **Fallback:** Local SQLite/Postgres for development-only work.

## Ordered Execution Steps

1. Create an additive, backwards-compatible migration whenever possible.
2. Define authorization/RLS policies alongside the schema, not afterward.
3. Apply and test locally or in a non-production target first.
4. Update types, validation, and affected queries.
5. Record a tested reversal or recovery plan before applying destructive changes.

## Validation Steps

1. Inspect the resulting schema, indexes, and migration status.
2. Test expected reads/writes and constraint failures.
3. Test unauthorized or cross-tenant access is denied.

## Failure Handling

- **Migration conflict or lock:** stop the migration, inspect the lock/root cause, and retry only a known-safe operation.
- **Quota or connection failure:** stop remote database work; use a local development database only when it does not misrepresent production state.
- **Failed write:** return an error; never substitute fixture data as if the write persisted.

## Security & Cost Constraints

- Never commit connection strings or service-role secrets.
- Use a configured database normally when relevant; never alter billing/plan settings on the user's behalf.

## Outputs

- Repeatable migration, updated types, authorization policies, recovery plan, and verification results.

## Definition of Done

- The migration is repeatable in its target environment, constraints and authorization are verified, and recovery behavior is known.
