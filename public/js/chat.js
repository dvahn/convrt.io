// DB stuff

// Get all persons
let persons = [];
fetch("http://127.0.0.1:3000/api/conversations")
  .then((res) => res.json())
  .then((data) => {
    persons = data;
    for (person of persons) {
      createConversation(person.name, person.image, person.ID);
    }
    init();
  })
  .catch((error) => console.log(error));

// Get conversations for each person

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
      // delete message Feed of last selected contact
      let messageFeed = document.getElementById("chat-message-list");
      messageFeed.innerHTML = "";

      let currentContact = document
        .getElementById(id)
        .getElementsByClassName("title-text")[0].innerHTML;

      // set chat title
      let chatTitleContainer = document.getElementById("chat-title");
      chatTitleContainer.innerHTML = "";

      let chatTitle = document.createElement("span");
      chatTitle.textContent = currentContact;

      //TODO: make static

      let deleteConversationIcon = document.createElement("img");
      deleteConversationIcon.src = "./images/trash.svg";
      deleteConversationIcon.alt = "Delete Conversation";
      deleteConversationIcon.id = "deleteConversation";

      let refreshIcon = document.createElement("img");
      refreshIcon.src = "./images/mail.svg";
      refreshIcon.alt = "Refresh Messages";
      refreshIcon.id = "refresh";

      chatTitleContainer.appendChild(chatTitle);
      chatTitleContainer.appendChild(refreshIcon);
      chatTitleContainer.appendChild(deleteConversationIcon);

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

      //set message feed
      let id = current[0].id;
      let img = current[0].childNodes[0].src;
      if (id) {
        setUpMessageFeed(id, img);
      }
    });
  }

  let labels = document
    .getElementById("label-list")
    .getElementsByClassName("label");

  for (label of labels) {
    label.addEventListener("click", function () {
      let current = document
        .getElementById("label-list")
        .getElementsByClassName("active");
      current[0].className = current[0].className.replace(" active", "");
      this.className += " active";
    });
  }
  document.getElementById("send").addEventListener("click", sendMessage);
}

function sendMessage() {
  let text = document.getElementById("textInput").value;
  let messageList = document.getElementById("chat-message-list");

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
          content: text,
        },
      }),
    });
  }
  document.getElementById("textInput").value = "";

  //TODO: add message to DB
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

// keydown events
document.getElementById("textInput").addEventListener("keydown", function (e) {
  if (e.keyCode === 13) {
    sendMessage();
  }
});

document.getElementById("refresh").addEventListener("click", function () {
  console.log("Clicked REFRESH");
  //TODO: call scraping script to get new messages from LinkedIn
  // $.ajax({
  //   url: "crawl.py",
  //   context: document.body,
  // }).done(function () {
  //   alert("finished python script");
  // });
});

// document
//   .getElementById("deleteConversation")
//   .addEventListener("click", function () {
//     console.log("Clicked DELETE");
//     //TODO: delete current conversation from DB and LinkedIn (if possible)
//   });
