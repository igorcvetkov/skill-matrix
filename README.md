# SKILL-MATRIX Project

This project is a web application built with Vue.js for the frontend and Node.js for the backend.
The backend connects to a MySQL database hosted on AWS RDS.

## Project Structure

my-project/  
│  
├── frontend/ # Vue.js application  
│ ├── Dockerfile  
│ ├── package.json  
│ ├── src/  
│ └── public/  
│  
├─- database/ # sql script to create tables and views. sql is for mysql
|
├── backend/ # Node.js backend  
│ ├── Dockerfile  
│ ├── package.json  
│ └── server.js  
│  
└── docker-compose.yml # Docker Compose file

## Prerequisites

- Docker
- Docker Compose
- MySQL
- MS EntraId

## Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/my-project.git
   cd my-project
   ```

1. **Create mySql DB**

   - connect to MySQL DB instance
   - run database.sql from database folder

1. **Configure App in MS Entra ID**

   - define redirect url like http://localhost:8080/login for local development
   - define app roles:
     - admin
     - project.manage
     - user

1. **Configure the Backend**

   - use /backend/env.example file as source for .env.local file
   - provide database and ms entra details

1. **Configure the Frontend**:
   - use /frontend/env.example file as source for .env.local file
   - provide backend and ms entra details in .env.local file

## Running the Application

1. **Build and run the containers**:

   ```bash
   NODE_ENV=local docker-compose up --build
   ```

   local - instructs build command to use .env.local file.

   You can configure as many .env.\* files as needed.

2. **Access the Applications**:
   - Vue.js frontend: [http://localhost:8080](http://localhost:8080)
   - Node.js backend: [http://localhost:3000](http://localhost:3000)

## Notes

- Ensure that your AWS RDS instance is accessible from your local machine.
- You may need to configure your security groups in AWS to allow inbound traffic from your IP address.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
