import Vue from 'vue';
import App from './App.vue';
import router from './router';
require('../../common/units'); //引入通用units

Vue.config.productionTip = false;
new Vue({
	router,
	render: (h) => h(App),
}).$mount('#app');
