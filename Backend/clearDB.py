import pymongo

client = pymongo.MongoClient("mongodb://127.0.0.1:27017/")
allDBs = client.list_database_names()

if 'convrt_database' in allDBs:
    client.drop_database('convrt_database')
