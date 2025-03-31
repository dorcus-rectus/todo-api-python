import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

interface NlbStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class NlbStack extends cdk.Stack {
  public readonly loadBalancer: elbv2.NetworkLoadBalancer;
  // NLB自体はセキュリティグループを持たないため、バックエンドに適用するためのセキュリティグループを作成
  public readonly nlbSecurityGroup: ec2.SecurityGroup;
  public readonly listener: elbv2.NetworkListener;
  
  constructor(scope: Construct, id: string, props: NlbStackProps) {
    super(scope, id, props);

    // セキュリティグループ（例：ECSのターゲット用）
    this.nlbSecurityGroup = new ec2.SecurityGroup(this, 'NlbSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for ECS targets behind the NLB',
      allowAllOutbound: true,
    });

    // VPC内からのHTTPを許可
    this.nlbSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(80),
      'Allow inbound HTTP from within the VPC'
    );

    // プライベートサブネット（isolated）にNLBを作成、マルチAZ対応
    this.loadBalancer = new elbv2.NetworkLoadBalancer(this, 'MyNLB', {
      vpc: props.vpc,
      internetFacing: false,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      crossZoneEnabled: true,
      securityGroups: [this.nlbSecurityGroup]
    });

    // リスナーの作成（例としてTCPポート80）
    this.listener = this.loadBalancer.addListener('Listener', {
      port: 80,
      protocol: elbv2.Protocol.TCP,
    });
  }
}
