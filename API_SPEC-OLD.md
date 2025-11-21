
# API Specification: UserAccount Concept

**Purpose:** To allow users to establish and manage their identity within the app.

---

## API Endpoints

### POST /api/UserAccount/register

**Description:** Creates a new user account with the provided credentials.

**Requirements:**
- No User exists with the given `username` or `email`.

**Effects:**
- Creates a new User; sets its `username`, `email`, `isKidAccount` status, and a hash of the `password`; returns the new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "isKidAccount": "boolean"
}
```

**Success Response Body (Action):**
```json
{
  "user": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/UserAccount/login

**Description:** Authenticates a user and returns their user object.

**Requirements:**
- A User exists with the given `usernameOrEmail` and the provided `password` matches their `passwordHash`.

**Effects:**
- Returns the matching user.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "user": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/UserAccount/changePassword

**Description:** Updates an existing user's password after verifying the old password.

**Requirements:**
- The `user` exists and the provided `oldPassword` matches their current `passwordHash`.
- If the `user` does not exist or the `oldPassword` does not match, an error is returned.

**Effects:**
- On success, updates the `passwordHash` for `user` with a hash of `newPassword`; returns `true` as `success`.
- On failure, returns an error message.

**Request Body:**
```json
{
  "user": "string",
  "oldPassword": "string",
  "newPassword": "string"
}
```

**Success Response Body (Action):**
```json
{
  "success": "boolean"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/UserAccount/updateCredentials

**Description:** Updates a user's username and email.

**Requirements:**
- The `user` exists. The `newUsername` and `newEmail` are not already in use by another User.

**Effects:**
- Updates the `username` to `newUsername` and `email` to `newEmail` for the given `user`; returns `true` as `success`.

**Request Body:**
```json
{
  "user": "string",
  "newUsername": "string",
  "newEmail": "string"
}
```

**Success Response Body (Action):**
```json
{
  "success": "boolean"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/UserAccount/setKidAccountStatus

**Description:** Sets the 'isKidAccount' status for a given user.

**Requirements:**
- The `user` exists.

**Effects:**
- Sets the `isKidAccount` status for the given `user` to the provided `status`.

**Request Body:**
```json
{
  "user": "string",
  "status": "boolean"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/UserAccount/deleteAccount

**Description:** Deletes a user's account after verifying their password.

**Requirements:**
- The `user` exists and the provided `password` matches their `passwordHash`.

**Effects:**
- Removes the `user` and all their associated data from the state; returns `true` as `success`.

**Request Body:**
```json
{
  "user": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "success": "boolean"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
# API Specification: UserProfile Concept

**Purpose:** To allow users to personalize their in-app identity and preferences.

---
