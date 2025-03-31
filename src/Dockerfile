# ベースイメージとしてpython3.9-slimを使用
FROM python:3.9-slim

# 作業ディレクトリを設定
WORKDIR /app

# ルートのrequirements.txtをコピーして依存関係をインストール
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# main.py と lambda_adapter.py をコピー
COPY main.py .
COPY lambda_adapter.py .

# 各モジュールディレクトリを、ディレクトリ名を維持してコピー
COPY create_todo/ create_todo/
COPY delete_todo/ delete_todo/
COPY get_todo/ get_todo/
COPY list_todos/ list_todos/
COPY update_todo/ update_todo/

# コンテナが使用するポートを開放（FastAPIのデフォルトポート）
EXPOSE 8000

# FastAPIアプリ(main.py内の app)をuvicornで起動
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
