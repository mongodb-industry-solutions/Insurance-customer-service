from langchain_mongodb.vectorstores import MongoDBAtlasVectorSearch
from langchain_aws import BedrockEmbeddings
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from bedrock_client import BedrockClient


# Load environment variables from .env file
load_dotenv()

# Get MongoDB URI
mdb_uri = os.getenv("MONGO_URI")
client = MongoClient(mdb_uri)

# Set database and collection names
DB_NAME = "insurance_customer_service"
COLLECTION_NAME = "FAQs"
MONGODB_COLLECTION = client[DB_NAME][COLLECTION_NAME]
ATLAS_VECTOR_SEARCH_INDEX_NAME = "cohere"

AWS_KEY_REGION = os.getenv("AWS_KEY_REGION")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# Getting Bedrock Client
# https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html
bedrock_client = BedrockClient(
    aws_access_key=AWS_ACCESS_KEY_ID,
    aws_secret_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_KEY_REGION
)._get_bedrock_client()

# Initialize BedrockEmbeddings with AWS credentials and region
embeddings = BedrockEmbeddings(
    client=bedrock_client,
    model_id="cohere.embed-english-v3"
)

# Initialize MongoDB Atlas Vector Search
vector_store = MongoDBAtlasVectorSearch(
    collection=MONGODB_COLLECTION,
    embedding=embeddings,
    text_key="answer",
    embedding_key="embedding_cohere",
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
    relevance_score_fn="cosine",
)

def semantic_search(text):
    results = vector_store.similarity_search(text, k=1)
    return results[0].page_content


#results = vector_store.similarity_search("How do I add driver?", k=1)
#print(results[0].page_content)

""" for res in results:
    #print(f"* {res.page_content} [{res.metadata}]")
    print(f"* {res.page_content} ") """