import { App, Stack } from 'aws-cdk-lib'
import { execSync } from 'child_process'
import { CDKContext } from './cdk.context'

export const getCurrentGitBranch = () =>
	execSync('git symbolic-ref --short HEAD').toString().trim()

export const getCDKContext = (scope: App | Stack) => {
	const environments = scope.node.tryGetContext('environments') as [CDKContext]
	const context = environments.find(
		(env) => env.branchName === getCurrentGitBranch()
	)
	return context
}
