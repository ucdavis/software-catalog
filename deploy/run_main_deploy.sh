#!/bin/bash

# This script deploys the Bicep template for the main infrastructure

# make sure you have the Azure CLI installed and logged in to the correct subscription

# if you don't have the resource group, create it
az group create -n app-template -l westus2

# deploy the Bicep template with parameters
az deployment group create --resource-group app-template --template-file main.bicep --parameters pgName=app-template-pg pgSkuName=Standard_B1ms swaName=app-template-web swaSku=Free
