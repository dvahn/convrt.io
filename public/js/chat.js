let allChats = [];

// GET ALL CONTACTS
let persons = [];
fetch("http://127.0.0.1:3000/api/conversations")
  .then((res) => res.json())
  .then((data) => {
    persons = data;
    for (person of persons) {
      allChats.push(person);
      createConversation(person.name, person.image, person.ID);
    }
    console.log(allChats);
    init("initialLoad");
  })
  .catch((error) => console.log(error));

// TODO:
// - make convos deletable (popup, deleting convo from DOM-Tree, backup in DB)
// - safe convos in DB
// - implement search functionality
// - get labels working (save labels to person)

// frontend stuff
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

      let currentContact = document
        .getElementById(id)
        .getElementsByClassName("title-text")[0].innerHTML;

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

function init(type) {
  let conversations = document
    .getElementById("conversation-list")
    .getElementsByClassName("conversation");

  conversations[0].className += " active";

  let first = document
    .getElementById("conversation-list")
    .getElementsByClassName("active");
  setUpMessageFeed(first[0].id, first[0].childNodes[0].src);

  for (conversation of conversations) {
    conversation.addEventListener("click", function () {
      let current = document
        .getElementById("conversation-list")
        .getElementsByClassName("active");
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
  if (type === "initialLoad") {
    initLabels();
  }
  document.getElementById("send").addEventListener("click", sendMessage);
}

// INITIALIZE LABELS
function initLabels() {
  let labelContainer = document.getElementById("label-list");

  for (label of LABELS) {
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

  let labels = document
    .getElementById("label-list")
    .getElementsByClassName("label");

  labels[0].className += " active";

  // ADD EVENTLISTENER TO LABELS
  for (label of labels) {
    label.addEventListener("click", function () {
      let current = document
        .getElementById("label-list")
        .getElementsByClassName("active");
      current[0].className = current[0].className.replace(" active", "");
      this.className += " active";
    });
  }
}

function sendMessage() {
  let text = document.getElementById("textInput").value;
  let messageList = document.getElementById("chat-message-list");
  let id;
  let sender;
  currentChat = document.getElementById("currentContact").innerHTML;

  // TODO: save messages for current session

  for (chat of allChats) {
    if (chat.name === currentChat) {
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
  "10": "Okt",
  "11": "Nov",
  "12": "Dec",
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

document
  .getElementById("deleteConversation")
  .addEventListener("click", function () {
    console.log("Clicked DELETE");
    //TODO: delete current conversation from DB and LinkedIn (if possible)
  });

// LABELS
// TODO: user can create own labels
const LABELS = [
  {
    name: "All Messages",
    tags: [],
  },
  {
    name: "Job",
    tags: ["job", "work", "project"],
  },
  {
    name: "Private",
    tags: ["family", "friends", "kids", "holidays"],
  },
  {
    name: "Friends",
    tags: ["Bob", "Jeff", "beer"],
  },
];

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

// SORT CHATS BY LABEL
function onLabelClick() {
  let tags = [];
  let labelName;
  // GET TAGS FOR CURRENT LABEL
  for (let label of LABELS) {
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
  init();
}
