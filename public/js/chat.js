let initialLoad = true;
let loggedIn = false;
let allChats = [];
let allLabels = [
  {
    name: "All Messages",
    tags: [],
  },
  {
    name: "Job",
    tags: [],
  },
  {
    name: "Family",
    tags: [],
  },
  {
    name: "Hobby",
    tags: [],
  },
];

// GET ALL CONTACTS
let persons = [];
fetch("http://127.0.0.1:3000/api/conversations")
  .then((res) => res.json())
  .then((data) => {
    if (data) {
      persons = data;
      for (person of persons) {
        allChats.push(person);
        createConversation(person.name, person.image, person.ID);
      }
      console.log(allChats);
      getLabels();
      init();
    }
  })
  .catch((error) => console.log(error));

if (loggedIn) {
  document.getElementById("loginOverlay").style.display = "none";
  document.getElementById("chat-container").style.display = "";
} else {
  document.getElementById("loginOverlay").style.display = "";
  document.getElementById("chat-container").style.display = "none";
}

// SET UP CONVERSATIONS
function createConversation(name, image, id) {
  let conversationList = document.getElementById("conversation-list");

  let convo = document.createElement("div");
  convo.className = "conversation";
  convo.id = id;

  let img = document.createElement("img");
  img.src = image;
  img.alt = name;

  let title = document.createElement("div");
  title.className = "title-text";
  textnodeTitle = document.createTextNode(name);
  title.appendChild(textnodeTitle);

  let previewMessage = document.createElement("div");
  previewMessage.className = "conversation-message";

  // TODO: get recent message
  textnodeMessage = document.createTextNode("This is a message");
  previewMessage.appendChild(textnodeMessage);

  convo.appendChild(img);
  convo.appendChild(title);
  convo.appendChild(previewMessage);

  conversationList.appendChild(convo);
}

function setUpMessageFeed(id, image) {
  let messages = [];
  fetch("http://127.0.0.1:3000/api/messageFeeds")
    .then((res) => res.json())
    .then((data) => {
      for (obj of data) {
        if (obj[id]) {
          messages = obj[id];
        }
      }

      // DELETE MESSAGE FEED OF LAST SELECTED CONTACT
      let messageFeed = document.getElementById("chat-message-list");
      messageFeed.innerHTML = "";

      let currentContact = document.getElementById(id).getElementsByClassName("title-text")[0].innerHTML;

      // SET CHAT TITLE
      let chatTitleContainer = document.getElementById("chat-title");
      let currentTitle = document.getElementById("currentContact");

      let chatTitle = document.createElement("span");
      chatTitle.textContent = currentContact;
      chatTitle.id = "currentContact";

      chatTitleContainer.removeChild(currentTitle);
      chatTitleContainer.insertBefore(chatTitle, chatTitleContainer.firstChild);

      // SET UP MESSAGE FEED FOR CURRENT CONTACT
      for (message of messages) {
        let messageContent = document.createElement("div");
        messageContent.className = "message-content";

        let messageContainer = document.createElement("div");

        if (message.sender === currentContact) {
          messageContainer.className = "message-row other-message";
          let img = document.createElement("img");
          img.src = image;
          img.alt = currentContact;
          messageContent.appendChild(img);
        } else {
          messageContainer.className = "message-row you-message";
        }

        let textDiv = document.createElement("div");
        textDiv.className = "message-text";
        textDiv.innerText = message.content;

        let timeDiv = document.createElement("div");
        timeDiv.className = "message-time";
        let time = document.createTextNode(message.time);
        timeDiv.appendChild(time);

        messageContent.appendChild(textDiv);
        messageContent.appendChild(timeDiv);
        messageContainer.appendChild(messageContent);

        messageFeed.insertBefore(messageContainer, messageFeed.firstChild);
      }
    })
    .catch((error) => console.log(error));
}

function init() {
  let conversations = document.getElementById("conversation-list").getElementsByClassName("conversation");

  if (conversations.length != 0) {
    conversations[0].className += " active";
    let first = document.getElementById("conversation-list").getElementsByClassName("active");
    setUpMessageFeed(first[0].id, first[0].childNodes[0].src);
  }
  for (conversation of conversations) {
    conversation.addEventListener("click", function () {
      let current = document.getElementById("conversation-list").getElementsByClassName("active");
      current[0].className = current[0].className.replace(" active", "");
      this.className += " active";

      // SET UP MESSAGE FEED
      let id = current[0].id;
      let img = current[0].childNodes[0].src;
      if (id) {
        setUpMessageFeed(id, img);
      }
    });
  }
  document.getElementById("send").addEventListener("click", sendMessage);
  if (initialLoad) {
    initialLoad = false;
    initLabels();
  }
}

// INITIALIZE LABELS
function initLabels() {
  let labelContainer = document.getElementById("label-list");
  labelContainer.innerHTML = "";

  for (label of allLabels) {
    let labelDiv = document.createElement("div");
    labelDiv.className = "label";
    labelDiv.onclick = onLabelClick;
    labelDiv.id = label.name;

    let labelText = document.createElement("div");
    labelText.className = "title-text";
    labelText.innerHTML = label.name;

    labelDiv.appendChild(labelText);
    labelContainer.appendChild(labelDiv);
  }

  // ADD EVENTLISTENER TO LABELS
  let labels = document.getElementById("label-list").getElementsByClassName("label");

  for (label of labels) {
    label.addEventListener("click", function () {
      let current = document.getElementById("label-list").getElementsByClassName("active");
      if ((current = !this)) {
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";
      }
    });
  }
  labels[0].className += " active";
}

