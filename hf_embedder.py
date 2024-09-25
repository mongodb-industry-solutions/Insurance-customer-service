from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from pymongo import MongoClient
from dotenv import load_dotenv
import os
load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["insurance_customer_service"]
collection = db["FAQs"]

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")


for doc in collection.find():    
    text = doc["answer"]
    text_agg = doc["question"] + " " + doc["answer"]
    embedding = embeddings.embed_query(text)
    embedding_agg = embeddings.embed_query(text_agg)
    collection.update_one({"_id": doc["_id"]}, {"$set": {"embedding_hf": embedding}})