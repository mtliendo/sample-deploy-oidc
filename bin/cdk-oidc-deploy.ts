#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CdkOidcDeployStack } from '../lib/deployment/deploy-stack'
import { AppStack } from '../lib/app/app-stack'
import { getCDKContext } from '../utils'

const app = new cdk.App()

// 1. bootstrap and init the cdk project
// 2. checkout to develop branch
// 3. create the ci/cd deployment stack and context file
// 4. manually deploy to AWS so that role is created for github
// 5. push to github, add protection rule for main branch
// 6. create the multi-region app stack using context file
// 7. create the github actions workflow
// 8. deploy develop branch, verify action success and stack creation
// 9. merge to main branch, verify action success and stack creation

// Deploy the CDK stack to a static account and region
const context = getCDKContext(app)
new CdkOidcDeployStack(app, 'CdkOidcDeployStack', {
	env: {
		account: '842537737558',
		region: 'us-east-1',
	},
})

//IF DEPLOYING LOCALLY: npx aws-cdk deploy --exclusively AppStack --region us-east-1 --account YOUR_ACCOUNT

console.log('the context', context)

// Deploy the App stack to the same account and region as the CDK stack

new AppStack(
	app,
	`AppStack`,
	{
		env: {
			account: context.account,
			region: context.region,
		},
	},
	context
)