// SORT CHATS BY LABEL
function onLabelClick() {
  let tags = [];
  let labelName;
  // GET TAGS FOR CURRENT LABEL
  for (let label of allLabels) {
    if (label.name === this.id) {
      tags = label.tags;
      labelName = label.name;
    }
  }
  document.getElementById("conversation-list").innerHTML = "";
  for (chat of allChats) {
    if (labelName === "All Messages") {
      createConversation(chat.name, chat.image, chat.ID);
    } else if (chat.label === labelName) {
      createConversation(chat.name, chat.image, chat.ID);
    }
  }

  let current = document.getElementById("label-list").getElementsByClassName("active");
  if (current[0].id !== this.id) {
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  }
  init();
}

function sendMessage() {
  let text = document.getElementById("textInput").value;
  let messageList = document.getElementById("chat-message-list");
  let id;
  let sender;
  currentContactId = document.getElementsByClassName("conversation active")[0].id;

  for (chat of allChats) {
    if (chat.ID === currentContactId) {
      id = chat.ID;
      // TODO: get name of user profile
      sender = "Daniel von Ahn";
    }
  }

  if (text !== "") {
    let yourMessage = document.createElement("div");
    yourMessage.className = "message-row you-message";

    let contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    let textDiv = document.createElement("div");
    textDiv.className = "message-text";
    textnode = document.createTextNode(text);
    textDiv.appendChild(textnode);
    contentDiv.appendChild(textDiv);

    let timestamp = document.createElement("div");
    timestamp.className = "message-time";
    datenode = document.createTextNode(getDate());
    timestamp.appendChild(datenode);
    contentDiv.appendChild(timestamp);

    yourMessage.appendChild(contentDiv);
    messageList.insertBefore(yourMessage, messageList.firstChild);

    fetch("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          type: "message",
          content: text,
          id: id,
          sender: sender,
          time: getDate(),
        },
      }),
    });
  }
  document.getElementById("textInput").value = "";
}

const months = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  10: "Okt",
  11: "Nov",
  12: "Dec",
};

function getDate() {
  let today = new Date();
  // let dd = String(today.getDate()).padStart(2, "0");
  // let mm = String(today.getMonth() + 1).padStart(2, "0");
  // today = months[mm] + " " + dd;
  let time = today.toLocaleTimeString();
  let splittedTime = time.split(":");

  if (splittedTime[0] <= 12) {
    time = splittedTime[0] + ":" + splittedTime[1] + " AM";
  } else {
    time = (splittedTime[0] % 12) + ":" + splittedTime[1] + " PM";
  }
  return time;
}

// SEND ON ENTER (maybe more shortcuts? (new Label e.g.))
document.getElementById("textInput").addEventListener("keydown", function (e) {
  if (e.keyCode === 13) {
    sendMessage();
  }
});

document.getElementById("refresh").addEventListener("click", function () {
  console.log("Clicked REFRESH");
  fetch("/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        type: "refresh",
      },
    }),
  });
});

document.getElementById("deleteConversation").addEventListener("click", function () {
  console.log("Clicked DELETE");
  //TODO: delete current conversation from DB and LinkedIn (if possible)
});

// LABELS

// FETCH LABELS FROM API
function getLabels() {
  //allLabels = [];
  fetch("http://127.0.0.1:3000/api/labels")
    .then((res) => res.json())
    .then((data) => {
      labels = data;
      for (label of labels) {
        allLabels.push({
          name: label.name,
          tags: label.tags,
        });
      }
    })
    .catch((error) => console.log(error));
}

// ADD LABEL TO CONVERSATION
function addLabel() {
  let label = prompt("Add Label:");
  let id;
  currentChat = document.getElementById("currentContact").innerHTML;

  for (chat of allChats) {
    if (chat.name === currentChat) {
      chat.label = label;
      id = chat.ID;
    }
  }
  fetch("/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        type: "addedLabel",
        label: label,
        id: id,
      },
    }),
  });
}

function toggleNewLabel() {
  let icon = document.getElementById("newLabelIcon");
  let background = document.getElementById("newLabel");
  if (document.getElementById("newLabelForm").style.display === "none") {
    document.getElementById("newLabelForm").style.display = "block";
    document.getElementById("newLabelConfirm").style.display = "block";
    icon.className = "newLabelIconRotated";
    background.style = "background-color: red;";
  } else {
    document.getElementById("newLabelForm").style.display = "none";
    document.getElementById("newLabelConfirm").style.display = "none";
    icon.className = "";
    background.style = "background-color: white;";
  }
}

function closeLabelForm() {
  document.getElementById("newLabelForm").style.display = "none";
}

function createNewLabel() {
  let newLabelName = document.getElementById("newLabelInput").value;
  let newLabelTags = [];

  console.log(newLabelName);

  fetch("/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        type: "createdLabel",
        name: newLabelName,
        tags: newLabelTags,
      },
    }),
  });
  allLabels.push({
    name: newLabelName,
    tags: newLabelTags,
  });
  toggleNewLabel();
  updateLabels();
}

function updateLabels() {
  getLabels();
  // initLabels();
  console.log(allLabels);
}

function login() {
  let user = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  loggedIn = true;

  document.getElementById("loginOverlay").style.display = "none";
  document.getElementById("chat-container").style.display = "";

  fetch("/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        type: "login",
        user: user,
        password: password,
      },
    }),
  });
}

// TODO:
// - make convos deletable (popup, deleting convo from DOM-Tree, backup in DB)
// - implement search functionality
// - make DB entries persistent (docker-compose.yml ==> mongo/volumes )
