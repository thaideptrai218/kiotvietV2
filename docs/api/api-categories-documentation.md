# Categories API Documentation

**For Frontend Developers** - Complete guide to implementing category tree interface

## Table of Contents
1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Data Models](#data-models)
4. [Endpoints](#endpoints)
5. [Tree Implementation Guide](#tree-implementation-guide)
6. [Error Handling](#error-handling)
7. [JavaScript Examples](#javascript-examples)

---

## API Overview

The Categories API provides hierarchical category management with support for:
- Multi-level category trees (up to 10 levels deep)
- Materialized path structure for efficient queries
- CRUD operations with validation
- Search and filtering capabilities
- Drag-and-drop reordering support

**Base URL**: `http://localhost:8080/api/categories`
**Content-Type**: `application/json`
**Authentication**: JWT Bearer Token required

---

## Authentication

All endpoints require JWT authentication. Include the Authorization header:

```javascript
const accessToken = "your-jwt-access-token";

headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

### Getting Access Token

```javascript
// Login to get JWT token
const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: "Thaihbvn218",
    password: "Thaihbvn218@"
  })
});

const { data } = await loginResponse.json();
const accessToken = data.accessToken; // Use this for API calls
```

---

## Data Models

### CategoryDto (Response Model)

```json
{
  "id": 1,
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "path": "/electronics",
  "level": 0,
  "sortOrder": 1,
  "color": "#007bff",
  "icon": "fas fa-laptop",
  "isActive": true,
  "createdAt": "2025-11-11T14:02:47",
  "updatedAt": "2025-11-11T14:02:47",
  "displayName": "Electronics",
  "fullPathName": " electronics",
  "parentId": null,
  "isRoot": true,
  "isLeaf": false,
  "descendantCount": 3
}
```

#### Field Explanations

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Unique category identifier |
| `name` | String | Category display name |
| `description` | String | Category description |
| `path` | String | Materialized path (e.g., `/electronics/mobile-phones`) |
| `level` | Integer | Tree depth level (0 = root) |
| `sortOrder` | Integer | Order among siblings |
| `color` | String | Hex color code for UI |
| `icon` | String | Font Awesome icon class |
| `isActive` | Boolean | Whether category is enabled |
| `parentId` | Integer/Null | Parent category ID (null for root) |
| `isRoot` | Boolean | True if this is a root category |
| `isLeaf` | Boolean | True if this has no children |
| `descendantCount` | Integer | Number of direct and indirect descendants |
| `fullPathName` | String | Human-readable breadcrumb path |

### CategoryTreeDto (Full List Response)

```json
{
  "categories": [...],      // Array of all categories (flat list)
  "rootCategories": [...], // Array of only root-level categories
  "totalCategories": 6,
  "maxDepth": 3,
  "hasHierarchy": true
}
```

---

## Endpoints

### 1. Get All Categories

**GET** `/api/categories`

Returns all categories with hierarchy metadata. Ideal for building complete tree structure.

```javascript
const response = await fetch('/api/categories', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const { data } = await response.json();
// data.categories - flat list of all categories
// data.rootCategories - only root level categories
```

**Response Example**:
```json
{
  "httpCode": 200,
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Electronics",
        "path": "/electronics",
        "level": 0,
        "parentId": null,
        "isRoot": true,
        "isLeaf": false,
        "descendantCount": 3,
        "fullPathName": " electronics"
      },
      {
        "id": 3,
        "name": "Mobile Phones",
        "path": "/electronics/mobile-phones",
        "level": 1,
        "parentId": 1,
        "isRoot": false,
        "isLeaf": false,
        "descendantCount": 1,
        "fullPathName": " electronics > mobile-phones"
      }
    ],
    "rootCategories": [...],
    "totalCategories": 6,
    "maxDepth": 3,
    "hasHierarchy": true
  }
}
```

### 2. Get Root Categories

**GET** `/api/categories/root`

Returns only top-level categories. Perfect for initial tree load.

```javascript
const response = await fetch('/api/categories/root', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### 3. Get Category Children

**GET** `/api/categories/{id}/children`

Returns direct children of a specific category. Use for lazy loading.

```javascript
const response = await fetch('/api/categories/1/children', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### 4. Get Single Category

**GET** `/api/categories/{id}`

Returns detailed information about a specific category.

```javascript
const response = await fetch('/api/categories/1', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### 5. Search Categories

**GET** `/api/categories/search?query={searchTerm}`

Search categories by name and description.

```javascript
const searchTerm = 'phone';
const response = await fetch(`/api/categories/search?query=${searchTerm}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### 6. Create Category

**POST** `/api/categories`

Creates a new category. For subcategories, include `parentId`.

```javascript
// Root category
const rootCategory = {
  "name": "Clothing",
  "description": "Apparel and fashion items",
  "color": "#17a2b8",
  "icon": "fas fa-tshirt"
};

// Subcategory
const subCategory = {
  "name": "Men's Clothing",
  "description": "Clothing for men",
  "color": "#6c757d",
  "icon": "fas fa-user-tie",
  "parentId": 7  // ID of parent category
};

const response = await fetch('/api/categories', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(subCategory)
});
```

### 7. Update Category

**PUT** `/api/categories/{id}`

Updates an existing category.

```javascript
const updateData = {
  "name": "Updated Category Name",
  "description": "Updated description",
  "color": "#28a745"
};

const response = await fetch('/api/categories/1', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updateData)
});
```

### 8. Move Category

**PUT** `/api/categories/{id}/move`

Moves a category to a new parent.

```javascript
const moveData = {
  "newParentId": 4  // ID of new parent (null for root)
};

const response = await fetch('/api/categories/5/move', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(moveData)
});
```

### 9. Reorder Categories

**PUT** `/api/categories/reorder`

Reorders categories at the same level.

```javascript
const reorderData = {
  "categoryIds": [4, 3, 7]  // New order for siblings
};

const response = await fetch('/api/categories/reorder', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(reorderData)
});
```

### 10. Delete Category

**DELETE** `/api/categories/{id}`

Soft deletes a category (sets `isActive` to false).

```javascript
const response = await fetch('/api/categories/5', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### 11. Restore Category

**PUT** `/api/categories/{id}/restore`

Restores a soft-deleted category.

```javascript
const response = await fetch('/api/categories/5/restore', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### 12. Get Category Descendants

**GET** `/api/categories/{id}/descendants`

Returns all descendants of a category (all levels).

```javascript
const response = await fetch('/api/categories/1/descendants', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

## Tree Implementation Guide

### Building Tree Structure

Convert flat category list to tree structure:

```javascript
function buildCategoryTree(categories) {
  const categoryMap = {};
  const rootCategories = [];

  // Create map for quick lookup
  categories.forEach(category => {
    categoryMap[category.id] = { ...category, children: [] };
  });

  // Build tree structure
  categories.forEach(category => {
    const node = categoryMap[category.id];
    if (category.parentId) {
      const parent = categoryMap[category.parentId];
      if (parent) {
        parent.children.push(node);
      }
    } else {
      rootCategories.push(node);
    }
  });

  return rootCategories;
}

// Usage
const response = await fetch('/api/categories', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
const { data } = await response.json();
const treeData = buildCategoryTree(data.categories);
```

### Lazy Loading Strategy

1. **Initial Load**: Get root categories only
2. **On Expand**: Load children using `/{id}/children`
3. **Cache**: Store loaded children to avoid repeated requests

```javascript
class CategoryTree {
  constructor() {
    this.loadedNodes = new Set(); // Cache loaded node IDs
    this.expandedNodes = new Set(); // Track expanded nodes
  }

  async loadRootCategories() {
    const response = await fetch('/api/categories/root', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return await response.json();
  }

  async loadChildren(categoryId) {
    if (this.loadedNodes.has(categoryId)) {
      return []; // Already loaded
    }

    const response = await fetch(`/api/categories/${categoryId}/children`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    this.loadedNodes.add(categoryId);
    return await response.json();
  }

  async toggleCategory(categoryId) {
    if (this.expandedNodes.has(categoryId)) {
      this.expandedNodes.delete(categoryId);
      // Collapse UI
    } else {
      this.expandedNodes.add(categoryId);
      const children = await this.loadChildren(categoryId);
      // Expand UI with children
    }
  }
}
```

### Performance Considerations

1. **Lazy Loading**: For large trees (>100 categories), use `/root` and `/{id}/children`
2. **Caching**: Store loaded categories in memory/localStorage
3. **Debounced Search**: Delay search API calls while typing
4. **Virtual Scrolling**: Consider for very large trees (1000+ categories)

---

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

#### 404 Not Found
```json
{
  "httpCode": 404,
  "message": "Category not found",
  "errorCode": "CATEGORY_NOT_FOUND",
  "timestamp": "2025-11-11T18:25:43.306306456"
}
```

#### 400 Validation Error
```json
{
  "httpCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Category name is required"
    }
  ]
}
```

### Error Handling Pattern

```javascript
async function fetchWithErrorHandling(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json();

      switch (response.status) {
        case 401:
          // Handle authentication error
          redirectToLogin();
          break;
        case 404:
          // Handle not found
          showNotFoundError(errorData.message);
          break;
        case 400:
          // Handle validation errors
          showValidationErrors(errorData.errors);
          break;
        default:
          // Handle other errors
          showGenericError(errorData.message);
      }

      throw new Error(errorData.message);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

---

## JavaScript Examples

### Complete Tree Component Example

```javascript
class CategoryTreeComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.accessToken = localStorage.getItem('access_token');
    this.loadedCategories = new Map();
    this.expandedCategories = new Set();
  }

  async init() {
    await this.loadRootCategories();
  }

  async loadRootCategories() {
    try {
      const response = await this.apiCall('/api/categories/root');
      this.renderCategories(response.data, this.container);
    } catch (error) {
      this.showError('Failed to load categories');
    }
  }

  async loadChildren(categoryId, parentElement) {
    if (this.loadedCategories.has(categoryId)) {
      return; // Already loaded
    }

    try {
      const response = await this.apiCall(`/api/categories/${categoryId}/children`);
      const childrenContainer = this.createChildrenContainer(categoryId);

      parentElement.appendChild(childrenContainer);
      this.renderCategories(response.data, childrenContainer);
      this.loadedCategories.set(categoryId, true);

    } catch (error) {
      this.showError('Failed to load child categories');
    }
  }

  renderCategories(categories, container) {
    categories.forEach(category => {
      const categoryElement = this.createCategoryElement(category);
      container.appendChild(categoryElement);
    });
  }

  createCategoryElement(category) {
    const div = document.createElement('div');
    div.className = 'category-item';
    div.dataset.categoryId = category.id;

    const hasChildren = !category.isLeaf;
    const isExpanded = this.expandedCategories.has(category.id);

    div.innerHTML = `
      <div class="category-header" style="padding-left: ${category.level * 20}px;">
        ${hasChildren ? `
          <button class="expand-btn" data-category-id="${category.id}">
            ${isExpanded ? '▼' : '▶'}
          </button>
        ` : '<span class="spacer"></span>'}
        <i class="${category.icon}" style="color: ${category.color}"></i>
        <span class="category-name">${category.name}</span>
        <span class="badge">${category.descendantCount}</span>
      </div>
    `;

    // Add expand/collapse handler
    const expandBtn = div.querySelector('.expand-btn');
    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        this.toggleCategory(category.id, div);
      });
    }

    return div;
  }

  async toggleCategory(categoryId, categoryElement) {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
      this.collapseCategory(categoryId, categoryElement);
    } else {
      this.expandedCategories.add(categoryId);
      await this.expandCategory(categoryId, categoryElement);
    }
  }

  async expandCategory(categoryId, categoryElement) {
    await this.loadChildren(categoryId, categoryElement);
    const expandBtn = categoryElement.querySelector('.expand-btn');
    if (expandBtn) {
      expandBtn.textContent = '▼';
    }
  }

  collapseCategory(categoryId, categoryElement) {
    const childrenContainer = categoryElement.querySelector(`.children-container[data-parent-id="${categoryId}"]`);
    if (childrenContainer) {
      childrenContainer.remove();
    }
    const expandBtn = categoryElement.querySelector('.expand-btn');
    if (expandBtn) {
      expandBtn.textContent = '▶';
    }
  }

  createChildrenContainer(parentId) {
    const div = document.createElement('div');
    div.className = 'children-container';
    div.dataset.parentId = parentId;
    return div;
  }

  async apiCall(endpoint, options = {}) {
    const response = await fetch(`http://localhost:8080${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  showError(message) {
    console.error(message);
    // Implement your error display logic
  }
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
  const categoryTree = new CategoryTreeComponent('category-tree-container');
  categoryTree.init();
});
```

### CSS for Tree Component

```css
.category-item {
  border: 1px solid #e0e0e0;
  margin: 2px 0;
  border-radius: 4px;
}

.category-header {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  background: #f8f9fa;
}

.category-header:hover {
  background: #e9ecef;
}

.expand-btn {
  background: none;
  border: none;
  width: 20px;
  cursor: pointer;
  font-size: 12px;
}

.spacer {
  width: 20px;
  display: inline-block;
}

.category-name {
  margin-left: 8px;
  font-weight: 500;
}

.badge {
  margin-left: auto;
  background: #6c757d;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
}

.children-container {
  margin-left: 20px;
  border-left: 1px dashed #dee2e6;
  padding-left: 10px;
}
```

---

## Quick Reference

### Essential Endpoints for Tree UI

| Purpose | Endpoint | When to Use |
|---------|----------|-------------|
| Load initial tree | `GET /api/categories/root` | Page load |
| Load children | `GET /api/categories/{id}/children` | On expand |
| Search | `GET /api/categories/search?query=` | Search input |
| Create | `POST /api/categories` | Add new category |
| Move | `PUT /api/categories/{id}/move` | Drag & drop |
| Delete | `DELETE /api/categories/{id}` | Remove category |

### Response Format

All successful responses follow this format:
```json
{
  "httpCode": 200,
  "message": "Success message",
  "data": { /* Response data */ },
  "timestamp": "2025-11-11T18:25:43.306306456"
}
```

### Authentication Header
```javascript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

This documentation provides everything needed to implement a fully functional category tree interface with lazy loading, search, and CRUD operations.