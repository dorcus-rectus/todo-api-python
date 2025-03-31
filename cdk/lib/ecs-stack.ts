import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

interface EcsStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  dockerImageAsset: ecr_assets.DockerImageAsset;
  nlbListener: elbv2.NetworkListener;
  nlbSecurityGroup: ec2.SecurityGroup;
}

export class EcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);

    // ECSクラスター作成（マルチAZ）
    const cluster = new ecs.Cluster(this, 'EcsCluster', {
      vpc: props.vpc,
    });

    // タスク実行用IAMロール（DynamoDB利用可能な権限を付与）
    const taskRole = new iam.Role(this, 'EcsTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });
    taskRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'));

    // Fargateタスク定義の作成
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      taskRole: taskRole,
    });

    // ECRに格納したDockerイメージを利用するコンテナの追加  
    // ※main.py内でFastAPIアプリ（ポート8000）を実行する前提
    const container = taskDefinition.addContainer('AppContainer', {
      image: ecs.ContainerImage.fromDockerImageAsset(props.dockerImageAsset),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'ecs' }),
      systemControls: [
        {
          namespace: 'net.ipv4.ip_forward',
          value: '1',
        },
        {
          namespace: 'net.core.somaxconn',
          value: '1024',
        },
        {
          namespace: 'net.ipv4.tcp_keepalive_time',
          value: '300',
        },
      ],
    });
    container.addPortMappings({
      containerPort: 8000,
    });

    // ECS用のセキュリティグループを作成し、同一VPC内からのTCP:8000通信を許可
    const ecsSecurityGroup = new ec2.SecurityGroup(this, 'EcsSecurityGroup', {
      vpc: props.vpc,
      description: 'Allow inbound TCP 8000 from within the VPC',
      allowAllOutbound: true,
    });
    // VPC CIDR を指定して、同一VPC内からのアクセスを許可
    ecsSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(8000),
      'Allow inbound TCP 8000 from within the VPC'
    );
    // NLBのセキュリティグループを指定して、NLBからのアクセスを許可
    ecsSecurityGroup.addIngressRule(
      ec2.Peer.securityGroupId(props.nlbSecurityGroup.securityGroupId),
      ec2.Port.tcp(8000),
      'Allow inbound TCP 8000 from NLB security group'
    );

    // Fargateサービスの作成（プライベートサブネット配置、マルチAZ対応）
    const service = new ecs.FargateService(this, 'FargateService', {
      cluster,
      taskDefinition,
      assignPublicIp: false,
      securityGroups: [ecsSecurityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      desiredCount: 2,
    });

    // ECSサービス作成後、NLBリスナーに直接サービスを登録し、ヘルスチェック設定を追加
    props.nlbListener.addTargets('EcsTargets', {
      port: 8000,
      targets: [service],
      healthCheck: {
        path: '/health',
	healthyHttpCodes: "200", // 追加：正常時に返されるHTTPコード
        protocol: elbv2.Protocol.HTTP,
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
      },
    });
  }
}
