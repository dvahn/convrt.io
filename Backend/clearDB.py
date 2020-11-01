import pymongo

client = pymongo.MongoClient("mongodb://localhost:27017/")
allDBs = client.list_database_names()

if 'convrt_database' in allDBs:
    client.drop_database('convrt_database')
