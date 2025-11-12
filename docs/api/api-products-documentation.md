# Products API Documentation

## Overview

The Products API provides comprehensive CRUD operations for product management in the Kiotviet system. It supports multi-tenant architecture with company-level isolation, inventory tracking, and advanced search capabilities.

**Base URL**: `http://localhost:8080/api/products`

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Data Models

### ProductCreateRequest

```json
{
  "sku": "string (required, max 100 chars)",
  "name": "string (required, max 255 chars)",
  "barcode": "string (optional, max 50 chars)",
  "description": "string (optional, max 2000 chars)",
  "sellingPrice": "decimal (required, > 0)",
  "costPrice": "decimal (required, > 0)",
  "onHand": "integer (optional, default 0, >= 0)",
  "minLevel": "integer (optional, default 0, >= 0)",
  "maxLevel": "integer (optional, default 0, >= 0)",
  "status": "ACTIVE|INACTIVE|DISCONTINUED (optional, default ACTIVE)",
  "isTracked": "boolean (optional, default true)",
  "categoryId": "long (optional)",
  "supplierId": "long (optional)",
  "brandId": "long (optional)"
}
```

### ProductUpdateRequest

Same fields as ProductCreateRequest but all are optional for partial updates.

### ProductDto

```json
{
  "id": "long",
  "sku": "string",
  "name": "string",
  "barcode": "string",
  "description": "string",
  "sellingPrice": "decimal",
  "costPrice": "decimal",
  "profitAmount": "decimal",
  "profitMargin": "decimal",
  "onHand": "integer",
  "minLevel": "integer",
  "maxLevel": "integer",
  "status": "ACTIVE|INACTIVE|DISCONTINUED",
  "isTracked": "boolean",
  "stockStatus": "string",
  "needsReorder": "boolean",
  "reorderQuantity": "integer",
  "isAvailable": "boolean",
  "category": "CategoryDto",
  "supplier": "SupplierDto",
  "brand": "BrandDto",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### ProductAutocompleteItem

```json
{
  "id": "long",
  "sku": "string",
  "name": "string",
  "displayName": "string",
  "barcode": "string",
  "onHand": "integer",
  "isAvailable": "boolean",
  "sellingPrice": "string"
}
```

## Endpoints

### 1. List Products

**GET** `/api/products`

Retrieve paginated list of products with optional filtering and sorting.

**Query Parameters:**
- `search` (optional): Search term for name, SKU, or barcode
- `categoryId` (optional): Filter by category ID
- `supplierId` (optional): Filter by supplier ID
- `brandId` (optional): Filter by brand ID
- `status` (optional): Filter by status (ACTIVE, INACTIVE, DISCONTINUED)
- `tracked` (optional): Filter by inventory tracking status (true/false)
- `page` (optional): Page number, default 0
- `size` (optional): Page size, default 20
- `sortBy` (optional): Sort field, default "name"
- `sortDir` (optional): Sort direction, default "asc"

**Response:** `SuccessResponse<Page<ProductDto>>`

**Example:**
```bash
GET /api/products?search=laptop&status=ACTIVE&page=0&size=10&sortBy=name&sortDir=asc
```

### 2. Get Product by ID

**GET** `/api/products/{id}`

Retrieve a single product by its ID.

**Path Parameters:**
- `id` (required): Product ID

**Response:** `SuccessResponse<ProductDto>`

### 3. Create Product

**POST** `/api/products`

Create a new product.

**Request Body:** `ProductCreateRequest`

**Response:** `SuccessResponse<ProductDto>` (HTTP 201)

**Business Rules:**
- SKU must be unique within the company
- Barcode must be unique within the company (if provided)
- Selling price must be greater than cost price
- Maximum level must be greater than minimum level (if both provided)

### 4. Update Product

**PUT** `/api/products/{id}`

Update an existing product.

**Path Parameters:**
- `id` (required): Product ID

**Request Body:** `ProductUpdateRequest`

**Response:** `SuccessResponse<ProductDto>`

**Note:** All fields are optional for partial updates.

### 5. Delete Product

**DELETE** `/api/products/{id}`

Soft delete a product (marks as discontinued).

**Path Parameters:**
- `id` (required): Product ID

**Response:** `SuccessResponse<string>`

### 6. Product Autocomplete

**GET** `/api/products/autocomplete`

Get products for autocomplete/dropdown functionality.

**Query Parameters:**
- `query` (required): Search query
- `limit` (optional): Maximum results, default 10

**Response:** `SuccessResponse<List<ProductAutocompleteItem>>`

### 7. Get Low Stock Products

**GET** `/api/products/low-stock`

Get products that are at or below minimum stock level.

**Response:** `SuccessResponse<List<ProductDto>>`

### 8. Get Out of Stock Products

**GET** `/api/products/out-of-stock`

Get products with zero stock.

**Response:** `SuccessResponse<List<ProductDto>>`

### 9. Get Overstocked Products

**GET** `/api/products/overstocked`

Get products that exceed maximum stock level.

**Response:** `SuccessResponse<List<ProductDto>>`

### 10. Get Products by Price Range

**GET** `/api/products/price-range`

Get products within a specific price range.

**Query Parameters:**
- `minPrice` (required): Minimum price
- `maxPrice` (required): Maximum price

**Response:** `SuccessResponse<List<ProductDto>>`

### 11. Get Products by Category

**GET** `/api/products/category/{categoryId}`

Get products in a specific category.

**Path Parameters:**
- `categoryId` (required): Category ID

**Query Parameters:** Standard pagination parameters

**Response:** `SuccessResponse<Page<ProductDto>>`

### 12. Get Products by Supplier

**GET** `/api/products/supplier/{supplierId}`

Get products from a specific supplier.

**Path Parameters:**
- `supplierId` (required): Supplier ID

**Query Parameters:** Standard pagination parameters

**Response:** `SuccessResponse<Page<ProductDto>>`

### 13. Get Products by Brand

**GET** `/api/products/brand/{brandId}`

Get products from a specific brand.

**Path Parameters:**
- `brandId` (required): Brand ID

**Query Parameters:** Standard pagination parameters

**Response:** `SuccessResponse<Page<ProductDto>>`

### 14. Get Active Products

**GET** `/api/products/active`

Get only active products.

**Query Parameters:** Standard pagination parameters

**Response:** `SuccessResponse<Page<ProductDto>>`

## Business Logic

### Stock Status Calculations

The API automatically calculates stock-related fields:

- **isAvailable**: Product is active and has stock
- **stockStatus**: "In Stock", "Low Stock", "Overstocked", "Out of Stock", or "Not Tracked"
- **needsReorder**: True if stock is at or below minimum level
- **reorderQuantity**: Suggested quantity to reach maximum level

### Profit Calculations

- **profitAmount**: Selling price - Cost price
- **profitMargin**: (Profit / Cost price) * 100

### Validation Rules

1. **Uniqueness**: SKU and barcode must be unique per company
2. **Pricing**: Selling price must be greater than cost price
3. **Inventory**: All quantity fields must be non-negative
4. **Levels**: Maximum level must be greater than minimum level

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- **400 Bad Request**: Validation errors or invalid data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate SKU or barcode
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

### Create a Product

```bash
curl -X POST http://localhost:8080/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "LAPTOP-001",
    "name": "Business Laptop",
    "description": "High-performance business laptop",
    "sellingPrice": 999.99,
    "costPrice": 650.00,
    "onHand": 25,
    "minLevel": 5,
    "maxLevel": 50,
    "categoryId": 1,
    "brandId": 1
  }'
```

### Search Products

```bash
curl -X GET "http://localhost:8080/api/products?search=laptop&status=ACTIVE&page=0&size=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Low Stock Alerts

```bash
curl -X GET http://localhost:8080/api/products/low-stock \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Stock Levels

```bash
curl -X PUT http://localhost:8080/api/products/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "onHand": 15,
    "minLevel": 3,
    "maxLevel": 40
  }'
```

## Rate Limiting

Currently, no rate limiting is implemented, but it's recommended for production use.

## Pagination

All list endpoints support pagination:

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