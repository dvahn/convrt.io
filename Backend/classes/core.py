# -*- coding: utf-8 -*-
from selenium import webdriver
from configparser import ConfigParser
# from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
#from selenium.webdriver.firefox.firefox_profile import FirefoxProfile
#from selenium.webdriver.firefox.options import Options
# from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
#from selenium.webdriver.common.keys import Keys
#from selenium.webdriver.common.action_chains import ActionChains
# from selenium.common import exceptions
#from selenium.common.exceptions import NoSuchElementException
from datetime import datetime
import time
import sys
from random import seed
from random import randint

import csv


class ChromeBrowser(webdriver.Chrome, webdriver.Remote):
    def __init__(self):

        self.config = ConfigParser()
        self.config.read('crawl.config')
        self.mode = self.config.get('PROFILE', 'mode')
        self.profile = self.config.get('PROFILE', 'name')

        self.MIN_WAIT = int(self.config.get('GENERAL', 'min_wait'))
        self.MAX_WAIT = int(self.config.get('GENERAL', 'max_wait'))

        if self.mode == "REMOTE":
            executor = "http://" + \
                self.config.get('REMOTE', 'host') + ":4444/wd/hub"
            exec_path_chrome = self.config.get('REMOTE', 'exec_path_chrome')
            options = webdriver.ChromeOptions()  # Chrome Options
            # Extract this path from "chrome://version/"
            options.add_argument("--user-data-dir=" + exec_path_chrome)
            options.add_argument("--profile-directory=" + self.profile)
            options.add_argument("--window-size=700,1000 ")
            options.add_argument("--window-position=800,0")
            # LEARNING: headless necessary in remote mode
            # options.add_argument("--headless")
            # options.add_argument("--no-sandbox")
            # options.add_argument("--disable-dev-shm-usage")
            # options.add_argument("--disable-gpu")
            self = webdriver.Remote.__init__(
                self, command_executor=executor, desired_capabilities=options.to_capabilities())

            #self = webdriver.Remote.__init__(self, command_executor="http://127.0.0.1:4444/wd/hub", desired_capabilities=options.to_capabilities())

        if self.mode == "LOCAL":

            exec_path_driver = self.config.get('LOCAL', 'exec_path_driver')
            exec_path_chrome = self.config.get('LOCAL', 'exec_path_chrome')

            options = webdriver.ChromeOptions()  # Chrome Options
            # Extract this path from "chrome://version/"
            options.add_argument("--user-data-dir=" + exec_path_chrome)
            options.add_argument("--profile-directory=" + self.profile)
            options.add_argument("--window-size=700,1000 ")
            options.add_argument("--window-position=800,0")
            # LEARNING: scrap following does not work when headless browser
            # options.add_argument("--headless") # LEARNING: headless option yields wrong results for content
            # options.add_argument("--no-sandbox")
            # options.add_argument("--disable-dev-shm-usage")
            # options.add_argument("--disable-gpu")
            self = webdriver.Chrome.__init__(
                self, executable_path=exec_path_driver, options=options)

    # wait randomly within MIN_MAX_WAIT frame

    def wait(self):

        time.sleep(randint(self.MIN_WAIT, self.MAX_WAIT))

    # scroll to end of PAGE while DELAWY minutes when scrolling to next page
    def go_to_page(self, page):

        for i in range(1, page):
            self.execute_script(
                "window.scrollTo(0, document.body.scrollHeight)")
            new_height = self.execute_script(
                "return document.body.scrollHeight")
            if new_height == self.last_height:
                break
            self.last_height = new_height
            # waits 1s before it goes to the next page to cache DOM
            time.sleep(1)

    # LEARNING: better use get_elementS and extract text from list
    def get_element(self, xpath):

        #WebDriverWait(driver, DETECTION_ACCURACY).until(EC.presence_of_element_located((By.XPATH, xpath)))
        element = self.find_element_by_xpath(xpath)
        return element

    def get_elements(self, xpath):

        #WebDriverWait(driver, DETECTION_ACCURACY).until(EC.presence_of_element_located((By.XPATH, xpath)))
        elements = self.find_elements_by_xpath(xpath)
        return elements

    def get_text_from_xpath(self, xpath):

        content = self.get_element(xpath).text

        return content

    def get_nested_text_from_xpath(self, xpath):

        elements = self.get_elements(xpath)

        content = ""
        for elem in elements:
            content = content + elem.text

        return content

    def get_anchor_from_xpath(self, xpath):

        elements = self.get_elements(xpath)

        anchor = ""
        for elem in elements:
            anchor = anchor + elem.get_attribute('href')
        return anchor

    def get_elements_size(self, xpath):

        elements = self.get_elements(xpath)
        return len(elements)

    def are_elements_present(self, xpath):

        try:
            elements = self.get_elements(xpath)
            if elements:
                return True
            else:
                return False

        except:
            return False

        number_elements = self.get_elements_size(xpath)

        if number_elements > 0:
            return True
        else:
            return False

    def click_on_button(self, xpath):

        wait_time = self.config.get('GENERAL', 'wait_before_click')
        wait = WebDriverWait(self, int(wait_time))
        follow = wait.until(EC.element_to_be_clickable((By.XPATH, xpath)))
        follow.click()


