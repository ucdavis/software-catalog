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

@description('Container Registry name')
param acrName string = 'apptemplateacr'

@description('Container image tag (repo:tag).  Will be replaced by pipeline.')
param imageTag string = 'apptemplateweb:latest'

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

// Container Registry (ACR) for app images
resource acr 'Microsoft.ContainerRegistry/registries@2025-05-01-preview' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
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

/* ─── Web App (container host, linux) ──────────────────────────────────────── */
@description('Web App name')
param webName string = 'app-template-web'

resource app 'Microsoft.Web/sites@2024-11-01' = {
  name: webName
  location: location
  kind: 'app,linux,container'
  identity: {
    type: 'SystemAssigned' // managed identity for ACR access
  }
  properties: {
    serverFarmId: plan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acr.properties.loginServer}/${imageTag}' // <--- switch!
      acrUseManagedIdentityCreds: true
      alwaysOn: true
      // healthCheckPath: '/health' // optional but recommended
      // appCommandLine: '' // override CMD if needed
      appSettings: [
        // placeholders – pipeline or portal will overwrite
        { name: 'DATABASE_URL', value: 'placeholder' }
        { name: 'PGSCHEMA', value: 'public' }
        { name: 'WEBSITE_RUN_FROM_PACKAGE', value: '0' } // remote build
        // set port? env? TBD
      ]
    }
    httpsOnly: true
  }
}

// Role assignment – Web App → ACR (AcrPull)
resource acrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, acr.id, app.id, 'AcrPull')
  scope: acr
  properties: {
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      '7f951dda-4ed3-4680-a7ca-43fe172d538d'
    ) // AcrPull
    principalId: app.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

output pgFqdn string = pg.properties.fullyQualifiedDomainName
output webHost string = app.properties.defaultHostName
