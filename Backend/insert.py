from classes.core import ChromeBrowser
from classes.core import CSV
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import UnexpectedAlertPresentException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.keys import Keys
import pymongo
import sys
import time

## Access database ##
client = pymongo.MongoClient("mongodb://mongo:27017/")
db = client['convrt_database']
conversations = db['conversations']
userData = db['userData']

## Parse credentials ##
parsed_userData = userData.find_one()
username = parsed_userData["email"]
password = parsed_userData["password"]

# xpaths to LinkedIn components
xpath = {
    "login_user": "/html/body/div/main/div[3]/form/div[1]/input",
    "login_password": "/html/body/div/main/div[3]/form/div[2]/input",
    "login_button": "/html/body/div/main/div[3]/form/div[3]/button",
    "messages_count": "/html/body/div[8]/div[5]/div[1]/div/div/div[2]/div[4]/div/ul/li",
    "chat_form": "//form",
    "chat_input": "//form/div[3]/div/div[1]/div[1]",
    "chat_input_tag": "//form/div[3]/div/div[1]/div[1]/p",
    "chat_input_div": "//form/div[3]/div/div[1]/div[2]",
    "send_button": "//footer/div[2]/div[1]/button",
    "name": "//div[1]/div/a/div/div/dl/dt/h2"
}

## open chrome driver instance ##
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
        messages_database = list(db[conversation["ID"]].find())

        if count_messages_linkedin == len(messages_database):
            print("No new messages in this chat!")
            pass
        else:
            for i in range(count_messages_linkedin, len(messages_database)):
                print(i)
                try:
                    input_field = driver.find_element_by_xpath(
                        xpath["chat_input"])
                    send_button = driver.find_element_by_xpath(
                        xpath["send_button"])
                    chat_text = messages_database[i]["content"]

                    print(chat_text)

                    input_field.send_keys(chat_text)
                    time.sleep(2)
                    send_button = driver.find_element_by_xpath(
                        xpath["send_button"])
                    send_button.click()
                    time.sleep(1)

                except UnexpectedAlertPresentException:
                    print("Alert occured. Continuing...")

driver.quit()
