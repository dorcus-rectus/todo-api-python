import boto3
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('todos')

def lambda_handler(event, context):
    response = table.scan()

    items = response.get('Items', [])

    return {
        'statusCode': 200,
        'body': json.dumps(items)
    }
