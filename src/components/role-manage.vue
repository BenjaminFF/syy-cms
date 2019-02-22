<template>
  <div class="container">
    <el-button @click="addDialogVisible=true">新增角色</el-button>
    <div class="my-table">
      <el-row class="my-table__header">
        <el-col :span="10">角色名</el-col>
        <el-col :span="10">描述</el-col>
        <el-col :span="4" style="text-align: center">操作</el-col>
      </el-row>
      <el-scrollbar class="my-table__scrollbar">
        <div class="my-table__body">
          <el-row v-for="role in roles" class="l-mtag-table__tr">
            <el-col :span="10">{{role.Name}}</el-col>
            <el-col :span="10">{{role.Description}}</el-col>
            <el-col :span="4" style="text-align: center">
              <el-button type="text" @click="openEditDialog(role)">编辑</el-button>
              <el-button type="text" @click="openDelDialog(role)">删除</el-button>
            </el-col>
          </el-row>
        </div>
      </el-scrollbar>
    </div>
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="30rem">
      <el-form ref="mForm" :model="addRoleInfo" label-width="80px" :rules="addRoleInfoRules">
        <el-form-item label="角色名" prop="Name">
          <el-input v-model="addRoleInfo.Name"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="addRoleInfo.Description"></el-input>
        </el-form-item>
        <el-form-item label="权限" prop="checkedAccesses">
          <el-checkbox-group
            v-model="addRoleInfo.checkedAccesses">
            <el-checkbox v-for="access in accessOptions" :label="access.value" name="checkedAccesses"
                         v-model="access.value">{{access.label}}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible=false">取 消</el-button>
    <el-button type="primary" @click="addRoleToServer('mForm')" :loading="isUploading">添加</el-button>
  </span>
    </el-dialog>
    <el-dialog
      title="编辑角色"
      :visible.sync="editDialogVisible"
      width="30rem">
      <el-form ref="mForm" :model="curRole" label-width="80px" :rules="addRoleInfoRules">
        <el-form-item label="角色名" prop="Name">
          <el-input v-model="curRole.Name"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="curRole.Description"></el-input>
        </el-form-item>
        <el-form-item label="权限" prop="checkedAccesses">
          <el-checkbox-group
            v-model="curRole.checkedAccesses">
            <el-checkbox v-for="access in accessOptions" :label="access.value" name="checkedAccesses"
                         v-model="access.label">{{access.label}}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible=false">取 消</el-button>
    <el-button type="primary" @click="editRoleToServer('mForm')" :loading="isUploading">确定</el-button>
  </span>
    </el-dialog>
    <el-dialog
      title="提示"
      :visible.sync="delDialogVisible"
      width="30%">
      <span>确认删除这个角色吗？</span>
      <span slot="footer" class="dialog-footer">
    <el-button @click="delDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="deleteRoleToServer" :loading="isUploading">删除</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  import math from 'mathjs'
  import JSONBigInt from 'json-bigint'
  import BigNumber from 'json-bigint/node_modules/bignumber.js'

  math.config({
    number: 'BigNumber',
    precision: 64
  })
  export default {
    name: "",
    data() {
      return {
        roles: [],
        addDialogVisible: false,
        editDialogVisible: false,
        delDialogVisible: false,
        curRule: {},
        addRoleInfo: {},
        addRoleInfoRules: {},
        curRole: {},
        accessOptions: [],
        isUploading: false
      }
    },
    created() {
      this.init();
      this.fetchData();
    },
    methods: {
      init() {
        this.isUploading = false;
        this.addDialogVisible = false;
        this.delDialogVisible = false;
        this.editDialogVisible = false;
        this.curRule = {};
        this.addRoleInfo = {
          Name: '',
          Description: '',
          checkedAccesses: []
        }
        this.addRoleInfoRules = {
          Name: [
            {message: '角色名不能为空', trigger: 'blur', required: true, min: 1},
          ],
          checkedAccesses: [
            {type: 'array', required: true, message: '请至少选择一个权限', trigger: 'change'}
          ]
        }
        this.accessOptions = [
          {label: '用户管理', value: 1},
          {label: '角色管理', value: 2},
          {label: '管理员管理', value: 3},
          {label: '资源地址管理', value: 4},
          {label: '直播地址管理', value: 5},
          {label: '应用服务器地址管理', value: 6},
          {label: 'Test权限', value: 61}
        ]
      },
      fetchData() {
        this.axios.get('/ssnwtweb/api/accesssets/list', {transformResponse: [data => data]}).then((res) => {
          let roles = JSONBigInt.parse(res.data);
          console.log(roles);
          let filteredRoles = [];
          roles.forEach((role) => {
            if (role.Access.toString() != math.eval('1<<62').toString()) {
              filteredRoles.push(role);
            }
          });
          this.roles = filteredRoles;
        })
      },
      openEditDialog(role) {
        this.curRole = {
          Id: role.Id,
          Name: role.Name,
          Description: role.Description,
          checkedAccesses: []
        }

        let mAccess = role.Access;

        if (BigNumber.isBigNumber(role.Access)) {
          mAccess = math.bignumber(role.Access.toString());
        }
        this.accessOptions.forEach((accessOption) => {
          let hasAccess = math.bitAnd(mAccess, math.eval('1<<' + accessOption.value));
          if (hasAccess > 0) {
            this.curRole.checkedAccesses.push(accessOption.value);
          }
        });
        this.editDialogVisible = true;
      },
      openDelDialog(role) {
        this.curRole = {Id: role.Id};
        this.delDialogVisible = true;
      },
      addRoleToServer(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.isUploading = true;
            let Access = math.eval('1 <<' + this.addRoleInfo.checkedAccesses[0]);
            if (this.addRoleInfo.checkedAccesses.length > 1) {
              this.addRoleInfo.checkedAccesses.forEach((checkedAccess) => {
                let m = math.eval('1 <<' + checkedAccess);
                Access = math.bitOr(m, Access);
              });
            }
            let AccessSet = {
              Id: 0,
              Name: this.addRoleInfo.Name,
              Description: this.addRoleInfo.Description,
              Access: BigNumber(Access.toString())
            }
            console.log(Access);
            this.axios.post('/ssnwtweb/api/accesssets/updateorcreate', JSONBigInt.stringify(AccessSet)).then((res) => {
              this.isUploading = false;
              this.addDialogVisible = false;
              this.fetchData();
            });
          } else {
            return false;
          }
        });
      },
      editRoleToServer(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.isUploading = true;
            let Access = math.eval('1 <<' + this.curRole.checkedAccesses[0]);
            if (this.curRole.checkedAccesses.length > 1) {
              this.curRole.checkedAccesses.forEach((checkedAccess) => {
                let m = math.eval('1 <<' + checkedAccess);
                Access = math.bitOr(m, Access);
              });
            }
            let AccessSet = {
              Id: this.curRole.Id,
              Name: this.curRole.Name,
              Description: this.curRole.Description,
              Access: BigNumber(Access.toString())
            }
            this.axios.post('/ssnwtweb/api/accesssets/updateorcreate', JSONBigInt.stringify(AccessSet)).then((res) => {
              this.isUploading = false;
              this.editDialogVisible = false;
              this.fetchData();
            });
          } else {
            return false;
          }
        });
      },
      deleteRoleToServer() {
        this.isUploading = true;
        this.axios.post('/ssnwtweb/api/accesssets/delete', this.curRole).then((res) => {
          this.fetchData();
          this.isUploading = false;
          this.delDialogVisible = false;
        });
      }
    },
    watch: {
      addDialogVisible() {
        if (!this.addDialogVisible) {
          this.addRoleInfo = {
            Name: '',
            Description: '',
            checkedAccesses: []
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
