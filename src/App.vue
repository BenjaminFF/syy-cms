<template>
  <el-row id="app">
    <el-col :span="4" class="app-sidebar">
      <div class="app-sidebar__header">
        <img src="./assets/headicon.svg">
        <div style="margin-top: 1rem">{{username}}</div>
      </div>
      <el-menu
        :router="true"
        :default-active="defaultActive"
        background-color="#1F62B0"
        text-color="#fff" ref="myELmenu">
        <el-submenu index="2" style="color: white">
          <template slot="title">
            <span>用户管理</span>
          </template>
          <el-menu-item index="/alluser-manage" class="m-el-submenu-item">全部用户</el-menu-item>
        </el-submenu>
        <el-submenu index="1" style="color: white" v-if="isSuperAccess">
          <template slot="title">
            <span>后台管理员</span>
          </template>
          <el-menu-item index="/role-manage" class="m-el-submenu-item">角色管理</el-menu-item>
          <el-menu-item index="/admin-manage" class="m-el-submenu-item">管理员管理</el-menu-item>
        </el-submenu>
        <el-menu-item index="/setting" class="m-el-submenu-item">设置</el-menu-item>
      </el-menu>
    </el-col>
    <el-col :span="20" class="main">
      <div class="main-header">
        <i class="cms sky-setting" style="font-size: 2rem;margin-right: 1rem;color: #585858;cursor: pointer" @click="linkTo('/setting')"></i>
        <i class="cms sky-poweroff"
           style="font-size: 2rem;padding-left:1rem;margin-right: 1rem;color: #636363;border-left: 1px solid gray;cursor: pointer" @click="logout()"></i>
      </div>
      <router-view></router-view>
    </el-col>
  </el-row>
</template>

<script>

  export default {
    name: 'App',
    data() {
      return {
        defaultActive: '',
        isSuperAccess:false,
        username:""
      }
    },
    created() {
      this.init();
    },
    methods: {
      init() {
        this.defaultActive = this.$route.path == '/' ? '/alluser-manage' : this.$route.path;
        this.userInfo=JSON.parse(localStorage.getItem('userInfo'));
        if(this.userInfo!=null){
          this.isSuperAccess=this.userInfo.Accessset.Id==1?true:false;
          this.username=this.userInfo.Name;
        }
      },
      linkTo(path) {
        this.$router.push(path);
        this.defaultActive=path;
      },
      logout(){
        this.axios.get('/ssnwtweb/api/admins/logout').then((res)=>{
          localStorage.removeItem('userInfo');
          this.$router.push('/');
        });
      },
      flushELMenu(to,from){
        console.log(from.path);
        this.$refs.myELmenu.activeIndex=this.$route.path;
        this.userInfo=JSON.parse(localStorage.getItem('userInfo'));
        if(from.path=='/login'){
          if(this.userInfo!=null){
            this.isSuperAccess=this.userInfo.Accessset.Id==1?true:false;
            this.username=this.userInfo.Name;
          }
        }
      }
    },
    watch:{
      '$route':'flushELMenu'
    }
  }
</script>


<style>
  @import "assets/iconfont/iconfont.css";
  @import "assets/lib/index.css";
  /*@import "../sk-theme/lib/index.css";*/
  @import "../node_modules/animate.css/animate.css";

  body, html {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body, html, div {
    margin: 0;
    padding: 0;
  }

  #app {
    width: 100%;
    height: 100%;
  }

  .main {
    height: 100%;
    background-color: rgba(179, 212, 252, 0.11);
    position: relative;
  }

  .main-header {
    width: 100%;
    height: 6rem;
    background-color: white;
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.08);
    z-index: 10;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .m-el-submenu-item {
    background-color: transparent !important;
  }

  .el-menu {
    border-right: none !important;
    user-select: none;
  }

  .el-menu-item, .el-submenu__title {
    font-size: 1rem;
    background-color: transparent;
  }

  .el-menu-item.is-active {
    background-color: rgba(179, 212, 252, 0.11) !important;
  }

  .el-menu-item:hover {
    background-color: rgba(179, 212, 252, 0.11) !important;
  }

  .el-submenu__title:hover {
    background-color: rgba(179, 212, 252, 0.11) !important;
  }
</style>
