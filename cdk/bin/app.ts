#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { EcrStack } from '../lib/ecr-stack';
import { NlbStack } from '../lib/nlb-stack';
import { EcsStack } from '../lib/ecs-stack';

const app = new cdk.App();

// VPCスタックの作成
const vpcStack = new VpcStack(app, 'VpcStack');

// Dockerイメージビルド＆ECRデプロイ用スタックの作成
const ecrStack = new EcrStack(app, 'EcrStack');

// NLBスタック（VPCはVpcStackから）
const nlbStack = new NlbStack(app, 'NlbStack', {
  vpc: vpcStack.vpc,
});

// ECSスタック（VPC、ECRのイメージ、NLBのリスナー・セキュリティグループを参照）
new EcsStack(app, 'EcsStack', {
  vpc: vpcStack.vpc,
  dockerImageAsset: ecrStack.imageAsset,
  nlbListener: nlbStack.listener,
  nlbSecurityGroup: nlbStack.nlbSecurityGroup,
});
