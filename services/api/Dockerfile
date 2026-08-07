FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY services/api/pyproject.toml ./
COPY services/api/app ./app
RUN pip install --no-cache-dir .
COPY services/api/alembic.ini ./
COPY services/api/migrations ./migrations
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
