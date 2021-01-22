from classes.core import ChromeBrowser
from classes.core import CSV
from selenium.common.exceptions import NoSuchElementException
import pymongo
import sys
import time

## Create database ##
client = pymongo.MongoClient("mongodb://mongo:27017/")
db = client['convrt_database']
conversations = db['conversations']
userData = db['userData']
all_ids = []

for conversation in conversations.find():
    all_ids.append(conversation["ID"])

## Parse credentials ##
parsed_userData = userData.find_one()
username = parsed_userData["email"]
password = parsed_userData["password"]

# XPATH
xpath = {
    # changes irregularly! (daily?)
    "login_user": "/html/body/div/main/div[3]/form/div[1]/input",
    "login_password": "/html/body/div/main/div[3]/form/div[2]/input",
    "login_button": "/html/body/div/main/div[3]/form/div[3]/button",
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
    login_input = driver.find_element_by_xpath(xpath["login_user"])
    login_input.send_keys(username)

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

        messages_database = list(db[id].find())

        if id not in all_ids:
            # get name from DOM
            name = driver.get_text_from_xpath(xpath["name"].format(pos=i))

            # get image from DOM
            image = driver.find_element_by_xpath(
                xpath["image"].format(pos=i))
            image_src = image.get_attribute("src")

            # add name + id to conversation collection
            new = {"name": name, "ID": id, "image": image_src, "label": ""}
            conversations.insert_one(new)

            # create collection for currently scraped conversation
            current_col_new = db[id]

            lastSender = ""
            lastTime = ""

            for i in range(len(messages_database) + 3, driver.get_elements_size(xpath["number_messages"])+1):

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

                # insert single message to collection of currently scraped conversation
                current_col_new.insert_one(message)

        else:
            current_col = db[id]
            count_messages_linkedin = 0
            for n in range(3, driver.get_elements_size(xpath["number_messages"])+1):
                count_messages_linkedin += 1
            if count_messages_linkedin == len(messages_database):
                pass
            else:
                lastSender = ""
                lastTime = ""
                for i in range(len(messages_database) + 3, driver.get_elements_size(xpath["number_messages"])+1):
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

                    current_col.insert_one(message)

# TODO: look for empty conversations

## INSERT MESSAGES ##


def insert():
    for conversation in conversations.find():
        driver.get("https://www.linkedin.com/messaging/thread/" +
                   conversation["ID"])

        driver.wait()

        count_messages_linkedin = 0
        for n in range(3, driver.get_elements_size(xpath["messages_count"])+1):
            count_messages_linkedin += 1

        if count_messages_linkedin == 0:
            pass
        else:
            messages_database_inserting = list(db[conversation["ID"]].find())

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
