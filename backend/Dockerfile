FROM python:3.12-slim

LABEL maintainer='LonerLykos'
LABEL version="1.0"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    POETRY_VERSION=2.1.3 \
    POETRY_NO_INTERACTION=1 \
    DEBIAN_FRONTEND=noninteractive \
    PYTHONPATH=/app/auth_service

WORKDIR /app

RUN apt update && \
    apt install -y gcc libmariadb-dev pkg-config && \
    pip install poetry==$POETRY_VERSION && \
    rm -rf /var/lib/apt/lists/*

COPY pyproject.toml /app/

RUN poetry config virtualenvs.create false && \
    poetry lock && \
    poetry install --no-root
