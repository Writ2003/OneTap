# Document Share App with OneTap Backend

A secure file sharing application with a React frontend and Spring Boot backend. Files are stored temporarily with one-time download links and automatic expiration.

## Features

- **Secure File Upload**: Drag and drop or click to upload files
- **One-Time Download Links**: Each link can only be used once
- **Automatic Expiration**: Files are automatically deleted after expiry time
- **Multiple File Types**: Supports images, PDFs, documents, and archives
- **Modern UI**: Beautiful glassmorphism design with animations
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend (document-share-app)
- React 19
- Vite
- Framer Motion (animations)
- Lucide React (icons)
- React Router DOM

### Backend (OneTap)
- Spring Boot
- PostgreSQL (metadata storage)
- Redis (file storage with TTL)
- Maven

## Prerequisites

Before running the application, make sure you have:

1. **Java 17+** installed
2. **Node.js 18+** installed
3. **PostgreSQL** running on localhost:5432
4. **Redis** running on localhost:6379

## Database Setup

### PostgreSQL
1. Create a database named `securefiles`:
```sql
CREATE DATABASE securefiles;
```

2. The application will automatically create the required tables on startup.

### Redis
1. Start Redis server:
```bash
redis-server
```

## Running the Application

### 1. Start the Backend (OneTap)

Navigate to the OneTap directory:
```bash
cd OneTap
```

Build and run the Spring Boot application:
```bash
# Using Maven wrapper
./mvnw spring-boot:run

# Or using Maven directly
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 2. Start the Frontend (document-share-app)

In a new terminal, navigate to the frontend directory:
```bash
cd document-share-app
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### Upload File
- **POST** `/api/files/upload`
- **Parameters**: 
  - `file`: MultipartFile
  - `expiryMinutes`: int (default: 10)
- **Response**: File download link

### Download File
- **GET** `/api/files/view/{fileId}`
- **Response**: File content (one-time download)

## Usage

1. **Upload Files**:
   - Go to `http://localhost:5173/upload`
   - Drag and drop files or click to browse
   - Select expiry time
   - Click "Upload Files"
   - Copy the generated link

2. **Download Files**:
   - Share the generated link with others
   - When they visit the link, they'll see a download page
   - Click "Download File" to get the file
   - The link expires after first use

## Configuration

### Backend Configuration
Edit `OneTap/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/securefiles
spring.datasource.username=postgres
spring.datasource.password=root

# Redis
spring.data.redis.host=localhost
spring.data.redis.port=6379

# File upload limits
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB
```

### Frontend Configuration
Edit `document-share-app/src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

## Security Features

- **One-time download**: Each link can only be used once
- **Time-limited access**: Files auto-delete after expiry
- **Secure storage**: Files stored in Redis with TTL
- **Metadata cleanup**: File metadata deleted after download
- **CORS protection**: Configured for specific origins

## Development

### Backend Development
- Main application: `OneTap/src/main/java/com/coding/OneTap/OneTapApplication.java`
- Controllers: `OneTap/src/main/java/com/coding/OneTap/controller/`
- Services: `OneTap/src/main/java/com/coding/OneTap/service/`
- Models: `OneTap/src/main/java/com/coding/OneTap/model/`

### Frontend Development
- Main app: `document-share-app/src/App.jsx`
- Pages: `document-share-app/src/pages/`
- Components: `document-share-app/src/components/`
- API service: `document-share-app/src/services/api.js`

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure the backend is running and CORS is properly configured
2. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
3. **Redis Connection**: Ensure Redis server is running
4. **File Upload Size**: Check the max file size configuration

### Logs
- Backend logs: Check the console where you started the Spring Boot application
- Frontend logs: Check the browser console (F12)

## License

This project is for educational purposes. Feel free to modify and use as needed.
