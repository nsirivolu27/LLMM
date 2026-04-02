# LNKZ

LNKZ is a geo-social photo sharing platform designed around location-aware discovery, background image processing, and geospatial search:

- `backend/`: Django REST + GeoDjango API for users, photos, places, and interactions
- `pipeline/`: FastAPI + Celery service for async upload orchestration and image processing
- `geo-service/`: Spring Boot microservice for geospatial queries backed by Hibernate Spatial

## Architecture

```text
Client -> Django REST API -> PostGIS
                    |
                    +-> FastAPI upload gateway -> Celery worker -> image processing / persistence updates
                    |
                    +-> Spring Boot geo-service -> advanced geospatial queries
```

## Core Features

- JWT-protected APIs for users and photo management
- Photo upload lifecycle with async background processing
- Place tagging with geospatial points
- Nearby feed and radius-based photo discovery
- Spring Boot geospatial service for location lookup and map-oriented queries

## Local Development

### Prerequisites

- Python 3.11+
- Java 21
- Docker Desktop

### Run with Docker

```bash
docker compose up --build
```

### Services

- Django API: `http://localhost:8000/api/`
- FastAPI pipeline: `http://localhost:8001`
- Spring Boot geo-service: `http://localhost:8080/api/geo`
- PostgreSQL/PostGIS: `localhost:5432`
- Redis: `localhost:6379`

## Resume Alignment

This repo intentionally showcases:

- Django REST Framework, GeoDjango, and PostGIS
- FastAPI and Celery for async upload handling
- Spring Boot and Hibernate Spatial
- JWT authentication and microservice-style separation

## Next Improvements

- Frontend client for map and feed views
- S3-compatible object storage for uploads
- Real EXIF extraction and thumbnail generation
- Observability with Prometheus and OpenTelemetry

