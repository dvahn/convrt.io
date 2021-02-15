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
    axios.post("http://localhost:3000/login", user)
      .then(res => {
        if (res.status === 200) {
          this.error = '';
          console.log(res);
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', res.data.user);
          this.$router.push('/home');
        }
      }, err => {
        console.log(err);
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