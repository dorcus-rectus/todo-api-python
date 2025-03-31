import boto3
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('todos')

def lambda_handler(event, context):
    todo_id = event['pathParameters']['id']

    table.delete_item(Key={'id': todo_id})

    return {
        'statusCode': 204,
        'body': ''
    }
