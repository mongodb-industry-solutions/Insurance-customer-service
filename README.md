# Insurance Customer Service

The demo showcases how MongoDB can revolutionize call center operations for insurance companies by converting call recordings into searchable vectors. This transformation allows agents to quickly access relevant information, improving customer service and enhancing customer satisfaction.

## Where MongoDB Shines?

MongoDB shines in this solution by providing a robust platform for storing and querying vectorized data through MongoDB Atlas Vector Search. Its flexibility and scalability enable real-time data access and integration with AI-driven applications, facilitating efficient and accurate information retrieval for customer service enhancements.

Learn more about MongoDB [here](https://www.mongodb.com/docs/manual/).

## Blog Post

For a detailed exploration of this demo and its impact on customer service in the insurance industry, check out our blog post: [AI-Powered Call Centers: A New Era of Customer Service](https://www.mongodb.com/blog/post/ai-powered-call-centers-new-era-of-customer-service).


## High Level Architecture

<img src="https://webassets.mongodb.com/_com_assets/cms/Screenshot 2024-11-26 at 7.17.25 AM-d00hiuu0s9.png" alt="Diagram showing the system architecture. The customer reaches out to customer service, who then utilizes Cohere and Amazon Transcribe with data stored on MongoDB Atlas.">

## Tech Stack

- [MongoDB Atlas](https://www.mongodb.com/atlas/database) for the database
- [Python](https://www.python.org/) for the backend language
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [Uvicorn](https://www.uvicorn.org/) for ASGI server
- [Poetry](https://python-poetry.org/) for dependency management
- [Next.js](https://nextjs.org/) for the frontend framework
- [CSS Modules](https://github.com/css-modules/css-modules) for styling
- [Docker](https://www.docker.com/) for containerization
- [Docker desktop](https://www.docker.com/products/docker-desktop/) (optional)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- MongoDB Atlas account, you can create one [here](https://account.mongodb.com/account/register). Free tier is sufficient for this project.
- Node.js 14 or higher
- Python 3.10 or higher (but less than 3.11)
- Poetry (install via [Poetry's official documentation](https://python-poetry.org/docs/#installation))

## Importing FAQs into MongoDB Atlas

To enhance the functionality of the demo, you need to import the `data/insurance_customer_service.FAQs.json` file into your MongoDB Atlas database. This file contains frequently asked questions, their corresponding answers and the Cohere Embeddings which will be used to improve customer service interactions.

### Steps to Import the JSON File Using MongoDB Compass

1. **Set Up MongoDB Atlas:**
   - If you haven't already, create a MongoDB Atlas account and set up a cluster. Follow the [MongoDB Atlas Getting Started Guide](https://www.mongodb.com/docs/atlas/getting-started/) for detailed instructions.
   - Once your cluster is ready, obtain the connection string. You can find this in the "Connect" section of your cluster dashboard.

2. **Download and Install MongoDB Compass:**
   - Download MongoDB Compass from the [official website](https://www.mongodb.com/try/download/compass) and install it on your machine.

3. **Connect to MongoDB Atlas Using Compass:**
   - Open MongoDB Compass.
   - In the "New Connection" dialog, paste your MongoDB Atlas connection string.
   - Click "Connect" to establish a connection to your Atlas cluster.

4. **Import the JSON File:**
   - Once connected, create a database called `insurance_customer_service`.
   - Create a collection called `FAQS`.
   - Click on "Add Data" > "Import File".
   - Choose the `insurance_customer_service.FAQs.json` file from your local machine.
   - Click "Import" to load the data into your collection.

5. **Verify the Import:**
   - After importing, you can verify that the data has been successfully added by browsing the `FAQS` collection in your MongoDB Atlas database.

### Note

- Ensure that your MongoDB Atlas connection string includes the necessary credentials and permissions to write to the database.
- The import process in Compass is straightforward and provides a graphical interface to manage your data easily.

By following these steps, you will have the FAQs data imported into your MongoDB Atlas database, ready to be used by the demo application.

## Run it locally

### Frontend

### Add environment variables

1. Navigate to the `/frontend` folder.
2. Create a `.env.local` file:
```bash
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8000/TranscribeStreaming
NEXT_PUBLIC_TEXT_SEARCH_URL=http://localhost:8000/textSearch
```
3. Navigate to the `/frontend` folder.
4. Install dependencies by running:
```bash
npm install --legacy-peer-deps
```
5. Start the frontend development server with:
````bash
npm run dev
````
6. The frontend will now be accessible at http://localhost:3000 by default, providing a user interface.

### Backend 

### Add environment variables

> **_Note:_** Create a `.env` file within the `/backend` directory.

```bash
MONGO_URI=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_KEY_REGION=
```

### Setup virtual environment with Poetry

1. (Optional) Set your project description and author information in the `pyproject.toml` file:
   ```toml
   description = "Your Description"
   authors = ["Your Name <you@example.com>"]
2. Open the project in your preferred IDE.
3. Open a Terminal window.
4. Ensure you are in the root project directory where the `makefile` is located.
5. Execute the following commands:
  - Poetry start
    ````bash
    make poetry_start
    ````
  - Poetry install
    ````bash
    make poetry_install
    ````
6. Verify that the `.venv` folder has been generated within the `/backend` directory.

### Run the Backend

1. To run the backend, execute the following command:
    ````bash
    poetry run uvicorn main:app --host 0.0.0.0 --port 8000
    ````

> **_Note:_** Notice that the backend is running on port `8000`. You can change this port by modifying the `--port` flag.

## Run with Docker

Make sure to run this on the root directory.

1. To run with Docker use the following command:
```
make build
```
2. To delete the container and image run:
```
make clean
```

## Common errors

### Frontend

- Check that you've created an `.env.local` file that contains the required environment variables.

### Backend

- Check that you've created an `.env` file that contains the required environment variables.

## Future tasks

- [ ] Add tests
- [ ] Code quality checks
- [ ] Automate the deployment process using GitHub Actions or CodePipeline

