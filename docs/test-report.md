API Test Report

Tools Used
Postman for API testing

Postman Collection: api-tests.postman_collection.json

| Endpoint                      | Method | Purpose           | Status |
| --------------------          | ------ | ----------------- | ------ |
| `/api/auth/signup`            | POST   | User registration | Passed |
| `/api/auth/login`             | POST   | User login        | Passed |
| `/api/user/applications`      | GET    | Fetch reminders   | Passed |
| `/api/user/resume`            | DEL    | Create reminder   | Passed |
| `/api/user/app/reminders/`    | PUT    | Update reminder   | Passed |
| `/api/user/documents`         | DELETE | Delete reminder   | Passed |


Notes:
    All endpoints returned appropriate status codes and the expected response structure.

    Authentication was managed using HTTP cookies.

    Manual checks for rate limiting and input validation errors were performed and passed.