import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import 'element-ui/lib/theme-chalk/index.css';
import { MessageBox,Message } from 'element-ui';

//Vue.use(MessageBox);

Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$message=Message;
if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app');
