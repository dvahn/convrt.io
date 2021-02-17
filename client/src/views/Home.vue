<template>
  <div class="home">
    <head>
    <meta charset="utf-8" />
    <title>CONVRT.io</title>
    <!-- <link rel="stylesheet" type="text/css" media="screen" href="./css/styles.css" /> -->
  </head>
  <body>
    <div id="chat-container">
      <div id="search-container">
        <input onkeyup="search()" id="searchInput" type="text" placeholder="Search" />
      </div>
      <div id="conversation-list">
        <div v-on:click="setActive(conversation)" class="conversation"
          v-for="conversation in conversations"
          v-bind:item="conversation"
          v-bind:key="conversation.ID"
          >
          <img :src=conversation.image>
          <span class="title-text">{{ conversation.name }}</span>
          <div class="conversation-message">
            <p>This is a placeholder</p>
          </div>
        </div>
      </div>
      <div id="label-list">
        <div class="label"
          v-for="label of labels"
          v-bind:item="label"
          v-bind:key="label + currentContact.ID"
        >
          <span class="title-text">{{ label }}</span>
        </div>
      </div>
      <div id="new-label-container">
        <a id="newLabel" href="#" onclick="toggleNewLabel()"> <img id="newLabelIcon" src="../assets/images/add.svg" /> </a>
        <div id="newLabelForm" style="display: none">
          <input id="newLabelInput" class="newLabelFormInput" placeholder="New Label"/>
        </div>

        <div id="newLabelConfirm" class="new-label-confirm" style="display: none;">
          <a onclick="createNewLabel()">+</a>
        </div>

      </div>
      <div id="chat-title">
        <span id="currentContact"></span>
        <img @click="refresh" id="refresh" src="../assets/images/mail.svg">
        <div class="dropdown">
          <img class="dropdown" id="addLabel" src="../assets/images/hinzufuegen.svg" alt="Add Label" onclick="addLabel()" />
          <div id="selectableLabels" class="dropdown-content"></div>
        </div>
        <img id="deleteConversation" src="../assets/images/trash.svg" alt="Delete Conversation" />
      </div>
      <div id="chat-message-list">
        <div class="message-content"
          v-for="message in activeMessageFeed"
          v-bind:item="message"
          v-bind:key="message.time + message.sender + message.content"
          >
          <div class="message-row other-message"
          v-if="message.sender == currentContact.name"
          >
            <div class="message-content">
              <img :src=currentContact.image>
              <div class="message-text">
                {{ message.content }}
              </div>
              <div class="message-time">
                {{ message.time }}
              </div>
            </div>
          </div>
          <div v-else class="message-row you-message">
            <div class="message-content">
              <div class="message-text">
                {{ message.content }}
              </div>
              <div class="message-time">
                {{ message.time }}
              </div>
            </div>
          </div>
        </div> 
      </div>
      <div id="chat-form">
        <img id="attach" src="../assets/images/attachement.svg" alt="Add Attachment" />
        <input v-model="message" name="message[content]" id="textInput" type="text" placeholder="Type a message..." />
        <img  v-on:click="sendMessage" id="send" src="../assets/images/senden.svg" alt="Send Message" />
      </div>
    </div>
  </body>
  </div>
</template>
<script>
import ApiService from '../ApiService';

