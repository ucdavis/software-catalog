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

@description('Name of the Static Web App (DNS prefix)')
param swaName string
@description('Free | Standard | Standard_Zonal')
param swaSku string = 'Standard'

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

// create the website SWA
resource swa 'Microsoft.Web/staticSites@2024-11-01' = {
  name: swaName
  location: location
  sku: {
    name: swaSku
    tier: swaSku
  }
  properties: {
    allowConfigFileUpdates: true // lets the pipeline push SWA config 
  }
}

// link the Static Web App to the PostgreSQL server by allowing access to azure resources since SWA doesn't have a VNET
resource allowAzure 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2025-01-01-preview' = {
  parent: pg
  name: 'AllowAllAzure'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

output pgFqdn string = pg.properties.fullyQualifiedDomainName
output swaRegion string = swa.location
