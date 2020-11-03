from classes.core import ChromeBrowser
from classes.core import CSV
from selenium.common.exceptions import NoSuchElementException
import pymongo
import sys

## Create database ##
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client['convrt_database']
conversations = db['conversations']

# XPATH
xpath = {
    # changes irregularly! (daily?)
    "number_conversations": "/html/body/div[8]/div[5]/div[1]/div/div/div[1]/ul/li",
    "id_container": "//li[{pos}]/div/a",
    "name": "//li[{pos}]/div/a/div[2]/div/div[1]/h3",
    "image": "//li[{pos}]/div/a/div[{pos}]/div[{pos}]/img",
    "number_messages": "//div/div/div[2]/div[4]/div/ul/li",
    # TODO: xpath for day
    "sender": "//div/div/div[2]/div[4]/div/ul/li[{pos}]/div/div[1]/a/span",
    "time": "//li[{pos}]/div/div[1]/time",
    "message": "//div/div/div[2]/div[4]/div/ul/li[{pos}]/div/div[2]/p",
    "only_message": "//div/div/div[2]/div[4]/div/ul/li[{pos}]/div/div/p"
}


driver = ChromeBrowser()

# start with message thread
driver.get("https://www.linkedin.com/messaging/")
id_of_first_conversation = driver.current_url.split('/')[-2]
driver.get("https://www.linkedin.com/messaging/thread/" +
           id_of_first_conversation)

# LEARNING: wait until DOM is build up in browser
driver.wait()
print(driver.get_elements_size(xpath["number_conversations"]))
for i in range(1, driver.get_elements_size(xpath["number_conversations"])-1):

    # get id from DOM
    id_container = driver.find_element_by_xpath(
        xpath["id_container"].format(pos=i))
    id = id_container.get_attribute("href").split("/")[5]

    # call next conversation
    driver.get("https://www.linkedin.com/messaging/thread/"+id+"/")
    driver.wait()

    # get name from DOM
    name = driver.get_text_from_xpath(xpath["name"].format(pos=i))
    print(id, name)

    # get image from DOM
    image = driver.find_element_by_xpath(xpath["image"].format(pos=1))
    image_src = image.get_attribute("src")

    # add name + id to conversation collection
    new = {"name": name, "ID": id, "image": image_src, "label": ""}
    conversations.insert_one(new)

    # create collection for currently scraped conversation
    current_col = db[id]

    lastSender = ""
    lastTime = ""

    for i in range(3, driver.get_elements_size(xpath["number_messages"])+1):

        try:
            sender = driver.get_text_from_xpath(xpath["sender"].format(pos=i))
            time = driver.get_text_from_xpath(xpath["time"].format(pos=i))
            message_content = driver.get_text_from_xpath(
                xpath["message"].format(pos=i))

            lastSender = sender
            lastTime = time

            message = {
                "sender": sender,
                "time": time,
                "content": message_content
            }

        except:
            message = {
                "sender": lastSender,
                "time": lastTime,
                "content": driver.get_text_from_xpath(
                    xpath["only_message"].format(pos=i))
            }

        print(message, "\n")
        # insert single message to collection of currently scraped conversation
        current_col.insert_one(message)

driver.close()
