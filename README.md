**1. What do database migrations do and why are they useful?**
- Database migrations are processes that help manage changes in a database schema over time. They allow developers to modify tables, columns, and relationships without losing existing data.
Migrations are useful because they provide version control for the database, making it easier to track changes, collaborate with a team, and roll back to previous states if necessary. 
This is especially important in software development, where databases need to be updated alongside application code to maintain compatibility and prevent errors.

**2. How does GraphQL differ from REST for CRUD operations?**
- GraphQL differs from REST in how it handles CRUD (Create, Read, Update, Delete) operations by allowing clients to request exactly the data they need, rather than relying on predefined endpoints. 
In REST, each operation typically corresponds to a specific endpoint (e.g., /users for retrieving users or /users/{id} for getting a single user), which can sometimes lead to over-fetching or under-fetching of data. 
GraphQL, on the other hand, uses a single endpoint and allows clients to specify the structure of the response, reducing unnecessary data transfer and improving efficiency. 
This makes GraphQL more flexible and efficient compared to REST, especially in applications with complex data relationships.