export default {
  name: 'Home',
  data() {
    return {
      user: '',
      conversations: '',
      activeConversation: '',
      currentContact: '',
      activeMessageFeed: '',
      labels: '',
      message: ''
    }
  },
  async created() {
    if (localStorage.getItem('token') === null) {
      this.$router.push('/');
    }
    this.user = localStorage.getItem('user');
    this.conversations = await ApiService.getConversations(this.user);
    this.labels = await ApiService.getLabels(this.user);  
  },
  mounted() {
    this.user = localStorage.getItem('user');
  },
  methods: {
    logout() {
      localStorage.clear();
      this.$router.push('/');
    },
    setActive(conv) {
      this.activeConversation = conv.ID;
      this.currentContact = conv;
      for (conv of this.conversations) {
        if(conv["ID"] == this.activeConversation) {
          this.activeMessageFeed = conv.message_feed;
        }
      }
    },
    refresh() {
      let user = {
        username: this.user,
      }
      ApiService.refresh(user);
    },
    async sendMessage() {
      await ApiService.sendMessage(this.message, this.user, this.currentContact["ID"]);
      this.conversations = await ApiService.getConversations(this.user);
      this.setActive(this.currentContact);
      this.message = '';
    }
  }
}
</script>
<style scoped>
  * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
}

html {
  font-family: Arial, Helvetica, sans-serif;
  background: linear-gradient(to right, #57c1eb, #006cac);
  font-size: 10px;
}

body {
  display: grid;
  place-items: center;
}

.home {
  background: linear-gradient(to right, #57c1eb, #006cac);  
}

#chat-container {
  display: grid;
  grid-template-columns: 14% 22% 64%;
  grid-template-rows: 10% 78% 12%;

  min-width: 1000px;
  max-width: 1000px;
  max-height: 800px;
  height: 95vh;
  background: #fff;
  border-radius: 10px;
}

#conversation-list,
#new-label-container {
  background: #006cac;
}

#label-list {
  background: #006cac;
}

#chat-title,
#chat-form {
  background: #eee;
}

#search-container {
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-start: 1;

  background: #243641;
  border-radius: 10px 0 0 0;
  box-shadow: 0 1px 3px -1px rgba(0, 0, 0, 0.75);
  z-index: 1;

  display: grid;
  align-items: center;
  padding: 0 20px;
}

#search-container input {
  color: #303030;
  outline: none;
  font-weight: bold;
  border-radius: 2px;
  height: 30px;
  border: 0;
  padding-left: 48px;
  padding-right: 20px;
  font-size: 1.4rem;
  background: url("../assets/images/suche.svg") no-repeat rgba(255, 255, 255, 0.9);
  background-position: 15px center;
  background-size: 20px 20px;
}

#search-container input::placeholder {
  color: #6a6a6a;
  font-weight: bold;
}

#new-label-container {
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 3;
  grid-row-start: 3;

  border-top: 1px solid rgba(0, 0, 0, 0.5);
  border-radius: 0 0 0 10px;
  padding: 0 15px;

  display: grid;
  grid: 40px/40px 1fr 40px;
  align-content: center;
}

#new-label-container a {
  display: grid;
  place-content: center center;
  background: #f3f3f3;
  border-radius: 100%;
  color: #000000;
  text-decoration: none;
  font-size: 3.6rem;
}

#chat-title {
  grid-column-start: 3;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-start: 1;

  color: #243641;
  font-weight: bold;
  font-size: 2rem;
  border-radius: 0 10px 0 0;
  box-shadow: 0 1px 3px -1px rgba(0, 0, 0, 0.75);
  padding: 0 20px;

  display: grid;
  grid: 36px / 1fr 36px 36px 36px;
  grid-gap: 30px;
  align-content: center;
  align-items: center;
  z-index: 2;
}

#chat-title > img {
  cursor: pointer;
}

#chat-form {
  grid-column-start: 3;
  grid-column-end: 3;
  grid-row-start: 3;
  grid-row-start: 3;

  border-radius: 0 0 10px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.5);

  display: grid;
  grid: 51px / 30px 1fr 38px;
  align-content: center;
  align-items: center;
  grid-gap: 15px;
  padding-left: 42px;
  padding-right: 22px;
}

#chat-form input {
  outline: none;
  padding: 15px;
  border: 2px solid #ddd;
  color: #330;
  border-radius: 6px;
  font-size: 1.4rem;
}

#chat-form img:hover {
  cursor: pointer;
}

