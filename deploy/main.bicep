@description('Region for all resources')
param location string = resourceGroup().location

@description('DNS-friendly name – becomes <name>.postgres.database.azure.com')
param pgName string
@description('Admin username (not EMAIL) – keep lowercase, no @')
param pgAdmin string
@secure()
@description('Admin password')
param pgPassword string

@description('SKU name for the PostgreSQL server')
param pgSkuName string = 'Standard_B1ms' // Standard_B1ms | Standard_B2ms (or others)

resource pg 'Microsoft.DBforPostgreSQL/flexibleServers@2025-01-01-preview' = {
  name: pgName
  location: location
  sku: {
    name: pgSkuName
    tier: 'Burstable'
  }
  properties: {
    version: '17'
    administratorLogin: pgAdmin
    administratorLoginPassword: pgPassword
    storage: {
      storageSizeGB: 32
      autoGrow: 'Enabled'
    }
    network: {
      publicNetworkAccess: 'Enabled'
    }
  }
}

// our app database inside the PostgreSQL server
resource pgDb 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2025-01-01-preview' = {
  parent: pg
  name: 'main'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.UTF8'
  }
}

/* ─── App Service plan (Linux, B1) ───────────────────────────── */
@description('App Service plan name')
param planName string = 'app-template-plan'

resource plan 'Microsoft.Web/serverfarms@2024-11-01' = {
  name: planName
  location: location
  sku: { name: 'B1', tier: 'Basic', size: 'B1', capacity: 1 }
  kind: 'linux'
  properties: { reserved: true } // true = Linux
}

/* ─── Web App (Node 20) ──────────────────────────────────────── */
@description('Web App name')
param webName string = 'app-template-web'

resource app 'Microsoft.Web/sites@2024-11-01' = {
  name: webName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: plan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts' // built-in Node 20 runtime
      appSettings: [
        // placeholders – pipeline or portal will overwrite
        { name: 'DATABASE_URL', value: 'placeholder' }
        { name: 'PGSCHEMA', value: 'public' }
        { name: 'WEBSITE_RUN_FROM_PACKAGE', value: '0' } // remote build
      ]
    }
    httpsOnly: true
  }
}

output pgFqdn string = pg.properties.fullyQualifiedDomainName
output webHost string = app.properties.defaultHostName
