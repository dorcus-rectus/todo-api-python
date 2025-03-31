from fastapi import Request, Response

def lambda_adapter(lambda_handler):
    async def adapter(request: Request):
        body_bytes = await request.body()
        event = {
            "httpMethod": request.method,
            "headers": dict(request.headers),
            "queryStringParameters": dict(request.query_params),
            "pathParameters": request.path_params,
            "body": body_bytes.decode() if body_bytes else None,
        }

        context = {}

        lambda_response = lambda_handler(event, context)

        headers = lambda_response.get('headers', {})
        return Response(
            content=lambda_response.get('body', ''),
            status_code=lambda_response.get('statusCode', 200),
            headers=headers
        )
    return adapter
