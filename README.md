# Shopping application
## Auth Module:
### Signup:
- User creates an account by providing username, password, and optionally, email address.
- Validate user input (e.g., username length, password strength).
- Save user data (username, hashed password, email - if provided) in the database.
- You can’t have users with the same Usernames
 
### Login:
- User enters username and password.
- Verify username exists in the database.
- Compare entered password with existing.
- If credentials match, login the user.
- If credentials don't match, display an error message.

### Error Handling:
- Show user-friendly error messages for invalid input, username not found, etc.
 
## Product Module
 
FOR all the CRUD operation done previously now use Database
 
## Cart Module
FOR all the CRUD operation done previously now use Database
 
## Order Module
Be able to add and show  logged in User Orders
 
## Bonus Features(Optional):
- Implement search functionality for products.
- Allow adding product reviews and ratings.
- Implement user account management (profile editing, etc.).