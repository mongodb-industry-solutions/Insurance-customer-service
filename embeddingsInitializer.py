from langchain_aws import BedrockEmbeddings
from pymongo import MongoClient
from dotenv import load_dotenv
import os
load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["insurance_customer_service"]
collection = db["FAQs"]

embeddings_client = BedrockEmbeddings(model_id="cohere.embed-english-v3")


for doc in collection.find():    
    text = doc["answer"]
    text_agg = doc["question"] + " " + doc["answer"]
    embedding = embeddings_client.embed_query(text)
    embedding_agg = embeddings_client.embed_query(text_agg)
    collection.update_one({"_id": doc["_id"]}, {"$set": {"embedding_cohere": embedding}})
    collection.update_one({"_id": doc["_id"]}, {"$set": {"embedding_cohere_agg": embedding_agg}})

