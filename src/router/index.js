import Vue from 'vue'
import Router from 'vue-router'
import loginPage from '@/components/login-page'
import allUserPage from '@/components/alluser-manage'
import adminPage from '@/components/admin-manage'
import rolePage from '@/components/role-manage'
import settingPage from '@/components/setting-page'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: allUserPage
    },
    {
      path: '/alluser-manage',
      name: 'allUserPage',
      component: allUserPage
    },
    {
      path: '/role-manage',
      name: 'rolePage',
      component: rolePage
    },
    {
      path: '/admin-manage',
      name: 'adminPage',
      component: adminPage
    },
    {
      path: '/setting',
      name: 'settingPage',
      component: settingPage
    },
    {
      path: '/login',
      name: 'loginPage',
      component: loginPage
    }
  ]
})

router.beforeEach((to, from, next) => {
  let userInfo=localStorage.getItem('userInfo');
  if(userInfo!=null){
    if(Date.now()-JSON.parse(userInfo).loginTime<=3600*1000){
      next({path:to.path=='/login'?'/alluser-manage':null});
    }else {
      localStorage.removeItem('userInfo');
      next({path:to.path=='/login'?null:'/login'});
    }
  }else {
    next({path:to.path=='/login'?null:'/login'});
  }
});

export default router;
