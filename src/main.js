// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios'
import VueAxios from 'vue-axios'

import VueParticles from 'vue-particles'
Vue.use(VueParticles)

axios.interceptors.response.use(
  response => {
    let userInfo=localStorage.getItem('userInfo');
    if(userInfo!=null){
      if(response.data==-3||response.data==-4){
        localStorage.removeItem('userInfo');
        return response;
      }
      let updatedUserInfo= JSON.parse(userInfo);
      updatedUserInfo.loginTime=Date.now();
      localStorage.setItem('userInfo',JSON.stringify(updatedUserInfo));
    }
    return response;
  },
  err => {
    return Promise.reject(err);
  }
);

Vue.use(VueAxios, axios)

Vue.config.productionTip = false
Vue.use(element)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
