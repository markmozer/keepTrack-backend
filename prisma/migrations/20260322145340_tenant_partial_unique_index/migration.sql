-- create partial unique index on tenant.type for value BASE.
CREATE UNIQUE INDEX "tenant_base_type_unique"
ON "Tenant" ("type")
WHERE "type" = 'BASE';