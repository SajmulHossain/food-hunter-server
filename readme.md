# **Food Donation & Management Server**

This is the backend server for the **Food Donation & Management Platform**. It provides APIs for user authentication, food management, and handling food donation requests. The server is built using Node.js, Express, and MongoDB, and includes JWT-based authentication for secure communication.

---

## **Features**

### **1. Authentication**
- Generates a **JWT token** for user authentication.
- Tokens are stored in cookies for secure session management.
- Provides an endpoint to **clear cookies** on logout.

### **2. Food Management APIs**
- **Retrieve Foods**:
  - Fetch all available foods with optional search and sorting capabilities.
  - Featured foods are sorted by quantity and limited by size.
- **Add Food**:
  - Allows users to add food items.
- **View Food**:
  - Fetches details of a specific food by ID.
- **User-Specific Foods**:
  - Retrieves food items donated by a specific user.
- **Update Food**:
  - Updates details of a specific food item.
- **Delete Food**:
  - Removes a food item and its associated requests.

### **3. Food Request Management APIs**
- Fetch all food requests made by a user.
- Update food status to **"Requested"** when a user requests it.
- Insert new food requests into the database.

---

## **Technologies Used**

- **Node.js**: JavaScript runtime environment for server-side programming.
- **Express.js**: Web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for storing food and request data.
- **JWT (JSON Web Token)**: Secure user authentication and authorization.
- **dotenv**: Environment variable management.
- **cors**: Enables Cross-Origin Resource Sharing.
- **cookie-parser**: Parses cookies for session management.

---

## **Installation**

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/food-donation-server.git
   cd food-donation-server
