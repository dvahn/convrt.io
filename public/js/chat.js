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
      init();
    }
  })
  .catch((error) => console.log(error));

// SET UP CONVERSATIONS
function createConversation(name, image, id) {
  let conversationList = document.getElementById("conversation-list");

  let convo = document.createElement("div");
  convo.className = "conversation";
  convo.id = id;

  let img = document.createElement("img");
  img.src = image;
  img.alt = name;

  let title = document.createElement("span");
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
  initConversations();
  document.getElementById("send").addEventListener("click", sendMessage);
  initLabels();
}

function initConversations() {
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
      sender = "You";
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

    fetch("/chat", {
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

document.getElementById("newLabelInput").addEventListener("keydown", function (e) {
  if (e.keyCode === 13) {
    toggleNewLabel();
    createNewLabel();
  }
});

// TODO: REPLACE BY FUNCTION
document.getElementById("deleteConversation").addEventListener("click", function () {
  console.log("Clicked DELETE");
  //TODO: delete current conversation from DB and LinkedIn (if possible)
});

// LABELS

// INITIALIZE LABELS
async function initLabels() {
  // FETCH LABELS FROM API
  await fetch("http://127.0.0.1:3000/api/labels")
    .then((res) => res.json())
    .then((data) => {
      let labels = data;
      allLabels = [
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
      for (label of labels) {
        allLabels.push({
          name: label.name,
          tags: label.tags,
        });
      }
    })
    .catch((error) => console.log(error));

  // CLEAR UP LABEL LIST
  let labelContainer = document.getElementById("label-list");
  labelContainer.innerHTML = "";

  // SET UP LABEL LIST
  for (label of allLabels) {
    let labelDiv = document.createElement("div");
    labelDiv.className = "label";
    labelDiv.onclick = onLabelClick;
    labelDiv.id = label.name;

    let labelText = document.createElement("span");
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

  // SET UP LABEL DROPDOWN
  selectableLabelsList = document.getElementById("selectableLabels");
  selectableLabelsList.innerHTML = "";
  for (label of allLabels) {
    container = document.createElement("div");
    container.className = "dropdown-item";
    elem = document.createElement("p");
    elem.innerText = label.name;
    container.appendChild(elem);
    container.addEventListener("click", addLabel);
    selectableLabelsList.appendChild(container);
  }
}

// SORT CHATS BY LABEL
function onLabelClick() {
  let tags = [];
  let labelName;
  // GET NAME AND TAGS OF CURRENT LABEL
  for (let label of allLabels) {
    if (label.name === this.id) {
      tags = label.tags;
      labelName = label.name;
    }
  }

  // ONLY SHOW CONVERSATIONS WITH GIVEN LABEL
  document.getElementById("conversation-list").innerHTML = "";
  for (chat of allChats) {
    if (labelName === "All Messages") {
      createConversation(chat.name, chat.image, chat.ID);
    } else if (chat.label === labelName) {
      createConversation(chat.name, chat.image, chat.ID);
    }
  }

  // SET CLICKED LABEL TO ACTIVE
  let current = document.getElementById("label-list").getElementsByClassName("active");
  if (current[0].id !== this.id) {
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  }

  // SET UP ONCLICK FUNCTIONS FOR CONVERSATIONS
  initConversations();
}

// ADD LABEL TO CONVERSATION
function addLabel(event) {
  document.getElementById("selectableLabels").style.display = "none";
  let label = event.target.innerText;
  let id;
  currentChat = document.getElementById("currentContact").innerHTML;

  for (chat of allChats) {
    if (chat.name === currentChat) {
      chat.label = label;
      id = chat.ID;
    }
  }
  fetch("/chat", {
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

async function createNewLabel() {
  let newLabelName = document.getElementById("newLabelInput").value;
  let newLabelTags = [];

  allLabels.push({
    name: newLabelName,
    tags: newLabelTags,
  });
  // UPDATE/REINITIALIZE LABELS
  toggleNewLabel();
  initLabels();
  location.reload();

  await fetch("/chat", {
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
}

// TOGGLE INPUT BOX FOR NEW LABEL
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

// SEARCH
function search() {
  let input = document.getElementById("searchInput");
  let filter = input.value.toUpperCase();

  let labels = document.querySelectorAll("div.label span");
  let conversations = document.querySelectorAll("div.conversation span");

  labels.forEach((label) => {
    let labelName = label.innerText;
    if (labelName.toUpperCase().indexOf(filter) > -1) {
      document.getElementById(labelName).style.display = "";
    } else {
      document.getElementById(labelName).style.display = "none";
    }
  });

  conversations.forEach((conv) => {
    let name = conv.innerText;
    if (name.toUpperCase().indexOf(filter) > -1) {
      conv.parentElement.style.display = "";
    } else {
      conv.parentElement.style.display = "none";
    }
  });
}

// TODO:
// - make convos deletable (popup, deleting convo from DOM-Tree, backup in DB)
// - implement search functionality
// - make DB entries persistent (docker-compose.yml ==> mongo/volumes )
