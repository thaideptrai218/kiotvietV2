# Brands API Documentation

## Overview

The Brands API provides comprehensive CRUD operations for brand management in the Kiotviet system. It supports multi-tenant architecture with company-level isolation and search capabilities.

**Base URL**: `http://localhost:8080/api/brands`

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Data Models

### BrandCreateRequest

```json
{
  "name": "string (required, max 255 chars)",
  "description": "string (optional, max 2000 chars)",
  "website": "string (optional, valid URL, max 500 chars)",
  "logoUrl": "string (optional, max 500 chars)",
  "isActive": "boolean (optional, default true)"
}
```

### BrandUpdateRequest

Same fields as BrandCreateRequest but all are optional for partial updates.

### BrandDto

```json
{
  "id": "long",
  "name": "string",
  "description": "string",
  "website": "string",
  "displayWebsite": "string",
  "logoUrl": "string",
  "isActive": "boolean",
  "hasLogo": "boolean",
  "hasWebsite": "boolean",
  "isComplete": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### BrandAutocompleteItem

```json
{
  "id": "long",
  "name": "string",
  "displayName": "string",
  "isActive": "boolean",
  "website": "string"
}
```

## Endpoints

### 1. List Brands

**GET** `/api/brands`

Retrieve paginated list of brands with optional filtering and sorting.

**Query Parameters:**
- `search` (optional): Search term for name or description
- `active` (optional): Filter by active status (true/false)
- `page` (optional): Page number, default 0
- `size` (optional): Page size, default 20
- `sortBy` (optional): Sort field, default "name"
- `sortDir` (optional): Sort direction, default "asc"

**Response:** `SuccessResponse<Page<BrandDto>>`

**Example:**
```bash
GET /api/brands?search=apple&active=true&page=0&size=10&sortBy=name&sortDir=asc
```

### 2. Get Brand by ID

**GET** `/api/brands/{id}`

Retrieve a single brand by its ID.

**Path Parameters:**
- `id` (required): Brand ID

**Response:** `SuccessResponse<BrandDto>`

### 3. Create Brand

**POST** `/api/brands`

Create a new brand.

**Request Body:** `BrandCreateRequest`

**Response:** `SuccessResponse<BrandDto>` (HTTP 201)

**Business Rules:**
- Brand name must be unique within the company
- Website must be a valid URL format (if provided)

### 4. Update Brand

**PUT** `/api/brands/{id}`

Update an existing brand.

**Path Parameters:**
- `id` (required): Brand ID

**Request Body:** `BrandUpdateRequest`

**Response:** `SuccessResponse<BrandDto>`

**Note:** All fields are optional for partial updates.

### 5. Delete Brand

**DELETE** `/api/brands/{id}`

Soft delete a brand (marks as inactive).

**Path Parameters:**
- `id` (required): Brand ID

**Response:** `SuccessResponse<string>`

### 6. Get Active Brands

**GET** `/api/brands/active`

Get all active brands without pagination.

**Response:** `SuccessResponse<List<BrandDto>>`

### 7. Brand Autocomplete

**GET** `/api/brands/autocomplete`

Get brands for autocomplete/dropdown functionality.

**Query Parameters:**
- `query` (required): Search query
- `limit` (optional): Maximum results, default 10

**Response:** `SuccessResponse<List<BrandAutocompleteItem>>`

### 8. Get Brands with Website

**GET** `/api/brands/with-website`

Get brands that have website information.

**Response:** `SuccessResponse<List<BrandDto>>`

### 9. Get Brands with Logo

**GET** `/api/brands/with-logo`

Get brands that have logo images.

**Response:** `SuccessResponse<List<BrandDto>>`

### 10. Get Active Brands List

**GET** `/api/brands/active/list`

Alternative endpoint to get all active brands without pagination.

**Response:** `SuccessResponse<List<BrandDto>>`

## Business Logic

### Brand Status

- **isActive**: Controls whether the brand is available for use
- **hasLogo**: True if logoUrl is provided and not empty
- **hasWebsite**: True if website is provided and not empty
- **isComplete**: True if brand has name, description, and website
- **displayWebsite**: Website URL without protocol (e.g., "www.example.com")

### Validation Rules

1. **Uniqueness**: Brand name must be unique per company
2. **URL Validation**: Website must be a valid URL format (if provided)
3. **Length Limits**: All string fields have maximum length constraints

### Search Functionality

- Searches across brand name and description fields
- Case-insensitive partial matching
- Returns results sorted by brand name

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- **400 Bad Request**: Validation errors or invalid data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Brand not found
- **409 Conflict**: Duplicate brand name
- **500 Internal Server Error**: Server error

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Usage Examples

### Create a Brand

```bash
curl -X POST http://localhost:8080/api/brands \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Apple",
    "description": "Technology company known for iPhone and Mac computers",
    "website": "https://www.apple.com",
    "logoUrl": "https://example.com/logos/apple.png",
    "isActive": true
  }'
```

### Search Brands

```bash
curl -X GET "http://localhost:8080/api/brands?search=apple&active=true&page=0&size=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Brands for Autocomplete

```bash
curl -X GET "http://localhost:8080/api/brands/autocomplete?query=sam&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Brand Information

```bash
curl -X PUT http://localhost:8080/api/brands/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description: Apple is an American multinational technology company",
    "website": "https://www.apple.com/updated"
  }'
```

### Deactivate a Brand

```bash
curl -X PUT http://localhost:8080/api/brands/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

### Get Brands with Complete Information

```bash
curl -X GET http://localhost:8080/api/brands/with-website \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Filtering and Sorting

### Available Sort Fields
- `name`: Brand name (default)
- `createdAt`: Creation date
- `updatedAt`: Last update date

### Filtering Options
- `active=true|false`: Filter by activation status
- `search=<query>`: Search in name and description

**Examples:**
```bash
# Get inactive brands sorted by creation date
GET /api/brands?active=false&sortBy=createdAt&sortDir=desc

# Search for brands with "tech" in name/description
GET /api/brands?search=tech&page=0&size=20
```

## Rate Limiting

Currently, no rate limiting is implemented, but it's recommended for production use.

## Pagination

List endpoints support pagination:

- `page`: 0-based page index
- `size`: Number of items per page (max 100)
- `sortBy`: Field to sort by
- `sortDir`: Sort direction ("asc" or "desc")

**Response includes:**
- `content`: Array of items
- `totalElements`: Total number of items
- `totalPages`: Total number of pages
- `size`: Page size
- `number`: Current page number

## Integration with Products

Brands can be associated with products through the `brandId` field in product creation/update operations. When a brand is deactivated, existing products will still reference the brand but the brand will appear as inactive.

## Data Consistency

- Brand names are case-insensitive unique checks
- Deleting a brand soft deletes (sets isActive = false)
- All brand operations are company-scoped for multi-tenant isolation