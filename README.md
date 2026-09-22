# Task Manager - Technical Documentation & API Reference

A lightweight, production-ready specification for a RESTful task management application built with Express.js and a vanilla JavaScript front-end.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Project Layout](#2-project-layout)
3. [Environment & Setup](#3-environment--setup)
4. [Data Architecture & Schema](#4-data-architecture--schema)
5. [REST API Endpoint Reference](#5-rest-api-endpoint-reference)
   - [GET /api/todos](#get-apitodos)
   - [POST /api/todos](#post-apitodos)
   - [PATCH /api/todos/:id](#patch-apitodosid)
   - [DELETE /api/todos/:id](#delete-apitodosid)
   - [DELETE /api/todos?scope=completed](#delete-apitodosscopecompleted)
6. [Client Logic & State Flow](#6-client-logic--state-flow)

---

## 1. System Overview

The system consists of an Express HTTP server hosting a RESTful API and serving static web assets. State is maintained in memory on the server during runtime.

### Key Capabilities

- **In-Memory Storage**: Fast execution without relational database overhead or setup dependencies.
- **REST Protocol**: Strict adherence to HTTP verb conventions (`GET`, `POST`, `PATCH`, `DELETE`).
- **Client-Side Filtering**: Dynamic task filtering by state (`All`, `Active`, `Completed`) handled in local memory.
- **Batch Operations**: Bulk deletion mechanism for clearing all completed items in a single HTTP request.
- **Input Validation**: Server-side guard clauses preventing empty or whitespace-only task entries.

---

## 2. Project Layout

```
todo-app/
├── server.js          # Express server and REST routing logic
├── package.json       # Node package configuration and scripts
├── README.md          # Project documentation
└── public/            # Client web application directory
    ├── index.html     # Semantic DOM markup
    ├── styles.css     # Minimal monochrome design rules
    └── app.js         # REST API fetch client and UI controller
```

---

## 3. Environment & Setup

### Requirements

- **Runtime**: Node.js v14.0.0 or higher
- **Package Manager**: npm v6.0.0 or higher

### Command Execution

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Application**
   ```bash
   npm start
   ```

3. **Access Application**
   Navigate to `http://localhost:3000` in a standard web browser.

---

## 4. Data Architecture & Schema

### Task Entity Definition (`Todo`)

| Property    | Type      | Required | Description                                          |
| :---------- | :-------- | :------- | :--------------------------------------------------- |
| `id`        | `string`  | Yes      | Unique numeric string identifier (e.g., `"1"`).       |
| `text`      | `string`  | Yes      | Non-empty string representation of the task content. |
| `completed` | `boolean` | Yes      | Operational flag indicating task completion state.   |
| `createdAt` | `string`  | Yes      | ISO 8601 formatted string timestamp.                 |

---

## 5. REST API Endpoint Reference

Base Path: `/api/todos`

---

### `GET /api/todos`

Retrieves an array of all active and completed tasks.

- **Method**: `GET`
- **URL**: `/api/todos`
- **Headers**: None
- **Query Parameters**: None

#### Responses
- `200 OK`: Array of task objects returned successfully.

```json
[
  {
    "id": "1",
    "text": "System architecture review",
    "completed": false,
    "createdAt": "2026-03-30T08:00:00.000Z"
  }
]
```

---

### `POST /api/todos`

Creates a new task.

- **Method**: `POST`
- **URL**: `/api/todos`
- **Headers**: `Content-Type: application/json`

#### Request Body
```json
{
  "text": "Review endpoint specification"
}
```

#### Responses
- `201 Created`: Task created successfully. Returns newly assigned task object.
- `400 Bad Request`: Validation failure. Text field missing or whitespace-only.

```json
{
  "error": "Task content cannot be empty."
}
```

---

### `PATCH /api/todos/:id`

Modifies state attributes (`completed` status or `text` content) of an existing task.

- **Method**: `PATCH`
- **URL**: `/api/todos/:id`
- **Path Parameters**: `id` (string, required)
- **Headers**: `Content-Type: application/json`

#### Request Body (Partial updates permitted)
```json
{
  "completed": true
}
```

#### Responses
- `200 OK`: Task updated successfully. Returns modified task object.
- `400 Bad Request`: Invalid payload parameters.
- `404 Not Found`: Task ID does not exist in store.

---

### `DELETE /api/todos/:id`

Deletes a single task by identifier.

- **Method**: `DELETE`
- **URL**: `/api/todos/:id`
- **Path Parameters**: `id` (string, required)
- **Headers**: None

#### Responses
- `204 No Content`: Task successfully deleted. No body content returned.
- `404 Not Found`: Task ID does not exist in store.

---

### `DELETE /api/todos?scope=completed`

Removes all tasks currently marked as completed.

- **Method**: `DELETE`
- **URL**: `/api/todos`
- **Query Parameters**: `scope=completed` (string, required)
- **Headers**: None

#### Responses
- `200 OK`: Completed items successfully cleared.
- `400 Bad Request`: Query parameter missing or invalid value.

```json
{
  "message": "Completed tasks removed."
}
```

---

## 6. Client Logic & State Flow

1. **Initial Hydration**: On application mount, the client issues a `GET /api/todos` request to populate its internal state array.
2. **Form Interaction**: Submitting the input form triggers `POST /api/todos`. Upon a `201 Created` status code, the response payload is appended to the local state array and re-rendered.
3. **State Toggling**: Clicking a item checkbox triggers a `PATCH` request modifying the `completed` field. Local state updates directly upon server confirmation.
4. **Deletion Handling**: Triggering item removal executes a `DELETE` call targeting the item ID. Upon `204 No Content`, the item is removed from the DOM list.
5. **Filtering System**: View filtering (`All`, `Active`, `Completed`) operates client-side without extra network calls by re-evaluating the current state array.
6. **Items Remaining Counter**: Calculated dynamically as the sum of all tasks where `completed === false`.