import { execSync } from 'child_process'

export const getCurrentGitBranch = () =>
	execSync('git symbolic-ref --short HEAD').toString().trim()
