import boto3
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('todos')

def lambda_handler(event, context):
    todo_id = event['pathParameters']['id']
    body = json.loads(event['body'])

    update_expression = "SET task = :task, completed = :completed"
    expression_values = {
        ':task': body['task'],
        ':completed': body['completed']
    }

    response = table.update_item(
        Key={'id': todo_id},
        UpdateExpression=update_expression,
        ExpressionAttributeValues=expression_values,
        ReturnValues="ALL_NEW"
        )

    return {
        'statusCode': 200,
        'body': json.dumps(response['Attributes'])
    }
