import pymongo

client = pymongo.MongoClient("mongodb://127.0.0.1:27017/")

db = client['convrt_database']
users = db['users']
conversations = db['conversations']

user = "admin"

query = {"username": user}

current_user = list(users.find(query))
current_user = current_user[0]
email = current_user["li_mail"]
password = current_user["li_password"]
conversations_ids = current_user["conversations"]


current = list(conversations.find(
    {"ID": '2-MjFiMTg2ZTUtYjI2Ni00NjZmLThmNmItZjFiZTA3YjQ1YjUwXzAxMw=='}))
print(current[0]['messageFeed'])
