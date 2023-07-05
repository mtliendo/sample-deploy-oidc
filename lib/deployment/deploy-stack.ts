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

type CdkOidcDeployStackProps = cdk.StackProps & {
	appName: string
}

export class CdkOidcDeployStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: CdkOidcDeployStackProps) {
		super(scope, id, props)

		// enable GitHub to securely connect to your AWS account
		// https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services#adding-the-identity-provider-to-aws
		const provider = new OpenIdConnectProvider(this, 'MyProvider', {
			url: 'https://token.actions.githubusercontent.com',
			clientIds: ['sts.amazonaws.com'],
		})

		const ghUsername = 'mtliendo'
		const repoName = 'sample-deploy-oidc'

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
			roleName: `${props.appName}-github-ci-role`, // this is referenced in the github action
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
