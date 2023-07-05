export type CDKContext = {
	appName: string
	appDescription: string
	stage: stageNameContext
	branchName: branchNameContext
	github: gitHubContext
}

export type stageNameContext = 'prod' | 'staging' | 'sandbox'
export type gitHubContext = { username: string; repo: string }
export type branchNameContext = 'main' | 'staging' | 'develop'
