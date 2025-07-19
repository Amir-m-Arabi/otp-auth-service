
# OTP Authentication Service

## Introduction

The OTP Authentication Service is a robust and scalable solution designed to add One-Time Password (OTP) authentication to your application. It simplifies the implementation of OTP authentication, offering support for sending OTPs via email or SMS. This enhances the security of your application through two-factor authentication (2FA).

The service is designed with scalability and reliability in mind, making it suitable for both small and large-scale applications. It leverages modern technologies to ensure smooth operation and easy maintenance.

---

## Features

- **OTP Generation**: Secure generation of one-time passwords.
- **OTP Validation**: Easy validation of OTPs during login or sensitive actions.
- **Email/SMS Support**: Customizable delivery methods for OTPs via email or SMS.
- **Scalable Architecture**: Built to scale with your application's growing needs.

---

## Why MySQL & Prisma ORM?

We selected **MySQL** for its proven reliability, performance, and ability to handle large-scale applications. MySQL is an industry-standard relational database that ensures consistency and supports complex queries.

**Prisma ORM** was chosen for its ease of use and powerful features. It provides a modern abstraction layer over MySQL, allowing developers to write efficient queries with type-safety and minimal boilerplate code. Prisma simplifies database management and ensures smooth migrations, making it an ideal choice for our project.

---

## Installation

Follow the instructions below to set up the OTP Authentication Service locally.

### 1. Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/Amir-m-Arabi/otp-auth-service.git
cd otp-auth-service
```

### 2. Install Dependencies

Install the necessary dependencies using npm:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file based on the `.env.example` file and configure your environment variables, such as database connection details and credentials for OTP sending (email/SMS settings).

---

## Docker Setup

To set up the service with Docker, follow these steps:

### 1. Build the Docker Image

```bash
docker build -t otp-auth-app .
```

### 2. Run the Docker Container

```bash
docker run -d -p 4000:4000 otp-auth-app
```

### 3. Connecting Prisma to MySQL

After running the Docker container, follow these steps to ensure Prisma is connected to the database:

1. Execute the following command to access the container's shell:

    ```bash
    docker exec -it otp-auth-app-new sh
    ```

2. Inside the container, install the MariaDB client:

    ```bash
    apt-get update && apt-get install -y mariadb-client
    ```

3. Once installed, run the Prisma migration:

    ```bash
    npx prisma migrate dev
    ```

4. Now, rebuild the Docker container:

    ```bash
    docker build -t otp-auth-app .
    ```

---

## Docker Compose (Optional)

To simplify the process, you can use Docker Compose to manage both the OTP Authentication Service and MySQL containers.

1. Ensure you have the following `docker-compose.yml` file:

```yaml
version: '3'

services:
  otp-auth-app:
    build: .
    ports:
      - "4000:4000"
    depends_on:
      - db

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: otp_auth
    ports:
      - "3306:3306"
```

2. Run the services with:

```bash
docker-compose up --build
```

This will automatically configure the database and OTP Authentication Service for local development.

---

## Conclusion

The OTP Authentication Service provides an efficient way to integrate secure OTP-based authentication into your application. With easy setup instructions, Docker support, and scalable architecture, it is a reliable solution for enhancing the security of your system.
