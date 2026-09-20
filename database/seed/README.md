# Seed data

Development and staging only for anything that looks like demo content.

`001_regions_and_menus.sql` is safe everywhere: it loads the four Tanzania regions and default public nav.

Roles and permissions are created in the identity migration (system rows, not demo users).

Never seed production with CMS passwords. Staff accounts are created by the API bootstrap / Super Admin.
