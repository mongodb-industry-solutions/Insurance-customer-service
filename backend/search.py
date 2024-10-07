#https://python.langchain.com/docs/integrations/vectorstores/mongodb_atlas/
#https://python.langchain.com/docs/integrations/text_embedding/huggingfacehub/
from langchain_mongodb.vectorstores import MongoDBAtlasVectorSearch
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_aws import BedrockEmbeddings
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()
mdb_uri = os.getenv("MONGO_URI")
client = MongoClient(mdb_uri)
DB_NAME = "insurance_customer_service"
COLLECTION_NAME = "FAQs"
MONGODB_COLLECTION = client[DB_NAME][COLLECTION_NAME]
ATLAS_VECTOR_SEARCH_INDEX_NAME = "cohere"
#ATLAS_VECTOR_SEARCH_INDEX_NAME = "huggingFace"

embeddings = BedrockEmbeddings(model_id="cohere.embed-english-v3")
#embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
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