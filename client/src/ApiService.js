import axios from "axios";

const url = "http://localhost:3000/";

class ApiService {
  // get conversations
  static async getConversations(user) {
    const conversations = await axios.get(url + "api/" + user + "/conversations");
    return conversations.data;
  }
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
      let data = {
        content: messageText,
        time: this.getDate(),
        sender: sender,
        receiver_id: receiver_id,
      };
      await axios.post(url + "sendMessage", data).then(
        (res) => {
          console.log("Sending message.", res);
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }
  // add label
  static async addLabel(contact, label) {
    let data = {
      contact: contact,
      label: label,
    };
    await axios.post(url + "addLabel", data).then(
      (res) => {
        console.log("Adding new label to contact.", res);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  // create label
  static async createLabel(label, user) {
    let data = {
      name: label,
      user: user,
    };
    await axios.post(url + "createLabel", data).then(
      (res) => {
        console.log("Creating new label.", res);
      },
      (err) => {
        console.log(err);
      }
    );
  }
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
