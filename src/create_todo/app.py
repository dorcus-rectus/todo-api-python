import boto3
import json
import uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('todos')

def lambda_handler(event, context):
    body = json.loads(event['body'])
    task = body['task']

    todo_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()

    item = {
        'id': todo_id,
        'task': task,
        'completed': False,
        'created_at': created_at
    }

    table.put_item(Item=item)

    return {
        'statusCode': 201,
        'body': json.dumps(item)
    }
