import axios from "axios";

const url = "http://localhost:3000/";

class ApiService {
  // get conversations
  static getConversations() {}

  // get message Feeds
  static getMessageFeeds() {}
  // get labels
  static getLabels() {}
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
  static sendMessage() {}
  // add label
  static addLabel() {}
  // create label
  static createLabel() {}
}

export default ApiService;
