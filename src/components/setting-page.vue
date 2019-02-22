<template>
  <div class="container">
    <div style="font-size: 1.2rem;color: gray">用户名:{{' '+username}}</div>
    <el-button type="primary" style="margin-top: 2rem;font-size: 1rem" @click="dialogVisible=true">修改密码</el-button>
    <el-dialog
      title="修改密码"
      :visible.sync="dialogVisible"
      width="30rem">
      <el-form ref="mForm" :model="pwInfo" label-width="80px" :rules="pwRules">
        <el-form-item label="原密码" prop="oldPw">
          <el-input v-model="pwInfo.oldPw" type="password"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPw">
          <el-input type="password" v-model="pwInfo.newPw"></el-input>
        </el-form-item>
        <el-form-item label="再次输入" prop="newPw2">
          <el-input type="password" v-model="pwInfo.newPw2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible=false">取 消</el-button>
    <el-button type="primary" @click="submitForm('mForm')" :loading="isValidating">确定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "",
    data() {
      return {
        username: '',
        dialogVisible: false,
        pwInfo: {},
        pwRules:{},
        isValidating: false,
        isOldPwOk:false
      }
    },
    created() {
      this.init();
    },
    methods: {
      init() {
        let userInfo = localStorage.getItem('userInfo');
        this.username = JSON.parse(userInfo).Name;
        this.pwInfo = {
          oldPw: '',
          newPw: '',
          newPw2: ''
        }
        this.pwRules = {
          oldPw: [
            {message: '请输入长度大于等于6的密码', trigger: 'blur',min:6},
            { validator: this.validatePassFromServer}
          ],
          newPw: [
            { validator: this.validatePass, trigger: 'blur' }
          ],
          newPw2: [
            { validator: this.validatePass2, trigger: 'blur' }
          ]
        }
      },
      fetchData() {

      },
      validatePass(rule, value, callback){
        if (value.length<6) {
          callback(new Error('请输入长度大于等于6的密码'));
        } else if (value == this.pwInfo.oldPw) {
          callback(new Error('新密码请与原密码保持不同!'));
        } else {
          callback();
        }
      },
      validatePass2(rule, value, callback){
        if (value.length<6) {
          callback(new Error('请输入长度大于等于6的密码'));
        } else if (value !== this.pwInfo.newPw) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      },
      validatePassFromServer(rule, value, callback){
        if(this.isValidating&&!this.isOldPwOk){
          callback(new Error('原始密码不正确'));
        }else {
          callback();
        }
      },
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            let formData=new FormData();
            formData.set('oldpassword',this.pwInfo.oldPw);
            formData.set('newpassword',this.pwInfo.newPw);
            let config = {
              headers: {'Content-Type': 'multipart/form-data'}
            };
            this.isValidating = true;
            this.axios.post('/ssnwtweb/api/admins/changepassword',formData,config).then((res)=>{
              if(res.data!='OK'){
                this.isOldPwOk=false;
                this.$refs[formName].validateField('oldPw');
              }else {
                this.$message({
                  message: '密码修改成功，请重新登陆',
                  type: 'success'
                });
                this.dialogVisible=false;
                localStorage.removeItem('userInfo');
                this.$router.push('/');
              }
              this.isValidating=false;
            });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
    },
    watch:{
      dialogVisible(){
        if(this.dialogVisible){
          this.pwInfo = {
            oldPw: '',
            newPw: '',
            newPw2: ''
          }
          this.$refs.mForm.resetFields();
        }
      }
    }
  }
</script>

<style scoped>
  .container {
    padding: 2% 5%;
  }
</style>
