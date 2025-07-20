# OTP Authentication Service

## Introduction

This project implements two-factor authentication using One-Time Passwords (OTP), designed to significantly enhance the security of your website and protect against unauthorized access.

---

## Why We Chose MySQL & Prisma ORM

We decided to use MySQL as our database solution because of its reliability, speed, and ability to handle large-scale applications. MySQL is a widely adopted relational database system that ensures data integrity and supports complex queries, making it an ideal choice for our OTP service.

Prisma ORM was chosen to work as an abstraction layer over MySQL due to its ease of use and powerful features. With Prisma, we can efficiently manage our database models, perform migrations, and queries in a type-safe manner. It reduces boilerplate code and simplifies interactions with the database, improving development speed and reducing the likelihood of errors.

Using Prisma, we can also easily integrate the database with our Docker environment and ensure smooth migrations and consistent schema updates, making it a key part of the architecture.

---

## Setup Instructions

Follow the steps below to set up and run the OTP Authentication Service locally using Docker.

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/Amir-m-Arabi/otp-auth-service.git
cd otp-auth-service
```

### 2. Docker Setup

To set up the service in a Docker container, run the following commands:

```bash
docker build -t otp-auth-app .
docker run -d -p 6000:5002 otp-auth-app
```

However, if you are using Docker, it's essential to correctly link Prisma with the database. To do this, follow the steps below.

### 3. Connecting Prisma with the Database

After starting the Docker container, execute the following command to get access to the container's shell:

```bash
docker exec -it otp-auth-app-new sh
```

Now, inside the container, you'll need to install the MariaDB client:

```bash
apt-get update && apt-get install -y mariadb-client
```

Once the MariaDB client is installed, you can run the following command to connect Prisma with the MySQL database:

```bash
npx prisma migrate dev
```

This will ensure that the Prisma schema is synchronized with the database, and your service will be ready to run with the database connected.

---

## Docker Compose (Optional)

For a smoother local development experience, you can use Docker Compose to manage both the application and the MySQL container.

1. Make sure you have a `docker-compose.yml` file in the root of your project. Here’s an example:

```yaml
services:
  app:
    build: .
    container_name: otp-auth-app-new
    ports:
      - "6000:5002"
    depends_on:
      - mysql
      - redis
    env_file:
      - .env
    networks:
      - otp-net

  mysql:
    image: mysql:8
    container_name: otp-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: otp_auth
    ports:
      - "3307:3306"
    networks:
      - otp-net

  redis:
    image: redis:alpine
    container_name: otp-redis
    ports:
      - "6380:6379"
    networks:
      - otp-net
```

2. Run the services using Docker Compose:

```bash
docker-compose up --build
```

This setup will automatically configure the MySQL database along with the OTP Authentication Service.

---

## API Endpoints

Below are the API endpoints provided by the OTP Authentication Service:

### 1. **Request OTP**

**URL**: `/user/otp-request`  
**Method**: `POST`

**Description**: Sends an OTP to the provided phone number.

**Request Body**:

```json
{
  "phoneNumber": "09123456789"
}
```

**Responses**:

- `200`: OTP sent successfully.
- `400`: Bad Request (e.g., invalid phone number).
- `429`: Too Many Requests.
- `500`: Internal Server Error.

---

### 2. **Check OTP**

**URL**: `/user/otp-check`  
**Method**: `POST`

**Description**: Verifies the OTP entered by the user.

**Request Body**:

```json
{
  "phoneNumber": "09123456789",
  "otp": "123456"
}
```

**Responses**:

- `200`: OTP successfully verified.
- `400`: Bad Request (e.g., incorrect OTP).
- `500`: Internal Server Error.

---

### 3. **Sign In**

**URL**: `/user/signIn`  
**Method**: `GET`

**Description**: Allows the user to sign in with the phone number and OTP.

**Responses**:

- `200`: Sign-in successful.
- `400`: Bad Request.
- `401`: Unauthorized.
- `403`: Forbidden.
- `500`: Internal Server Error.

---

## Conclusion

With these steps, you will have the OTP Authentication Service running locally, integrated with MySQL and Prisma ORM, and Dockerized for easy deployment. The service is designed to handle OTP generation and validation efficiently, providing an essential feature for enhancing security in modern applications.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Author:** Amir Arabi  
**GitHub Repository:** [Amir-m-Arabi/otp-auth-service](https://github.com/Amir-m-Arabi/otp-auth-service)
