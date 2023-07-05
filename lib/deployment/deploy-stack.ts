import * as cdk from 'aws-cdk-lib'
import {
	Effect,
	OpenIdConnectPrincipal,
	OpenIdConnectProvider,
	PolicyDocument,
	PolicyStatement,
	Role,
} from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'
import { getCDKContext } from '../../utils'

export class CdkOidcDeployStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props)
		const context = getCDKContext(this)

		// enable GitHub to securely connect to your AWS account
		// https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services#adding-the-identity-provider-to-aws
		const provider = new OpenIdConnectProvider(this, 'MyProvider', {
			url: 'https://token.actions.githubusercontent.com',
			thumbprints: [
				'6938fd4d98bab03faadb97b34396831e3780aea1',
				'1c58a3a8518e8759bf075b76b750d4f2df264fcd',
			],
			clientIds: ['sts.amazonaws.com'],
		})

		const ghUsername = context?.github.username!
		const repoName = context?.github.repo!

		// Create a principal for the OpenID; which can allow it to assume deployment roles.
		// This condition is used to control access to specific resources based on the GitHub repository name and username.
		// https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services#configuring-the-role-and-trust-policy
		const GitHubPrincipal = new OpenIdConnectPrincipal(provider).withConditions(
			{
				StringLike: {
					'token.actions.githubusercontent.com:sub': `repo:${ghUsername}/${repoName}:*`,
				},
			}
		)

		new Role(this, 'GitHubActionsRole', {
			assumedBy: GitHubPrincipal,
			description:
				'Role assumed by GitHubPrincipal for deploying from CI using aws cdk',
			roleName: `${context?.appName}-github-ci-role`, // this is referenced in the github action
			maxSessionDuration: cdk.Duration.hours(1),
			inlinePolicies: {
				CdkDeploymentPolicy: new PolicyDocument({
					assignSids: true,
					statements: [
						new PolicyStatement({
							effect: Effect.ALLOW,
							actions: ['sts:AssumeRole'],
							resources: [`arn:aws:iam::${this.account}:role/cdk-*`],
						}),
					],
				}),
			},
		})
	}
}
