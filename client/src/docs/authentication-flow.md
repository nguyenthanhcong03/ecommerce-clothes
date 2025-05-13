# Authentication Flow

## Overview

This document outlines the authentication flow in the e-commerce application, focusing on token management using HttpOnly cookies as the primary method, with fallbacks for non-HttpOnly cookies and localStorage.

## Token Storage Options

### Option 1: HttpOnly Cookies (Recommended)

- **Description**: Tokens stored in HttpOnly cookies that can only be accessed by the server
- **Security Level**: High - Protected against XSS attacks
- **Implementation**: Server sets cookies in HTTP response headers

### Option 2: Non-HttpOnly Cookies

- **Description**: Tokens stored in regular cookies that can be accessed by JavaScript
- **Security Level**: Medium - More vulnerable to XSS attacks than HttpOnly cookies
- **Implementation**: Using js-cookie library to manage cookies

### Option 3: localStorage (Fallback Only)

- **Description**: Tokens stored in browser's localStorage
- **Security Level**: Low - Vulnerable to XSS attacks
- **Implementation**: Using browser's localStorage API

## Authentication Flow

### Login Process

1. User submits login credentials
2. Server validates credentials and generates access and refresh tokens
3. Server sets HttpOnly cookies for both tokens
4. Server also returns tokens in response body for non-HttpOnly storage options
5. Client stores tokens according to the storage option in use
6. User is redirected to appropriate page based on role

### Request Authentication

1. For HttpOnly cookies: Browser automatically sends cookies with each request
2. For other storage options: Axios interceptor adds Authorization header with token
3. Server validates token in middleware before processing request

### Token Refresh Process

1. When a request returns 401 Unauthorized with token expiration:
   - Axios interceptor catches the error
   - If refresh is already in progress, request is queued
   - Otherwise, refresh token is sent to server
2. Server validates refresh token and issues new access token
3. New token is stored (per storage option)
4. Original request is retried with new token
5. Queued requests are processed with new token

### Logout Process

1. Client sends logout request to server
2. Server clears HttpOnly cookies
3. Client clears any client-side stored tokens
4. User is redirected to login page

## Implementation Notes

### Server-side (Express)

- Uses middleware to validate tokens on protected routes
- Checks for tokens in cookies first, then in Authorization header
- Sets HttpOnly cookies when issuing tokens
- Clears cookies on logout

### Client-side (React)

- Uses axios interceptors to handle token expiration and refresh
- Supports multiple token storage methods simultaneously
- Manages authentication state in Redux store
- Custom useAuth hook provides authentication functionality throughout the app

## Security Considerations

- HttpOnly cookies are the most secure method as they're not accessible to client-side JavaScript
- CSRF protection should be implemented when using cookies
- Always use HTTPS in production to protect token transmission
- Token expiration times should be appropriate for security (short-lived access tokens, longer refresh tokens)
