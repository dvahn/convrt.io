from classes.core import ChromeBrowser
from classes.core import CSV
from selenium.common.exceptions import NoSuchElementException
import pymongo
import sys
import time

## get user from args ##
if len(sys.argv) > 0:
    user = sys.argv[1]

## database ##
client = pymongo.MongoClient(
    "mongodb://ec2-13-59-233-180.us-east-2.compute.amazonaws.com:27017/convrt")
db = client['convrt_database']
users = db['users']
conversations = db['conversations']
all_ids = []


## Parse credentials ##
# QUERY AN DB MIT USERNAME
# HIER DANN AUCH MESSAGEFEED SETZEN

query = {"username": user}

# TODO: make users unique
current_user = list(users.find(query))[0]
email = current_user["li_mail"]
password = current_user["li_password"]
conversations_ids = current_user["conversations"]

if len(conversations_ids) > 0:
    for conv_id in conversations_ids:
        all_ids.append(conv_id)

# XPATH
xpath = {
    # changes irregularly! (daily?)
    "login_user": "/html/body/div/main/div[3]/div[1]/form/div[1]/input",
    "login_password": "/html/body/div/main/div[3]/div[1]/form/div[2]/input",
    "login_button": "/html/body/div/main/div[3]/div[1]/form/div[3]/button",
    "number_conversations": "/html/body/div[8]/div[5]/div[1]/div/div/div[1]/ul/li",
    "id_container": "//li[{pos}]/div/a",
    "name": "//li[{pos}]/div/a/div[2]/div/div[1]/h3",
    "image": "//li[{pos}]/div/a/div[1]/div[1]/img",
    "number_messages": "//div/div/div[2]/div[4]/div/ul/li",
    # TODO: xpath for day
    "sender": "//div/div/div[2]/div[4]/div[1]/ul/li[{pos}]/div/div[1]/a/span",
    "sender_2": "//div/div/div[2]/div[4]/div/ul/li[10]/div/div[1]/a/span",
    "time": "//li[{pos}]/div/div[1]/time",
    "message": "//div/div/div[2]/div[4]/div/ul/li[{pos}]/div/div[2]/p",
    "only_message": "//div/div/div[2]/div[4]/div[1]/ul/li[{pos}]/div/div/p",
    "only_message_2": "//div/div/div[2]/div[4]/div[1]/ul/li[{pos}]/div/div[2]/p",
    "messages_count": "/html/body/div[8]/div[5]/div[1]/div/div/div[2]/div[4]/div/ul/li",
    "chat_form": "//form",
    "chat_input": "//form/div[3]/div/div[1]/div[1]",
    "chat_input_tag": "//form/div[3]/div/div[1]/div[1]/p",
    "chat_input_div": "//form/div[3]/div/div[1]/div[2]",
    "send_button": "//footer/div[2]/div[1]/button",
}

driver = ChromeBrowser()

## check if user is logged in ##
try:
    driver.get("https://www.linkedin.com/login")

    driver.wait()

    login_input = driver.find_element_by_xpath(xpath["login_user"])
    login_input.send_keys(email)

    login_password = driver.find_element_by_xpath(xpath["login_password"])
    login_password.send_keys(password)

    login_button = driver.find_element_by_xpath(xpath["login_button"])
    login_button.click()

    driver.wait()

except NoSuchElementException:
    print("Already logged in!")


# start with message thread
driver.get("https://www.linkedin.com/messaging/")
id_of_first_conversation = driver.current_url.split('/')[-2]
driver.get("https://www.linkedin.com/messaging/thread/" +
           id_of_first_conversation)

# LEARNING: wait until DOM is build up in browser
driver.wait()

## CRAWLING MESSAGES ##


def crawl():

    for i in range(1, driver.get_elements_size(xpath["number_conversations"])-1):

        # get id from DOM
        id_container = driver.find_element_by_xpath(
            xpath["id_container"].format(pos=i))
        id = id_container.get_attribute("href").split("/")[5]

        # call next conversation
        driver.get("https://www.linkedin.com/messaging/thread/"+id+"/")
        driver.wait()

        # QUERY AN DB MIT USERNAME
        # messages_database = list(db[users].find())

        if id not in all_ids:
            # get name from DOM
            name = driver.get_text_from_xpath(xpath["name"].format(pos=i))

            # get image from DOM
            image = driver.find_element_by_xpath(
                xpath["image"].format(pos=i))
            image_src = image.get_attribute("src")

            # add id to conversation array of user
            conversations_ids.append(id)
            new = {"$set": {"conversations": conversations_ids}}
            users.update_one(query, new)

            # create new entry in conversations collection
            # current_col_new = db[id]

            message_feed = []

            lastSender = ""
            lastTime = ""

            for i in range(3, driver.get_elements_size(xpath["number_messages"])+1):

                try:
                    sender = driver.get_text_from_xpath(
                        xpath["sender"].format(pos=i))
                    time = driver.get_text_from_xpath(
                        xpath["time"].format(pos=i))
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

                # insert single message to message_feed array
                message_feed.insert(0, message)
            new_conversation = {"ID": id, "associated_user": user, "name": name, "image": image_src,
                                "show": True, "labels": ["All Messages"], "message_feed": message_feed}
            # create new conversation in conversation collection
            conversations.insert_one(new_conversation)

        else:
            current = conversations.find({"ID": id})
            messages_database = current[0]['message_feed']
            count_messages_database = len(messages_database)
            count_messages_linkedin = 0
            for n in range(3, driver.get_elements_size(xpath["number_messages"])+1):
                count_messages_linkedin += 1
            if count_messages_linkedin == count_messages_database:
                pass
            else:
                lastSender = ""
                lastTime = ""
                for i in range(count_messages_database + 3, driver.get_elements_size(xpath["number_messages"])+1):
                    try:
                        sender = driver.get_text_from_xpath(
                            xpath["sender"].format(pos=i))
                        time = driver.get_text_from_xpath(
                            xpath["time"].format(pos=i))
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

                    # current.insert_one(message)
                    messages_database.insert(0, message)

                messages = {"$set": {"message_feed": messages_database}}
                conversations.update_one({"ID": id}, messages)

# TODO: look for empty conversations

## INSERT MESSAGES ##


def insert():

    ids_of_current_user = current_user["conversations"]

    for conv_id in ids_of_current_user:
        driver.get("https://www.linkedin.com/messaging/thread/" +
                   conv_id)

        driver.wait()

        count_messages_linkedin = 0
        for n in range(3, driver.get_elements_size(xpath["messages_count"])+1):
            count_messages_linkedin += 1

        if count_messages_linkedin == 0:
            pass
        else:
            messages_database_inserting = list(
                conversations.find({"ID": conv_id}))

            if count_messages_linkedin == len(messages_database_inserting):
                pass
            else:
                for i in range(count_messages_linkedin, len(messages_database_inserting)):
                    input_field = driver.find_element_by_xpath(
                        xpath["chat_input"])
                    send_button = driver.find_element_by_xpath(
                        xpath["send_button"])
                    chat_text = messages_database_inserting[i]["content"]

                    input_field.send_keys(chat_text)
                    time.sleep(2)
                    send_button = driver.find_element_by_xpath(
                        xpath["send_button"])
                    send_button.click()
                    time.sleep(1)


print("CRAWLING")
crawl()

time.sleep(5)

print("INSERTING")
insert()

driver.quit()
