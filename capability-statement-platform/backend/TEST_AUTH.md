# How to Test Authentication

## The Error You're Seeing

The error shows you tried to paste a curl command into the browser. That won't work! You need to use a proper HTTP client.

## Method 1: Using Browser Developer Tools (Easiest)

1. Open your browser (Chrome/Firefox)
2. Press **F12** to open Developer Tools
3. Go to the **Network** tab
4. Open a new tab and go to: `http://localhost:3000/api/v1/health` (to verify server is running)
5. In the Console tab, paste this JavaScript:

```javascript
fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@lawfirm.com',
    password: 'admin123'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Response:', data);
  if (data.success) {
    console.log('Token:', data.data.token);
    console.log('User:', data.data.user);
  }
})
.catch(error => console.error('Error:', error));
```

6. Press Enter
7. Check the console output for the token

## Method 2: Using Postman (Recommended)

1. Download Postman: https://www.postman.com/downloads/
2. Create a new request:
   - Method: **POST**
   - URL: `http://localhost:3000/api/v1/auth/login`
   - Headers: Add `Content-Type: application/json`
   - Body: Select "raw" and "JSON", then paste:
   ```json
   {
     "email": "admin@lawfirm.com",
     "password": "admin123"
   }
   ```
3. Click "Send"
4. Copy the token from the response

## Method 3: Using curl in Terminal

Open Terminal and run:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lawfirm.com","password":"admin123"}'
```

**Important:** This is a terminal command, NOT a browser URL!

## Method 4: Using a Simple HTML Test Page

Create a file `test-auth.html` in the backend folder:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Auth</title>
</head>
<body>
    <h1>Test Authentication</h1>
    <button onclick="testLogin()">Login as Admin</button>
    <pre id="result"></pre>

    <script>
        async function testLogin() {
            const response = await fetch('http://localhost:3000/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'admin@lawfirm.com',
                    password: 'admin123'
                })
            });
            
            const data = await response.json();
            document.getElementById('result').textContent = JSON.stringify(data, null, 2);
            
            if (data.success) {
                console.log('Token:', data.data.token);
                // Save token for next requests
                localStorage.setItem('authToken', data.data.token);
            }
        }
    </script>
</body>
</html>
```

Open this file in your browser.

## Verify Route is Registered

First, check if the route exists:

```bash
# In browser or curl:
curl http://localhost:3000/api/v1/health
```

Should return: `{"status":"ok",...}`

Then test auth endpoint:

```bash
curl http://localhost:3000/api/v1/auth/login
```

Should return an error about method not allowed (POST required), NOT "route not found".

## Common Issues

### "Route not found"
- Check backend server is running
- Check route is registered in `src/routes/index.js`
- Restart backend server

### "Method not allowed"
- Make sure you're using POST, not GET
- Check Content-Type header is set

### "Invalid credentials"
- Verify users exist in database
- Check password hash matches
- Default passwords: `admin123` and `associate123`

## Quick Test Script

Save this as `test-auth.sh`:

```bash
#!/bin/bash

echo "Testing login..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lawfirm.com","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed!"
  exit 1
fi

echo "Login successful! Token: ${TOKEN:0:20}..."
echo ""
echo "Testing protected endpoint..."
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

Run: `chmod +x test-auth.sh && ./test-auth.sh`
