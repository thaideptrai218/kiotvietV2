# API Testing Guide

## Quick Setup

1. **Get JWT Token**: First authenticate to get your JWT token:
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "username": "your-username",
       "password": "your-password"
     }'
   ```

2. **Update Variables**: Edit the `.http` files and replace:
   - `{{token}}`: Your JWT token from step 1
   - `{{companyId}}`: Your company ID (will be returned in login response)

3. **Run Tests**: Use VS Code REST Client extension or other HTTP client to run the requests.

## Test Files

### `products-api.http`
- ✅ 32 test scenarios covering all product operations
- ✅ CRUD operations, search, filtering, inventory management
- ✅ Error testing and unauthorized access tests
- ✅ Bulk operations and edge cases

### `brands-api.http`
- ✅ 32 test scenarios covering all brand operations
- ✅ CRUD operations, search, autocomplete, filtering
- ✅ Error testing and validation scenarios
- ✅ Multi-brand creation and management tests

## Recommended Test Order

### Products API
1. **Authentication**: Test unauthorized access (tests #28-30)
2. **Create Products**: Tests #1-3 (basic creation)
3. **Read Operations**: Tests #4-10 (listing, filtering, single get)
4. **Update Operations**: Tests #11-12 (updates)
5. **Search & Autocomplete**: Tests #13-16
6. **Inventory Management**: Tests #17-20
7. **Error Scenarios**: Tests #22-27
8. **Bulk Operations**: Tests #21

### Brands API
1. **Authentication**: Test unauthorized access (tests #30-32)
2. **Create Brands**: Tests #1-4 (basic creation)
3. **Read Operations**: Tests #4-11 (listing, filtering, single get)
4. **Search & Autocomplete**: Tests #15-18
5. **Filtering**: Tests #19-22
6. **Bulk Operations**: Tests #23
7. **Error Scenarios**: Tests #24-29
8. **Status Management**: Tests #12-14

## Expected Results

- **Successful operations**: Return 200-201 status codes with proper response format
- **Validation errors**: Return 400 with descriptive error messages
- **Authentication errors**: Return 401 for missing/invalid tokens
- **Not found**: Return 404 for non-existent resources
- **Duplicate errors**: Return 409 for duplicate SKUs or brand names

## Tips for Testing

1. **Use the sample data**: The V5 migration includes 5 sample brands (Apple, Samsung, Sony, LG, Xiaomi)
2. **Check database**: Verify data persistence between requests
3. **Test edge cases**: Empty strings, negative numbers, duplicate values
4. **Test pagination**: Large page sizes, invalid page numbers
5. **Test search**: Partial matches, case sensitivity, special characters

## Troubleshooting

- **401 Unauthorized**: Check your JWT token is valid and not expired
- **404 Not Found**: Ensure the database is migrated and contains data
- **400 Bad Request**: Check request body format and required fields
- **500 Internal Error**: Check application logs for detailed error information

## Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "timestamp": "2024-01-01T12:00:00Z"
}
```