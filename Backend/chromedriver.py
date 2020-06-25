#!/usr/bin/python3

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException

import pymongo

## Create database ##
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client['convrt_database']
messages_col = db['messages']

test = {"name": "Daniel", "address": "test"}
messages_col.insert_one(test)

print(client.list_database_names())

## Loading web driver ##
driver = webdriver.Chrome(
    '/Users/daniel/Documents/Master/ChatBot Projekt/convrt/Backend/chromedriver')

## Navigating to login section ##
driver.get("https://www.linkedin.com/login")

# import browser user profil

## LOGIN ##

# TODO: get Chrome user profile
input_username = driver.find_element_by_id('username')

# enter username here
input_username.send_keys('')

input_password = driver.find_element_by_id('password')

# enter password here
input_password.send_keys('')

login_button = driver.find_element_by_tag_name('button')
login_button.click()

## Navigate to Messages ##
delay = 10
try:
    message_icon = WebDriverWait(driver, delay).until(
        EC.presence_of_element_located((By.ID, 'messaging-tab-icon')))
except TimeoutException:
    print("Loading took too much time!")

message_icon.click()

## Scrape messages ##

# get all conversations #
# conversations anders holen, id aendert sich, xpath aendert sich auch

delay = 10
try:
    message_icon = WebDriverWait(driver, delay).until(
        EC.presence_of_element_located((By.ID, 'messaging-tab-icon')))
except TimeoutException:
    print("Loading took too much time!")

# does not work:
# conversations = driver.find_elements_by_css_selector(
#     '.msg-conversation-listitem.msg-conversations-container__convo-item.msg-conversations-container__pillar.ember-view')

# does not really work, to many elements with "ember" in name
conversations = driver.find_elements_by_css_selector('[id*="ember" i]')

# for scrolling:
# conversations.sendKeys(Keys.ARROW_DOWN);

print(conversations)

for conversation in conversations:
    # TODO: read content
    sender = ''
    # does not work:
    # sender = driver.find_element_by_css_selector(
    #     '.msg-spinmail-thread__name.t-14.t-black.t-bold')
    content = ''
    date_time = ''
    url = ''

## Close driver ##
# driver.close()
