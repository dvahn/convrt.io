import axios from "axios";

const url = "http://localhost:3000/";

class ApiService {
  // get conversations
  static async getConversations(user) {
    const conversations = await axios.get(url + "api/" + user + "/conversations");
    return conversations.data;
  }
  // get message Feeds
  static getMessageFeeds() {}
  // get labels
  static async getLabels(user) {
    const users = await axios.get(url + "api/" + user + "/labels");
    return users.data[0].labels;
  }
  // refresh
  static refresh(user) {
    axios.post(url + "refresh", user).then(
      (res) => {
        console.log("refreshing", res);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  // send message
  static async sendMessage(messageText, sender, receiver_id) {
    if (messageText !== "") {
      let message = {
        content: messageText,
        time: this.getDate(),
        sender: sender,
        receiver_id: receiver_id,
      };
      await axios.post(url + "sendMessage", message).then(
        (res) => {
          console.log("Sending message", res);
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }
  // add label
  static addLabel() {}
  // create label
  static createLabel() {}
  // get time
  static getDate() {
    let today = new Date();
    let time = today.toLocaleTimeString();
    let splittedTime = time.split(":");

    if (splittedTime[0] <= 12) {
      time = splittedTime[0] + ":" + splittedTime[1] + " AM";
    } else {
      time = (splittedTime[0] % 12) + ":" + splittedTime[1] + " PM";
    }
    return time;
  }
}

export default ApiService;