#label-list {
  border-right: 1px solid rgba(0, 0, 0, 0.5);
  grid-column-start: 1;
  grid-column-end: 1;
  grid-row-start: 2;
  grid-row-start: 2;
}

.label {
  color: #ddd;
  font-size: 1.3rem;
  border-bottom: 0.2px solid rgba(0, 0, 0, 0.25);
  padding: 20px 20px 20px 15px;
}

.label:hover {
  cursor: pointer;
}

.label.active {
  background: #00304d;
}

#conversation-list {
  grid-column-start: 2;
  grid-column-end: 2;
  grid-row-start: 2;
  grid-row-start: 2;

  overflow-y: scroll;
}

.conversation {
  display: grid;
  grid-template-columns: 40px 1fr max-content;
  grid-gap: 10px;
  color: #ddd;
  font-size: 1.3rem;
  text-align: left;
  border-bottom: 0.2px solid rgba(0, 0, 0, 0.25);
  padding: 20px 20px 20px 15px;
}

.conversation.active,
.conversation:hover {
  background: #00304d;
}

.conversation:hover {
  cursor: pointer;
}

.conversation > img {
  grid-row: span 2;
  height: 40px;
  width: 40px;
  border-radius: 100%;
}

.title-text {
  font-weight: bold;
  color: #f3f3f3;
  padding-left: 5px;
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
  font-size: 70%;
}

.created-date {
  color: #ddd;
  font-size: 1rem;
}

.conversation-message {
  grid-column: span 2;
  padding-left: 5px;
  font-size: 70%;
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
}

#chat-message-list {
  grid-column-start: 3;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-start: 2;

  display: flex;
  flex-direction: column-reverse;
  padding: 0 20 px;
  overflow-y: scroll;
}

.message-row {
  display: grid;
  grid-template-columns: 70%;
  margin-bottom: 20px;
}

.message-content {
  display: grid;
}

.message-content img {
  width: 45px;
  height: 45px;
  margin-top: 15px;
}

.you-message {
  justify-content: end;
}

.you-message .message-content {
  justify-items: end;
  padding-right: 20px;
}

.other-message {
  justify-items: start;
}

.other-message .message-content {
  grid-template-columns: 48px 1fr;
  grid-column-gap: 15px;
  padding-left: 20px;
}

.message-row img {
  border-radius: 100%;
  grid-row: span 2;
}

.message-text {
  padding: 9px 14px;
  font-size: 1.6rem;
  margin-bottom: 5px;
  z-index: 1;
}

.message-time {
  font-size: 1.3rem;
  color: #777;
}

.you-message .message-text {
  background: #0048aa;
  color: #f3f3f3;
  border: 1px solid #0048aa;
  border-radius: 14px 14px 0 14px;
}

.other-message .message-text {
  background: #f3f3f3;
  color: #111;
  border: 1px solid #ddd;
  border-radius: 14px 14px 14px 0;
}

::-webkit-scrollbar {
  display: none;
}

.new-label-confirm {
  cursor: pointer;
}

.newLabelFormInput {
  width: 90%;
  padding-left: 5%;
  margin-left: 5%;
  margin-right: 5%;
  height: 40px;
  border-radius: 2px;
  border-style: none;
  outline: none;
  font-size: 1.4rem;
  border: 2px solid #ddd;
}

.newLabelIconRotated {
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -o-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

.dropdown {
  position: relative;
  display: inline-block;
  padding-top: 10%;
}

.dropdown-content {
  display: none;
  position: absolute;
  border-radius: 5px;
  background-color: #f9f9f9;
  min-width: 200px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  padding: 12px 16px;
  z-index: 1;
}

.dropdown-item {
  background-color: #dfdfdf;
  margin-bottom: 5px;
  padding: 5px 8px;
  border-radius: 4px;
}

.dropdown-content:hover {
  cursor: pointer;
}

.dropdown:hover .dropdown-content {
  display: block;
}
</style>
