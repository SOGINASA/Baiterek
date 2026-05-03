FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt ./

# Устанавливаем зависимости и gunicorn
RUN pip install --no-cache-dir -r requirements.txt gunicorn Pillow google-generativeai

# Копируем приложение
COPY . .

# Создаём папку для БД с полными правами на запись
RUN mkdir -p /app/database && chmod 777 /app/database

EXPOSE 5252

CMD ["gunicorn", "--preload", "-w", "4", "--threads", "10", "-b", "0.0.0.0:5252", "--timeout", "120", "wsgi:app"]
