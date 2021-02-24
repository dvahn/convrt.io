<template>
  <div class="about">
    <h1>Welcome to CONVRT!</h1>
    <h2>Sign in or create a <router-link to="/signup">new account</router-link>.</h2>
    <head>
      <meta charset="utf-8" />
      <title>CONVRT.io</title>
    </head>
      <div id="loginOverlay">
          <!-- <form id="loginForm" action="/" method="POST"> -->
          <div id="loginForm">
            <div class="loginComponents" id="loginComponents">
              <input id="username" class="loginInput" v-model="username" placeholder="Username" required>
              <br>
              <input id="password" type="password" class="loginInput" v-model="password" placeholder="Password" required>
              <br>
              <button @click="login" id="loginButton" class="loginButton">LOGIN</button>
            </div> 
          </div>
          {{ error }}
          <!-- </form>  -->
      </div>
    <div id="preloader">
      <div id="loader"></div>
    </div>
  </div>
</template> 
<script>
import axios from 'axios';

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',

      error: ''
    }
  },
  methods: {
    login () {
      let user = {
        username: this.username,
        password: this.password
      }
    // CHANGE ROUTE HERE
    axios.post("http://ec2-13-59-233-180.us-east-2.compute.amazonaws.com:3000/login", user)
      .then(res => {
        if (res.status === 200) {
          this.error = '';
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', res.data.user);
          this.$router.push('/home');
        }
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
  font-size: 150%;
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
</style>