import {
  aws_apigateway as apigateway,
  App,
  Duration,
  aws_lambda as lambda,
  aws_logs as logs,
  RemovalPolicy,
  Stack,
} from 'aws-cdk-lib'

export class Nuxt extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id)

    const func = new lambda.Function(this, 'function', {
      functionName: `${id}-function`,
      description: 'Hosts the NuxtJS app',
      handler: 'handler.handler',
      code: lambda.Code.fromCustomCommand('.output', ['pnpm', 'run', 'build']),
      memorySize: 128,
      runtime: lambda.Runtime.NODEJS_22_X,
      timeout: Duration.seconds(15),
      profiling: true,
      tracing: lambda.Tracing.ACTIVE,
      logGroup: new logs.LogGroup(this, `${id}-function-logs`, {
        logGroupName: `${id}-function`,
        removalPolicy: RemovalPolicy.DESTROY,
        retention: logs.RetentionDays.THREE_DAYS,
      }),
      environment: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
      },
    })

    const api = new apigateway.LambdaRestApi(this, `${id}-api`, {
      restApiName: `${id}-api`,
      description: 'API Gateway for the NuxtJS app',
      handler: func,
      proxy: true,
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.NONE,
      },
      cloudWatchRole: true,
      cloudWatchRoleRemovalPolicy: RemovalPolicy.DESTROY,
      deploy: true,
      retainDeployments: false,
      deployOptions: {
        stageName: 'v0',
        description: 'The main stage of the API',
        metricsEnabled: true,
        tracingEnabled: true,
        dataTraceEnabled: true,
        throttlingRateLimit: 100,
        throttlingBurstLimit: 100,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        accessLogDestination: new apigateway.LogGroupLogDestination(
          new logs.LogGroup(this, `${id}-api-logs`, {
            logGroupName: `${id}-api`,
            removalPolicy: RemovalPolicy.DESTROY,
            retention: logs.RetentionDays.THREE_DAYS,
          }),
        ),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          caller: true,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
      },
    })
  }
}

const app = new App()
new Nuxt(app, 'nuxt')
app.synth()
