from fastapi import FastAPI, Request
from lambda_adapter import lambda_adapter
from list_todos.app  import lambda_handler as list_todos_lambda_handler
from create_todo.app import lambda_handler as create_todo_lambda_handler
from get_todo.app    import lambda_handler as get_todo_lambda_handler
from update_todo.app import lambda_handler as update_todo_lambda_handler
from delete_todo.app import lambda_handler as delete_todo_lambda_handler

app = FastAPI()

# GET /health:
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# GET /todo
@app.get("/todo")
async def list_todos(request: Request):
    return await lambda_adapter(list_todos_lambda_handler)(request)

# POST /todo
@app.post("/todo")
async def todo_get(request: Request):
    return await lambda_adapter(create_todo_lambda_handler)(request)

# GET /todo/{id}
@app.get("/todo/{id}")
async def todo_get(request: Request):
    return await lambda_adapter(get_todo_lambda_handler)(request)

# PUT /todo/{id}
@app.put("/todo/{id}")
async def todo_get(request: Request):
    return await lambda_adapter(update_todo_lambda_handler)(request)

# DELETE /todo/{id}
@app.delete("/todo/{id}")
async def todo_get(request: Request):
    return await lambda_adapter(delete_todo_lambda_handler)(request)
