# Graph Report - C:\Users\nsiri\OneDrive\Documents\Playground\LNKZ  (2026-09-03)

## Corpus Check
- Corpus is ~2,908 words - fits in a single context window. You may not need a graph.

## Summary
- 217 nodes · 325 edges · 25 communities (20 shown, 5 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 63 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Legacy Service Stack
- Frontend Dependencies
- TypeScript Configuration
- Photo Data Model
- Java Security Layer
- Geo Query API
- Place Persistence Model
- Upload Processing Pipeline
- Account API
- Legacy React Website
- Spring Boot Entry
- Account App Config
- Photo App Config
- Maven Wrapper
- Geo Service Build

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `PlaceEntity` - 14 edges
3. `Photo` - 12 edges
4. `Place` - 11 edges
5. `Like` - 11 edges
6. `PhotoViewSet` - 11 edges
7. `LNKZ Project` - 11 edges
8. `User` - 10 edges
9. `PlaceSerializer` - 10 edges
10. `LikeViewSet` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Django REST API` --semantically_similar_to--> `Django 5.1.5`  [INFERRED] [semantically similar]
  README.md → backend/requirements.txt
- `FastAPI Upload Gateway` --semantically_similar_to--> `FastAPI 0.115.6`  [INFERRED] [semantically similar]
  README.md → pipeline/requirements.txt
- `Celery Worker` --semantically_similar_to--> `Celery 5.4.0`  [INFERRED] [semantically similar]
  README.md → pipeline/requirements.txt
- `Location-Based Social Photo Sharing` --semantically_similar_to--> `Location-Based Social Photo App`  [INFERRED] [semantically similar]
  README.md → index.html
- `React Website` --semantically_similar_to--> `LNKZ Web Document`  [INFERRED] [semantically similar]
  README.md → index.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **LNKZ Compose Service Topology** — docker_compose_db_service, docker_compose_redis_service, docker_compose_backend_service, docker_compose_pipeline_service, docker_compose_worker_service, docker_compose_geo_service [EXTRACTED 1.00]
- **LNKZ Async Upload Flow** — readme_async_upload_processing_pipeline, readme_fastapi_upload_gateway, readme_celery_worker [EXTRACTED 1.00]
- **LNKZ Geospatial Data Path** — readme_geodjango, readme_postgis, readme_geo_service, docker_compose_db_service, geo_service_src_main_resources_application_postgresql_datasource, geo_service_src_main_resources_application_hibernate_spatial_postgis_dialect [INFERRED 0.85]

## Communities (25 total, 5 thin omitted)

### Community 0 - "Legacy Service Stack"
Cohesion: 0.07
Nodes (45): Django 5.1.5, django-filter 24.3, Django REST Framework 3.15.2, Django REST Framework SimpleJWT 5.3.1, Backend Python Dependency Manifest, Pillow 11.0.0, psycopg 3.2.3, Backend Service (+37 more)

### Community 1 - "Frontend Dependencies"
Cohesion: 0.09
Nodes (22): lucide-react, dependencies, lucide-react, react, react-dom, typescript, vite, @vitejs/plugin-react (+14 more)

### Community 2 - "TypeScript Configuration"
Cohesion: 0.09
Nodes (22): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowJs, allowSyntheticDefaultImports, esModuleInterop (+14 more)

### Community 3 - "Photo Data Model"
Cohesion: 0.29
Nodes (12): Like, Meta, Photo, Place, Status, LikeSerializer, Meta, PhotoSerializer (+4 more)

### Community 4 - "Java Security Layer"
Cohesion: 0.18
Nodes (13): Bean, Component, Configuration, EnableWebSecurity, FilterChain, JwtAuthenticationFilter, SecurityConfig, HttpSecurity (+5 more)

### Community 5 - "Geo Query API"
Cohesion: 0.22
Nodes (8): PlaceRepository, GeoController, PlaceResponse, GetMapping, JpaRepository, Query, RequestMapping, RestController

### Community 6 - "Place Persistence Model"
Cohesion: 0.20
Nodes (4): Entity, PlaceEntity, Point, Table

### Community 7 - "Upload Processing Pipeline"
Cohesion: 0.23
Nodes (8): BaseModel, Settings, enqueue_upload(), UploadRequest, UploadResponse, _db_connection(), process_upload(), Simulates thumbnail creation and persistence updates.     In a production versio

### Community 8 - "Account API"
Cohesion: 0.38
Nodes (7): AbstractUser, User, Meta, RegisterSerializer, UserSerializer, ProfileView, RegisterView

### Community 9 - "Legacy React Website"
Cohesion: 0.33
Nodes (3): features, stack, steps

## Knowledge Gaps
- **50 isolated node(s):** `Status`, `Meta`, `com.lnkz:geo-service`, `name`, `version` (+45 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PlaceEntity` connect `Place Persistence Model` to `Geo Query API`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `PhotoViewSet` connect `Photo Data Model` to `Place Persistence Model`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `PlaceSerializer` connect `Photo Data Model` to `Place Persistence Model`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `Photo` (e.g. with `LikeSerializer` and `Meta`) actually correct?**
  _`Photo` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `Place` (e.g. with `LikeSerializer` and `Meta`) actually correct?**
  _`Place` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `Like` (e.g. with `LikeSerializer` and `Meta`) actually correct?**
  _`Like` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Status`, `Meta`, `com.lnkz:geo-service` to the rest of the system?**
  _50 weakly-connected nodes found - possible documentation gaps or missing edges._