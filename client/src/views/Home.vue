<template>
  <div class="home">
    <head>
    <meta charset="utf-8" />
    <title>CONVRT.io</title>
    <!-- <link rel="stylesheet" type="text/css" media="screen" href="./css/styles.css" /> -->
  </head>
  <body>
    <div class="logout">
      <button v-on:click="logout" >Sign out</button>
    </div>
    <div id="chat-container">
      <div id="search-container">
        <input onkeyup="search()" id="searchInput" type="text" placeholder="Search" />
      </div>
      <div id="conversation-list">
        <div v-on:click="setActive(conversation)" 
          class="conversation" 
          v-bind:class="{ active: conversation.ID == currentContact.ID }"
          v-for="conversation in activeConversations"
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
        <div v-on:click="selectLabel(label)" class="label" v-bind:class="{ active : label == currentLabel}"
          v-for="label of labels"
          v-bind:item="label"
          v-bind:key="label + currentContact.ID"
        >
          <span class="title-text">{{ label }}</span>
        </div>
        <div class="new-label">
          <input v-model="newLabel" class="label-input" type="text">
          <button v-on:click="createLabel" class="add-label-button" v-if="newLabel !== ''">Add Label</button>
        </div>
      </div>
      <div id="new-label-container">
        <!-- <a id="newLabel" href="#" onclick="toggleNewLabel()"> <img id="newLabelIcon" src="../assets/images/add.svg" /> </a> -->
        <!-- <div id="newLabelForm" style="display: none"> -->
          <!-- <input id="newLabelInput" class="newLabelFormInput" placeholder="New Label"/> -->
        <!-- </div> -->

        <!-- <div id="newLabelConfirm" class="new-label-confirm" style="display: none;"> -->
          <!-- <a onclick="createNewLabel()">+</a> -->
        <!-- </div> -->
      </div>
      <div id="chat-title">
        <span class="chat-title-name" id="currentContact">{{ currentContact.name }}</span>
        <img v-on:click="refresh" id="refresh" src="../assets/images/mail.svg">
        <div class="dropdown">
          <img class="dropdown" id="addLabel" src="../assets/images/hinzufuegen.svg" alt="Add Label"/>
          <div id="selectableLabels" class="dropdown-content">
            <div v-on:click="addLabel(label)" class="dropdown-item" 
              v-for="label of labels"
              v-bind:item="label"
              v-bind:key="label"
              >
              <p>{{ label }}</p>
            </div>
          </div>
        </div>
        <img id="deleteConversation" src="../assets/images/trash.svg" alt="Delete Conversation" />
      </div>
      <div id="chat-message-list">
        <div class="greeting" v-if="!currentContact">
          <h1>Welcome to CONVRT.io!</h1>
          <br>
          <p>Start importing your LinkedIn messages by clicking the refresh icon.</p>
          <p>After that you will see them on the left side and you are good to go.</p>
          <br>
          <div class="spinner-container">
            <div id="preloader">
              <div id="loader"></div>
            </div>
          </div>
        </div>
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
  computed: {
    activeConversations: function() {
      let activeConvos = [];
      for (let convo of this.conversations){
        if(convo.show) {
          activeConvos.push(convo);
        }
      }
      return activeConvos;   
    }
  },
  data() {
    return {
      user: '',
      conversations: '',
      activeConversation: '',
      currentContact: '',
      activeMessageFeed: '',
      labels: '',
      message: '',
      newLabel: '',
      currentLabel: ''
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
    this.currentLabel = "All Messages";
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
    selectLabel(label) {
      for (let convo of this.conversations) {
        if(convo.labels.includes(label)) {
          convo.show = true;
          this.currentContact = this.activeConversations[0];
          this.setActive(this.currentContact);
        } else {
          convo.show = false;
        }
      }
      this.currentLabel = label;
      
    },
    async refresh() {
      let user = {
        username: this.user,
      }
      await ApiService.refresh(user);
      this.conversations = await ApiService.getConversations(this.user);
      this.labels = await ApiService.getLabels(this.user);  
    },
    async sendMessage() {
      await ApiService.sendMessage(this.message, this.user, this.currentContact["ID"]);
      this.conversations = await ApiService.getConversations(this.user);
      this.setActive(this.currentContact);
      this.message = '';
    },
    async createLabel() {
      await ApiService.createLabel(this.newLabel, this.user);
      this.labels = await ApiService.getLabels(this.user);
      this.newLabel = '';
    },
    async addLabel(label) {
      await ApiService.addLabel(this.currentContact.ID, label);
      this.conversations = await ApiService.getConversations(this.user);
      // document.getElementById("selectableLabels").style.display = "none"
    },
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
  /* background: linear-gradient(to right, #57c1eb, #006cac); */
  font-size: 10px;
}

body {
  display: grid;
  place-items: center;
}

.home {
  /* background: linear-gradient(to right, #57c1eb, #006cac);   */
}

#chat-container {
  display: grid;
  grid-template-columns: 14% 22% 64%;
  grid-template-rows: 10% 78% 12%;

  min-width: 1000px;
  max-width: 1000px;
  max-height: 800px;
  margin-top: 2%;
  height: 95vh;
  background: #fff;
  border-radius: 10px;
  border: 1px solid rgb(100, 100, 100);
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

.chat-title-name {
  text-align: left;
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
  padding: 20px 20px 20px 20px;
  text-align: center;
}

.new-label {
  padding: 10px;
}

.label-input {
  outline: none;
  padding: 15px;
  width: 100%;
  height: 20px;
  border: 2px solid #ddd;
  color: #330;
  border-radius: 6px;
  font-size: 1.4rem;
}

.label:hover {
  cursor: pointer;
  background: #00304d;
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
  font-size: 1.15rem;
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
  padding-top: 20%;
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

.add-label-button {
  width: 90%;
  height: 5vh;
  margin-left: auto;
  margin-top: 5%;
  border-radius: 7px;
  border-style: none;
  font-size: 100%;
  color: white;
  background-color: rgb(44, 44, 44);
}

.add-label-button:hover {
  background-color: #c0c0c0;
  cursor: pointer;
  border: 1px solid rgb(44, 44, 44);
  color: black;
}

.greeting {
  text-align: center;
  padding-bottom: 30%;
}

.greeting h1 {
  font-size: 1.8rem;
}

.greeting p {
  font-size: 1.2rem;
}

.logout {
  display: grid;
  grid-template-columns: 10% 80% 10%;
  min-width: 900px;
  max-width: 900px;
}

.logout button {
  grid-column: 3;
}

.logout button:hover {
  cursor: pointer;
}

#preloader {
  position: relative;
  display: none;
  margin-top: 10%;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
#loader {
  display: block;
  position: relative;
  left: 50%;
  top: 50%;
  width: 150px;
  height: 150px;
  margin: -75px 0 0 -75px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #494949;
  -webkit-animation: spin 2s linear infinite;
  animation: spin 2s linear infinite;
}
#loader:before {
  content: "";
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #363636;
  -webkit-animation: spin 3s linear infinite;
  animation: spin 3s linear infinite;
}
#loader:after {
  content: "";
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  bottom: 15px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #000000;
  -webkit-animation: spin 1.5s linear infinite;
  animation: spin 1.5s linear infinite;
}
@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

.spinner-container {
  margin-top: 100px;
}

</style>
