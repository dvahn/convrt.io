import pymongo

client = pymongo.MongoClient("mongodb://mongo:27017/")

if client:
    allDBs = client.list_database_names()

    if 'convrt_database' in allDBs:
        client.drop_database('convrt_database')
