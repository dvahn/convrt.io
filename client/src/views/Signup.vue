<template>
  <div class="about">
    <h1>Sign up</h1>
    <h2>Already having an account? <router-link to="/">Sign in</router-link>.</h2>
    <head>
      <meta charset="utf-8" />
      <title>CONVRT.io</title>
    </head>
      <div id="loginOverlay">
          <!-- <form id="loginForm" action="/signup" method="POST"> -->
          <div id="loginForm">
            <div class="loginComponents" id="loginComponents">
              <input id="username" class="loginInput" name="username" v-model="username" placeholder="New username" required>
              <br>
              <input id="password" type="password" class="loginInput" name="password" v-model="password" placeholder="New password" required>
              <br>
              <input id="li_mail" type="text" class="loginInput" name="li_mail" v-model="li_mail" placeholder="Your LinkedIn e-mail address" required>
              <br>
              <input id="li_password" type="password" class="loginInput" name="li_password" v-model="li_password" placeholder="Your LinkedIn password" required>
              <br>
              <button @click="signup" id="loginButton" class="loginButton">Sign up</button>
            </div> 
            {{ error }}
          <!-- </form>  -->
          </div>
      </div>
      <div id="preloader">
        <div id="loader"></div>
      </div>
  </div>
</template> 
<script>
import axios from "axios";

export default {

  name: 'Signup',
  data() {
    return {
      username: '',
      password: '',
      li_mail: '',
      li_password: '',

      error: ''
    }
  },
  methods: {
    signup() {
      let newUser = {
        username: this.username,
        password: this.password,
        li_mail: this.li_mail,
        li_password: this.li_password,
        labels: [],
        conversations: []
      }
      axios.post("http://localhost:3000/signup", newUser)
        .then(res => {
          console.log(res); 
          this.error = ''; 
          this.$router.push('/');
        }, err => {
          this.error = err.response.data.error;
        });
    }
  }


}
</script>
<style scoped>
#loginOverlay {
  width: 100%;
  height: 100%;
}

#loginForm {
  width: 30%;
  height: 30%;
  margin-left: 35%;
  margin-top: 3%;
  background-color: #0c4263;
  border-radius: 12px;
}

.loginComponents {
  padding-top: 10%;
  width: 100%;
  height: 100%;
}

.loginInput {
  width: 70%;
  height: 15%;
  margin-left: auto;
  margin-bottom: 5%;
  border-radius: 5px;
  border-style: none;
  font-size: 130%;
  padding-left: 10px;
}

.loginButton {
  width: 40%;
  height: 15%;
  margin-left: auto;
  margin-bottom: 5%;
  border-radius: 7px;
  border-style: none;
  font-size: 180%;
}

.loginButton:hover {
  background-color: #b9b9b9;
  cursor: pointer;
}

#preloader {
  position: fixed;
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

</style>