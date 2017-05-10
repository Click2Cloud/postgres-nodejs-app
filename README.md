# Day Planner App

## Introduction
Get hands-on and learn how to build and deploy PostgreSQL Database Services and Node.JS appplication on Azure.

<a href="https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FClick2Cloud%2Fpostgres-nodejs-app%2Fmaster%2Fazuredeploy.json" target="_blank">
    <img src="http://azuredeploy.net/deploybutton.png"/>
</a>

## Pre-requisites for the Lab
If you don't have an Azure subscription, create a [free account](https://azure.microsoft.com/en-us/free/?WT.mc_id=A261C142F) before you begin.

## Deployment Instructions
Perform following steps to Deploy Nodejs web application in Azure and connect it to PostgreSQL.

1. Click on __Deploy to Azure__, It will redirect you to custom deployment window of Azure Portal.
2. Select __Subscription__ type for Web Application deployment.
3. Create new or use existing __Resource Group__. An Azure resource group is a logical container into which Azure resources like web apps, databases and storage accounts are deployed and managed.
4. Select __Location__ from available locations for web application deployment.
5. Select __App Service Plan__.It is Pricing model for hosting application, default value for this is __F1__ represent free service.
6. __Worker Size__ is the size of instances
7. __Repo Url__ is Github repository url of web application, you don't need to change it.
8. __Branch__ is branch name of Github repository, you don't need to change it.

    <img src="https://github.com/Click2Cloud/postgres-nodejs-app/blob/master/public/stylesheets/azure_deploy.png"/>

9. __Postgre SQL Compute Unit__
10. __Postgre SQL Storage GB__ is the size of physical memory (in GB) for PostgreSQL Database.
11. __Administrator Login__ is username for PostgreSQL Database.
12. __Administrator Login Password__ is password for PostgreSQL Database. It must contain character from three of the following categories – English uppercase letters, English lowercase letters, number (0-9), and non-alphanumeric characters (!, $, #, %).
13. Select __Postgre SQL Version__ for PostgreSQL Database.
14. Select __Postgre SQL Location__ from available locations for PostgreSQL Database.
15. Mark Check __I agree to the terms and conditions stated above__ checkbox. 
16. Click on __Purchase__ button.

It will take few minutes to deploy web application and create PostgreSQL Database, after successful deployment you can browse web application.


## Clean up

To clean up the Azure assets:

1. Login to the Azure portal.
2. Delete the resource group created as part of the deployment – It will have the same name as the prefix used as part of the deployment step. Internally this will delete all the child resources created in Azure.
