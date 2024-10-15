from langchain_mongodb.vectorstores import MongoDBAtlasVectorSearch
from langchain_aws import BedrockEmbeddings
from pymongo import MongoClient
from dotenv import load_dotenv
import os

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

# Get AWS credentials and region from environment variables
aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
aws_region = os.getenv("AWS_DEFAULT_REGION")

# Initialize BedrockEmbeddings with AWS credentials and region
embeddings = BedrockEmbeddings(
    model_id="cohere.embed-english-v3",
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key,
    region=aws_region
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