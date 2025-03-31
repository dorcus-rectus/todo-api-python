import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets';

export class EcrStack extends cdk.Stack {
  // DockerImageAssetが作成したイメージを後続スタックで利用
  public readonly imageAsset: ecr_assets.DockerImageAsset;
  
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Dockerfileが配置されているディレクトリ（ここではプロジェクトルート）からDockerイメージをビルド  
    // repositoryNameを指定すると、新規のプライベートECRリポジトリが作成されます
    this.imageAsset = new ecr_assets.DockerImageAsset(this, 'TodoApiImage', {
      directory: '../src', // Dockerfileのあるディレクトリ
    });
  }
}
