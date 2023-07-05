#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CdkOidcDeployStack } from '../lib/deployment/deploy-stack'
import { AppStack } from '../lib/app/app-stack'
import { getCDKContext } from '../utils'

const app = new cdk.App()

// 0. create the repo on github
// 1. bootstrap and init the cdk project
// 2. checkout to develop branch
// 3. create the ci/cd deployment stack
// 4. manually deploy to AWS so that role is created for github
// 5. push to github & set REGION env variables for main and develop branches in workflow environments
// 6. create the app stack
// 7. create the github actions workflow using ${{vars.REGION}} in th deploy step

// Deploy the CDK stack to a static account and region
new CdkOidcDeployStack(app, 'CdkOidcDeployStack', {
	env: {
		account: '842537737558',
		region: 'us-east-1',
	},
})

//IF DEPLOYING LOCALLY: npx aws-cdk deploy --exclusively AppStack --region us-east-1 --account YOUR_ACCOUNT

const context = getCDKContext(app)
console.log('context', context)

// Deploy the App stack to the same account and region as the CDK stack
new AppStack(app, 'AppStack', {
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT || '842537737558',
		region: context.region || 'us-east-1',
	},
})
