#https://www.nomic.ai/blog/posts/local-nomic-embed
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
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

output = embed.text(
    texts=[
        'Nomic Embed now supports local and dynamic inference to save you inference latency and cost!',
        'Hey Nomic, why don\'t you release a multimodal model soon?',
    ],
    model='nomic-embed-text-v1.5',
    task_type="search_document",
    inference_mode='local',
    dimensionality=768,
)

print(output['usage'])

embeddings = np.array(output['embeddings'])

print(embeddings.shape)




""" for doc in collection.find():    
    text = doc["answer"]
    text_agg = doc["question"] + " " + doc["answer"]
    embedding = embeddings.embed_query(text)
    embedding_agg = embeddings.embed_query(text_agg)
    collection.update_one({"_id": doc["_id"]}, {"$set": {"embedding_nomic": embedding}}) """