# Folder structure

```
gm-safaris/
├── apps/
│   ├── api/                 # Node.js Express API
│   ├── cms/                 # Admin/CMS frontend
│   └── website-com/         # Public gmsafaris.com site
├── packages/
│   ├── shared-types/        # Domain enums & constants
│   ├── shared-validation/   # Shared validators
│   ├── shared-utils/        # Pure helpers
│   └── shared-config/       # Environment config loader
├── database/
│   ├── migrations/
│   ├── seed/
│   └── documentation/
├── infrastructure/
│   ├── nginx/
│   ├── docker/
│   └── deployment/
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   ├── security/
│   ├── migration/
│   ├── troubleshooting/
│   └── decisions/
├── scripts/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── api/
│   ├── security/
│   ├── e2e/
│   └── performance/
├── .env.example
├── package.json             # npm workspaces root
└── README.md
```

## API module pattern

```
apps/api/src/modules/<domain>/
├── <domain>.routes.js
├── <domain>.controller.js
├── <domain>.service.js
├── <domain>.repository.js
├── <domain>.validation.js
├── <domain>.cache.js        # when caching applies
├── <domain>.permissions.js  # when RBAC applies
└── index.js
```

Only create files with a clear responsibility. Small modules may omit unused layers.
