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
├── backend/ # Node.js backend  
│ ├── Dockerfile  
│ ├── package.json  
│ └── server.js  
│  
└── docker-compose.yml # Docker Compose file

## Prerequisites

- Docker
- Docker Compose
- AWS account with RDS set up

## Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/my-project.git
   cd my-project
   ```

2. **Configure the Backend**:
   - Update the `backend/server.js` file with your AWS RDS database credentials.
   - Update the `docker-compose.yml` file with your RDS endpoint and credentials.

## Running the Application

1. **Build and run the containers**:

   ```bash
   docker-compose up --build
   ```

2. **Access the Applications**:
   - Vue.js frontend: [http://localhost:8080](http://localhost:8080)
   - Node.js backend: [http://localhost:3000](http://localhost:3000)

## Notes

- Ensure that your AWS RDS instance is accessible from your local machine.
- You may need to configure your security groups in AWS to allow inbound traffic from your IP address.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
