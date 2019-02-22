<template>
  <div class="login-page">
    <el-form ref="mForm" :model="formData" label-width="80px" :rules="formRules">
      <el-form-item label="用户名" prop="name">
        <el-input v-model="formData.name"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="formData.password"></el-input>
      </el-form-item>
      <el-form-item label="验证码" prop="captcha">
        <el-input v-model="formData.captcha"></el-input>
        <img :src="'http://192.168.1.108:8081'+captchaData.Url"  @click="flushCaptcha"
             style="width: 5rem;height: 100%;position: absolute;right: 0;top:0;cursor: pointer"></img>
      </el-form-item>
      <el-form-item>
        <el-button style="width:100%" @click="submitForm('mForm')" :loading="isValidating">登陆</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    name: "login-page",
    data() {
      return {
        formRules: [],
        formData: {},
        captchaData: "",
        isValidating: false,
      }
    },
    created() {
      this.init();
    },
    methods: {
      init() {
        this.formRules = {
          name: [
            {required: true, message: '密码不能为空', trigger: 'blur'},
            {min: 6, max: 32, message: '密码长度在 6 到 32 个字符', trigger: 'blur'},
          ],
          password: [
            {required: true, message: '密码不能为空', trigger: 'blur'},
            {min: 6, max: 32, message: '密码长度在 6 到 32 个字符', trigger: 'blur'},
          ],
          captcha: [
            {required: true, message: '请输入验证码', trigger: 'blur'},
            {min: 6, max: 6, message: '请输入正确的验证码', trigger: 'blur'}
          ]
        }
        this.formData = {
          name: "",
          password: "",
          captcha: ""
        }
        this.fetchData();
      },
      fetchData() {
        this.flushCaptcha();
      },
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.isValidating = true;
            this.validatePass();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      validatePass() {
        let formData=new FormData();
        formData.set('name',this.formData.name);
        formData.set('password',this.formData.password);
        formData.set('validcode',this.formData.captcha);
        formData.set('captchaid',this.captchaData.Id);
        let config = {
          headers: {'Content-Type': 'multipart/form-data'}
        };
        this.axios.post('/ssnwtweb/api/admins/login',  formData,config).then((res) => {
          this.isValidating = false;
          if(typeof res.data=='object'){
            let userInfo=res.data;
            userInfo.loginTime=Date.now();
            console.log(userInfo);
            localStorage.setItem('userInfo',JSON.stringify(userInfo));
            this.$router.push('/alluser-manage');
          }else {
            if(res.data==-1){
              this.$message({
                message: '验证码错误',
                type: 'warning'
              });
              localStorage.removeItem('userInfo');
              this.$router.push('/');
            }else {
              this.$message({
                message: '密码错误',
                type: 'warning'
              });
            }
            this.flushCaptcha();
          }
        });
      },
      flushCaptcha(){
        this.axios.get('/ssnwtweb/api/admins/getcaptcha').then((res)=>{
          this.captchaData=res.data;
        });
      }
    }
  }
</script>

<style scoped>
  .login-page {
    width: 100%;
    height: 100%;
    position: fixed;
    left: 0;
    top: 0;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
</style>
