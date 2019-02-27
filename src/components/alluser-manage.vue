<template>
  <div class="container">
    <div>
      状态
      <el-select v-model="curStatus" placeholder="请选择" @change="statusChange">
        <el-option
          v-for="status in allStatus"
          :key="status.value"
          :label="status.label"
          :value="status.value">
        </el-option>
      </el-select>
    </div>
    <div class="my-table">
      <el-row class="my-table__header">
        <el-col :span="3">昵称</el-col>
        <el-col :span="3">手机号</el-col>
        <el-col :span="4">注册时间</el-col>
        <el-col :span="4">上次登录时间</el-col>
        <el-col :span="3">登陆方式</el-col>
        <el-col :span="2">状态</el-col>
        <el-col :span="4" style="text-align: center">操作</el-col>
      </el-row>
      <el-scrollbar class="alluser-table__scrollbar">
        <div class="my-table__body">
          <el-row v-for="user in users" class="l-mtag-table__tr">
            <el-col :span="3">{{user.Username}}</el-col>
            <el-col :span="3">{{user.Phone}}</el-col>
            <el-col :span="4">{{user.RegisterTime}}</el-col>
            <el-col :span="4">{{user.LastLoginTime}}</el-col>
            <el-col :span="3">{{user.Logonmethod}}</el-col>
            <el-col :span="2">{{user.Enabled==true?'已启用':'已禁用'}}</el-col>
            <el-col :span="4" style="text-align: center">
              <el-button type="text" @click="toggleUserStatus(user,true)" :disabled="user.Enabled">启用</el-button>
              <el-button type="text" @click="openbanDialog(user)" :disabled="!user.Enabled">禁用</el-button>
            </el-col>
          </el-row>
        </div>
      </el-scrollbar>
      <div style="width: 100%;height: 10%;display: flex;justify-content: center;align-items: center">
        <el-pagination
          :current-page.sync="pages.curPage"
          @current-change="handlePageChange"
          layout="prev, pager, next, jumper"
          :page-count="pages.totalPages">
        </el-pagination>
      </div>
    </div>
    <el-dialog
      title="提示"
      :visible.sync="banDialogVisible"
      width="30%">
      <span>确认禁用这个用户吗？</span>
      <span slot="footer" class="dialog-footer">
    <el-button @click="banDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="toggleUserStatus(curUser,false)" :loading="isUploading">禁用</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "",
    data() {
      return {
        allStatus: [],
        curStatus: null,
        users: [],
        pages: {},
        banDialogVisible:false,
        curUser:{},
        isUploading:false
      }
    },
    created() {
      this.init();
      this.fetchData();
    },
    methods: {
      init() {
        this.allStatus = [
          {label: '全部', value: null},
          {label: '禁用', value: false},
          {label: '非禁用', value: true}
        ]
        this.pages = {
          curPage: 1,
          totalPages: 5,
          numsperpage: 20
        }
      },
      async fetchData(enabled) {
        let countParams=null;
        if(enabled!=null){
          countParams={
            enabled:enabled
          }
          console.log('gg');
        }
        await this.axios.get('/ssnwtweb/api/admins/usercount', {
          params:countParams
        }).then((res) => {
          console.log(res.data);
          let count = res.data;
          let numsperpage = 20;
          let totalPages = parseInt(count / numsperpage) == count / numsperpage ? parseInt(count / numsperpage) : parseInt(count / numsperpage) + 1;
          this.pages = {
            curPage: 1,
            totalPages: totalPages,
            numsperpage: numsperpage
          }
        });
        if(enabled==null){
          countParams={
            page: this.pages.curPage,
            numsperpage: this.pages.numsperpage,
          }
        }else {
          countParams={
            enabled:enabled,
            page: this.pages.curPage,
            numsperpage: this.pages.numsperpage,
          }
        }
        await this.axios.get('/ssnwtweb/api/admins/listuser', {
          params: countParams
        }).then((res) => {
          this.users = res.data;
          console.log(this.users);
        });
      },
      async toggleUserStatus(user,enabled){
        console.log(user);
        let formData=new FormData();
        formData.set('userid',user.Id);
        formData.set('enabled',enabled);
        let config = {
          headers: {'Content-Type': 'multipart/form-data'}
        };
        await this.axios.post('/ssnwtweb/api/admins/enabledisableuser',formData,config).then((res)=>{
          if(!enabled){
            this.banDialogVisible=false;
          }
        });
        user.Enabled=enabled;
      },
      openbanDialog(user){
        this.banDialogVisible=true;
        this.curUser=user;
      },
      handlePageChange() {
        let countParams=null;
        let enabled=this.curStatus;
        if(enabled==null){
          countParams={
            page: this.pages.curPage,
            numsperpage: this.pages.numsperpage,
          }
        }else {
          countParams={
            enabled:enabled,
            page: this.pages.curPage,
            numsperpage: this.pages.numsperpage,
          }
        }
        this.axios.get('/ssnwtweb/api/admins/listuser', {
          params: countParams
        }).then((res) => {
          this.users = res.data;
        });
      },
      statusChange(){
        console.log(this.curStatus);
        this.fetchData(this.curStatus);
      }
    }
  }
</script>

<style scoped>
  .container {
    width: 100%;
    height: 100%;
    padding: 2% 5%;
    box-sizing: border-box;
  }

  .my-table {
    margin-top: 2%;
    width: 100%;
    height: 80%;
    color: #606266;
    background-color: white;
    box-shadow: 0px 0px 30px 0px rgba(0, 0, 0, 0.06);
    border-radius: 10px;
    position: relative;
  }

  .my-table__header {
    width: 96%;
    margin-left: 2%;
    height: 10%;
    display: flex;
    align-items: center;
    padding: 1rem;
  }

  .my-table__body {
    width: 96%;
    height: 90%;
    margin-left: 2%;
    box-sizing: border-box;
  }
</style>

<style>
  .alluser-table__scrollbar {
    width: 100%;
    height: 80%;
  }

  .alluser-table__scrollbar .el-scrollbar__wrap {
    overflow-x: hidden;
  }
</style>
