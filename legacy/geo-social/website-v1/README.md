# LNKZ

LNKZ is a location-based social photo sharing project. The idea is simple:
share photos with the places they belong to, then discover nearby posts through
real-world context instead of only a standard feed.

I built LNKZ to explore how social apps can feel more connected to real places
instead of only algorithmic feeds.

## Website

The repo includes a polished React landing page for presenting the project:

- Landing page with product positioning
- Feature sections for location posts, nearby discovery, profiles, tags,
  activity, and secure accounts
- How-it-works section
- Mock app preview
- Project story and technical overview
- GitHub/contact call to action

### Run the Website

```bash
npm install
npm run dev
```

Vite will print a local URL, usually `http://localhost:5173`.

### Build the Website

```bash
npm run build
```

The production build is generated in `dist/`.

## Screenshots

Add screenshots here after running the site locally.

| Landing page | Mock app preview |
| --- | --- |
| _Screenshot placeholder_ | _Screenshot placeholder_ |

## Architecture

```text
React website -> Django REST API -> PostGIS
                         |
                         +-> FastAPI upload gateway -> Celery worker
                         |
                         +-> Geo service -> geospatial place queries
```

## Core Features

- Location-based photo posts
- Nearby discovery and radius-based browsing
- User profiles and protected account flows
- Location tags backed by geospatial data
- Async upload and processing pipeline
- Secure JWT authentication

## Technical Overview

- React frontend
- Django REST backend
- FastAPI async processing
- Celery background jobs
- GeoDjango/PostGIS geospatial queries
- JWT authentication

## Service Layout

- `src/`: React/Vite marketing website
- `backend/`: Django REST + GeoDjango API for users, photos, places, and
  interactions
- `pipeline/`: FastAPI + Celery service for async upload orchestration and
  image processing
- `geo-service/`: Geospatial service for location lookup and map-oriented
  queries

## Backend Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- Java 21
- Docker Desktop

### Run Services with Docker

```bash
docker compose up --build
```

### Service URLs

- Django API: `http://localhost:8000/api/`
- FastAPI pipeline: `http://localhost:8001`
- Geo service: `http://localhost:8080/api/geo`
- PostgreSQL/PostGIS: `localhost:5432`
- Redis: `localhost:6379`

## Next Improvements

- Connect the website preview to live API data
- Build the authenticated map/feed client
- Add S3-compatible object storage for uploads
- Add real EXIF extraction and thumbnail generation
- Add observability with Prometheus or OpenTelemetry

