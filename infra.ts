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
      handler: 'server/index.handler',

      //
      code: lambda.Code.fromCustomCommand('.output', ['pnpx', 'nuxt', 'build']),
      memorySize: 128,
      runtime: lambda.Runtime.NODEJS_20_X, // profiling not supported for NODEJS_22_X
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

    // Rest API
    const rest = new apigateway.LambdaRestApi(this, `${id}-rest`, {
      restApiName: `${id}-rest`,
      description: 'Proxy API for OpenAI requests',
      // Deployment
      deploy: true,
      retainDeployments: false,
      handler: func,
      // Method
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.NONE,
      },
      deployOptions: {
        // Throttling
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
        // Debugging
        metricsEnabled: true,
        tracingEnabled: true,
        dataTraceEnabled: true,
        // Logging
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        accessLogDestination: new apigateway.LogGroupLogDestination(
          new logs.LogGroup(this, `${id}-rest-access-log`, {
            logGroupName: `${id}-rest-access`,
            retention: logs.RetentionDays.THREE_DAYS,
            removalPolicy: RemovalPolicy.DESTROY,
          }),
        ),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          ip: true,
          caller: true,
          user: true,
          requestTime: true,
          httpMethod: true,
          resourcePath: true,
          status: true,
          protocol: true,
          responseLength: true,
        }),
        // OpenAI API Key
        variables: {
          OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
        },
      },
      // Cloudwatch
      cloudWatchRole: true,
      cloudWatchRoleRemovalPolicy: RemovalPolicy.DESTROY,
    })

    // Removal policy, clean up!
    rest.applyRemovalPolicy(RemovalPolicy.DESTROY)

    // Gets the stage. Used later for metrics
    const stage = apigateway.Stage.fromStageAttributes(this, `${id}-stage`, {
      stageName: 'v0',
      restApi: rest,
    })

    // Undocumented hack that allows you to create the execution log before
    // performing the first request. The log group is created only on the first
    // request by API Gateway. By creating one with the same name as the log
    // group, we can ensure that the log group is created before the first
    // request and apply all configurations we want.
    const _log = new logs.LogGroup(this, `${id}-rest-logs`, {
      logGroupName: `API-Gateway-Execution-Logs_${rest.restApiId}/${stage.stageName}`,
      retention: logs.RetentionDays.THREE_DAYS,
      removalPolicy: RemovalPolicy.DESTROY,
    })
  }
}

const app = new App()
new Nuxt(app, 'nuxt')
app.synth()