class XPATHTest:

    def is_item_mandatory(item_name, mandatory_item_list):

        if item_name in mandatory_item_list:
            return True
        else:
            return False

    def is_item_present(driver, pos, test_flag, item_name, mandatory_item_list, xpath):
        if not driver.are_elements_present(xpath[item_name].format(pos)):

            if XPATHTest.is_item_mandatory(item_name, mandatory_item_list):
                print("-> " + item_name + " XPATH is wrong.")
                test_flag = False

        return test_flag

    def test(driver, pos, mandatory_item_list, xpath):

        test_flag = True

        if ("Account suspended" in driver.find_element_by_tag_name('body').text):
            print("account suspended")
            test_flag = False

        elif ("This account doesn’t exist" in driver.find_element_by_tag_name('body').text):
            print("account does not exist")
            test_flag = False
        else:

            for (key, value) in xpath.items():
                test_flag = XPATHTest.is_item_present(
                    driver, pos, test_flag, key, mandatory_item_list, xpath)

        return test_flag


class CSV:

    def _init(self):
        self.filename = result.csv

    def write_row_to_csv(self, row):

        try:

            with open(self.filename, 'a') as f:

                f.write(row)
        except:
            print("Error writing to CSV file")


# class FirefoxBrowser(webdriver.Firefox):

# 	def __init__(self, mode, profile):

# 		self.last_height = 0

# 		if (profile == "Sebastian"):
# 			firefox_profile = FirefoxProfile("/Users/testlab/Project/twitter/python/storage/browser/Firefox/Profiles/Sebastian/")
# 		if (profile == "ditCraft"):
# 			firefox_profile = FirefoxProfile("Users/testlab/Project/twitter/python/storage/browser/Firefox/Profiles/ditCraft")


# 		if mode == "local":
# 			options = Options()
# 			options.add_argument("--window-size=700,1000") # remark: does not work
# 			options.add_argument("--window-position=800,0")
# 			#options.headless = True
# 			firefox_profile.set_preference('browser.cache.disk.enable', True)
# 			firefox_profile.set_preference('browser.cache.memory.enable', True)
# 			firefox_profile.set_preference('browser.cache.offline.enable', True)
# 			firefox_profile.set_preference('network.cookie.cookieBehavior', 1)  #accept cookies from site, else set to 2
# 			firefox_profile.set_preference("browser.privatebrowsing.autostart", False)

# 			self = webdriver.Firefox.__init__(self, firefox_profile=firefox_profile)
# 			#self.set_window_position(800, 0)
# 			#self.set_window_size(700, 1000)


# 		if mode == "docker":
# 			print("no implemented yet")

# 	def go_to_page(self, page):

# 		for i in range(1, page):
# 			self.execute_script("window.scrollTo(0, document.body.scrollHeight)")
# 			new_height = self.execute_script("return document.body.scrollHeight")
# 			if new_height == self.last_height:
# 				break
# 			self.last_height = new_height
# 			time.sleep(delay)
