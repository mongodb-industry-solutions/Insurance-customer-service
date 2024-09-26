#https://www.nomic.ai/blog/posts/local-nomic-embed
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from nomic import embed
import numpy as np
load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["insurance_customer_service"]
collection = db["FAQs"]

for doc in collection.find():    
    text = doc["answer"]
    #text_agg = doc["question"] + " " + doc["answer"]
    embedding = embed.text(
    texts=[text],
    model='nomic-embed-text-v1.5',
    task_type="search_document",
    inference_mode='local',
    dimensionality=768,
    )
    #embedding_agg = embeddings.embed_query(text_agg)
    collection.update_one({"_id": doc["_id"]}, {"$set": {"embedding_nomic": embedding}})