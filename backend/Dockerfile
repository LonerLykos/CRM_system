FROM python:3.13-slim

LABEL maintainer='LonerLykos'
LABEL version="1.0"

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_SYSTEM_PYTHON=1 \
    UV_NO_CACHE=1 \
    PYTHONPATH=/app

WORKDIR /app

RUN apt update && \
    apt install -y --no-install-recommends gcc libmariadb-dev pkg-config && \
    rm -rf /var/lib/apt/lists/*

COPY pyproject.toml uv.lock ./

RUN uv pip install -r pyproject.toml

COPY ./backend/ .