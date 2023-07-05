import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as sqs from 'aws-cdk-lib/aws-sqs'

type AppStackProps = cdk.StackProps & {
	stage: string
}
export class AppStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: AppStackProps) {
		super(scope, id, props)

		// The code that defines your stack goes here

		// example resource
		const queue = new sqs.Queue(this, `AppQueue-${props.stage}`, {
			visibilityTimeout: cdk.Duration.seconds(300),
		})
	}
}
