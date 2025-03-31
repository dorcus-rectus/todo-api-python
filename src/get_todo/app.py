import boto3
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('todos')

def lambda_handler(event, context):
    todo_id = event['pathParameters']['id']

    response = table.get_item(Key={'id': todo_id})

    item = response.get('Item')
    if not item:
        return {
            'statusCode': 404,
            'body': json.dumps({'message': 'ToDo not found'})
        }

    return {
        'statusCode': 200,
        'body': json.dumps(item)
    }
