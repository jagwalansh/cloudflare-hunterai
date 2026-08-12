FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copy requirements file first to cache dependency installation
COPY requirements.txt /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all remaining backend files
COPY . /app/

EXPOSE 8000

# Start production server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
