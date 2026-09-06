# Troubleshooting — Database

1. Can the API host reach `DATABASE_HOST:DATABASE_PORT`?
2. Credentials and database name correct?
3. SSL required in this environment?
4. Migrations applied?
5. Application role privileges sufficient (not superuser in prod)?
6. Check constraints / unique violations in logs (never expose SQL to clients)?

PostgreSQL must not be publicly reachable.
