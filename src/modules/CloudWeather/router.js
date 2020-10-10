import Vue from 'vue';
import VueRouter from 'vue-router';
import commonRouter from '../../common/router';
import weather from './views/weather';
Vue.use(VueRouter);

const router = new VueRouter({
	base: process.env.BASE_URL,
	routes: [
		...commonRouter,
		{
			path: '/',
			redirect: '/index',
		},
		{
			path: '/index',
			name: 'weather',
			component: weather,
		},
	],
});

export default router;
