# Insurance Customer Service

The demo showcases howMongoDB can revolutionize call center operations for insurance companies by converting call recordings into searchable vectors. This transformation allows agents to quickly access relevant information, improving customer service and enhancing customer satisfaction.

## Where MongoDB Shines?

MongoDB shines in this solution by providing a robust platform for storing and querying vectorized data through MongoDB Atlas Vector Search. Its flexibility and scalability enable real-time data access and integration with AI-driven applications, facilitating efficient and accurate information retrieval for customer service enhancements.

Learn more about MongoDB [here](https://www.mongodb.com/docs/manual/).

## Blog Post

For a detailed exploration of this demo and its impact on customer service in the insurance industry, check out our blog post: [AI-Powered Call Centers: A New Era of Customer Service](https://www.mongodb.com/blog/post/ai-powered-call-centers-new-era-of-customer-service).


## High Level Architecture

<img src="https://webassets.mongodb.com/_com_assets/cms/Screenshot 2024-11-26 at 7.17.25 AM-d00hiuu0s9.png" alt="Diagram showing the system architecture. The customer reaches out to customer service, who then utilizes Cohere and Amazon Transcribe with data stored on MongoDB Atlas.">

## Tech Stack

- [React](https://react.dev/) for the Frontend
- [FastAPI](https://fastapi.tiangolo.com/) for the Backend
- [MongoDB Atlas](https://www.mongodb.com/atlas/database) for the database
- [CSS Modules](https://github.com/css-modules/css-modules) for styling


## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js 14 or higher
- Python 3.9 or higher

## Importing FAQs into MongoDB Atlas

To enhance the functionality of the demo, you need to import the `insurance_customer_service.FAQs.json` file into your MongoDB Atlas database. This file contains frequently asked questions, their corresponding answers and the Cohere Embeddings which will be used to improve customer service interactions.

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

1. Navigate to the `frontend` folder.
2. Create a `.env`file:
```
REACT_APP_WEBSOCKET_URL=ws://localhost:8000/TranscribeStreaming
REACT_APP_TEXT_SEARCH_URL=http://localhost:8000/textSearch
```
3. Install dependencies by running:
```bash
npm install
```
3. Start the frontend development server with:
````bash
npm run dev
````
4. The frontend will now be accessible at http://localhost:3000 by default, providing a user interface.

### Backend 

1. Navigate to the `backed` folder.
2. Create a `.env`file:
```
MONGO_URI=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_KEY_REGION=
```
4. Install dependencies by running:
```bash
pip install -r requirements.txt
```
3. Start the backend development server with:
````bash
uvicorn main:app --host 0.0.0.0 --port 8000
````
4. The backend will now be accessible at http://localhost:8000 by default.

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

- Check that you've created an `.env` file that contains your valid (and working) API keys, environment and index variables.
