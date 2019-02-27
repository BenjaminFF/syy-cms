<template>
  <div class="container">
    <el-button @click="addDialogVisible=true">新增管理员</el-button>
    <div class="my-table">
      <el-row class="my-table__header">
        <el-col :span="8">用户名</el-col>
        <el-col :span="6">角色</el-col>
        <el-col :span="6">创建时间</el-col>
        <el-col :span="4" style="text-align: center">操作</el-col>
      </el-row>
      <el-scrollbar class="my-table__scrollbar">
        <div class="my-table__body">
          <el-row v-for="admin in admins" class="l-mtag-table__tr">
            <el-col :span="8">{{admin.Name}}</el-col>
            <el-col :span="6">{{admin.Accessset.Name}}</el-col>
            <el-col :span="6">{{admin.CreatedTime}}</el-col>
            <el-col :span="4" style="text-align: center">
              <el-button type="text" @click="openEditDialog(admin)">重置密码</el-button>
              <el-button type="text" @click="openDelDialog(admin)">删除</el-button>
            </el-col>
          </el-row>
        </div>
      </el-scrollbar>
    </div>
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="30rem">
      <el-form ref="mForm" :model="addAdminInfo" label-width="80px" :rules="addAdminRules">
        <el-form-item label="用户名" prop="Name">
          <el-input v-model="addAdminInfo.Name"></el-input>
        </el-form-item>
        <el-form-item label="所属角色" prop="AccesssetId">
          <el-select v-model="addAdminInfo.AccesssetId" style="width: 100%">
            <el-option
              v-for="role in roles"
              :key="role.Id"
              :label="role.Name"
              :value="role.Id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="Password">
          <el-input v-model="addAdminInfo.Password" type="password"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible=false">取 消</el-button>
    <el-button type="primary" @click="addAdminToServer('mForm')" :loading="isUploading">添加</el-button>
  </span>
    </el-dialog>
    <el-dialog
      title="编辑角色"
      :visible.sync="editDialogVisible"
      width="30rem">
      <el-form ref="mForm" label-width="80px" :rules="editAdminRoles" :model="editAdminInfo">
        <el-form-item label="用户名">
          {{curAdmin.Name}}
        </el-form-item>
        <el-form-item label="所属角色">
          {{curAdmin.Accessset.Name}}
        </el-form-item>
        <el-form-item label="密码" prop="Password">
          <el-input v-model="editAdminInfo.Password" type="password"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible=false">取 消</el-button>
    <el-button type="primary" @click="updateAdminToServer('mForm')" :loading="isUploading">确定</el-button>
  </span>
    </el-dialog>
    <el-dialog
      title="提示"
      :visible.sync="delDialogVisible"
      width="30%">
      <span>确认删除这个角色管理员吗？</span>
      <span slot="footer" class="dialog-footer">
    <el-button @click="delDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="deleteAdminToServer" :loading="isUploading">删除</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  import JSONBigInt from 'json-bigint'
  import math from 'mathjs'

  export default {
    name: "",
    data() {
      return {
        addDialogVisible: false,
        editDialogVisible: false,
        admins: [],
        roles: [],
        curAdmin: {},
        isUploading: false,
        myRules: {},
        curRole: {},
        delDialogVisible: false,
        editAdminRoles: {},
        addAdminInfo: {},
        editAdminInfo:{}
      }
    },
    created() {
      this.init();
      this.fetchData();
    },
    methods: {
      init() {
        this.addDialogVisible = false;
        this.delDialogVisible = false;
        this.admins = [];
        this.roles = [];
        this.addAdminInfo = {
          Id: 0,
          Name: "",
          AccesssetId: "",
          Accessset: "",
          Password: ""
        };
        this.editAdminInfo={
          Id:"",
          Password:""
        }
        this.curAdmin = {
          Id: "",
          Name: "",
          Accessset: "",
          Password: "",
        }
        this.isUploading = false;
        this.addAdminRules = {
          Name: [
            {message: '用户名不能为空', trigger: 'blur', required: true, min: 1},
          ],
          AccesssetId: [
            {required: true, message: '请选择角色', trigger: 'change'}
          ],
          Password: [
            {message: '密码不能低于6位', trigger: 'blur', required: true, min: 6}
          ]
        }
        this.editAdminRoles = {
          Password: [
            {message: '密码不能低于6位', trigger: 'blur', required: true, min: 6}
          ]
        }
      },
      async fetchData() {
        await this.axios.get('/ssnwtweb/api/admins/list').then((res) => {
          this.admins = res.data;
          console.log(this.admins);
        });
        await this.axios.get('/ssnwtweb/api/accesssets/list', {transformResponse: [data => data]}).then((res) => {
          let roles = JSONBigInt.parse(res.data);
          let filteredRoles = [];
          roles.forEach((role) => {
            if (role.Access.toString() != math.eval('1<<62').toString()) {
              filteredRoles.push(role);
            }
          });
          this.roles = filteredRoles;
        });
      },

      addAdminToServer(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.isUploading = true;
            this.addAdminInfo.Accessset = {Id: this.addAdminInfo.AccesssetId};
            delete this.addAdminInfo.AccesssetId;
            this.axios.post('/ssnwtweb/api/admins/register', this.addAdminInfo).then((res) => {
              this.axios.get('/ssnwtweb/api/admins/list').then((res) => {
                this.admins = res.data;
                this.addDialogVisible = false;
                this.isUploading = false;
              });
            });
          } else {
            return false;
          }
        });
      },
      openEditDialog(admin) {
        this.curAdmin=admin;
        this.editAdminInfo.Id=admin.Id;
        this.editDialogVisible = true;
      },
      updateAdminToServer(formName){
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.isUploading = true;
            this.axios.post('/ssnwtweb/api/admins/resetpassword', this.editAdminInfo).then((res) => {
              this.axios.get('/ssnwtweb/api/admins/list').then((res) => {
                this.admins = res.data;
                this.isUploading = false;
                this.editDialogVisible = false;
                console.log(res.data);
              });
            });
          } else {
            return false;
          }
        });
      },
      openDelDialog(admin) {
        this.curAdmin = admin;
        this.delDialogVisible = true;
      },
      deleteAdminToServer() {
        this.isUploading = true;
        this.axios.post('/ssnwtweb/api/admins/delete', this.curAdmin).then((res) => {
          this.axios.get('/ssnwtweb/api/admins/list').then((res) => {
            this.admins = res.data;
            this.isUploading = false;
            this.delDialogVisible = false;
          });
        });
      }
    },
    watch: {
      addDialogVisible() {
        if (!this.addDialogVisible) {
          this.addAdminInfo = {
            Id: 0,
            Name: "",
            Accessset: {
              Id: ""
            },
            AccesssetId: "",
            Password: ""
          };
          this.$refs.mForm.resetFields();
        }
      },
      editDialogVisible() {
        if (!this.editDialogVisible) {
          this.editAdminInfo={
            Id:"",
            Password:""
          }
          this.$refs.mForm.resetFields();
        }
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
  .my-table__scrollbar {
    width: 100%;
    height: 90%;
  }

  .my-table__scrollbar .el-scrollbar__wrap {
    overflow-x: hidden;
  }
</style>
