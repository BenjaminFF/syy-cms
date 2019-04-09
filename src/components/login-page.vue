<template>
  <div class="login-page">
    <vue-particles style="background-color:#1f62b0;"
                   color="#FFFFFF"
                   :particleOpacity="0.7"
                   :particlesNumber="50"
                   shapeType="circle"
                   :particleSize="4"
                   linesColor="#1f62b0"
                   :linesWidth="0"
                   :lineLinked="false"
                   :lineOpacity="0.4"
                   :linesDistance="150"
                   :moveSpeed="2"
                   :hoverEffect="true"
                   hoverMode="grab"
                   :clickEffect="true"
                   clickMode="push"
    >
    </vue-particles>
    <el-form ref="mForm" :model="formData" :rules="formRules" class="formStyle">
      <div style="width: 100%;text-align: center;margin-bottom: 2rem;font-size: 2rem;color: #1f62b0">
        SKYWORTH
      </div>
      <el-form-item prop="name">
        <el-input v-model="formData.name" placeholder="用户名"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="password" v-model="formData.password" placeholder="密码"></el-input>
      </el-form-item>
      <el-form-item prop="captcha">
        <el-input v-model="formData.captcha" placeholder="验证码"></el-input>
        <img :src="'http://192.168.1.108:8081/'+captchaData.Url" @click="flushCaptcha"
             style="width: 5rem;height: 100%;position: absolute;right: 0;top:0;cursor: pointer">
      </el-form-item>
      <el-form-item>
        <el-button style="width:100%" @click="submitForm('mForm')" :loading="isValidating">登陆</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import particlesJS from 'particles.js'

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
    mounted() {

    },
    methods: {
      init() {
        this.formRules = {
          name: [
            {required: true, message: '用户名不能为空', trigger: 'blur', min: 1},
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
        let formData = new FormData();
        formData.set('name', this.formData.name);
        formData.set('password', this.formData.password);
        formData.set('validcode', this.formData.captcha);
        formData.set('captchaid', this.captchaData.Id);
        let config = {
          headers: {'Content-Type': 'multipart/form-data'}
        };
        this.axios.post('/ssnwtweb/admins/login', formData, config).then((res) => {
          this.isValidating = false;
          console.log(res.data);
          if (typeof res.data == 'object') {
            let userInfo = res.data;
            userInfo.loginTime = Date.now();
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            this.$router.push('/alluser-manage');
          } else {
            if (res.data == -1) {
              this.$message({
                message: '验证码错误',
                type: 'warning'
              });
              localStorage.removeItem('userInfo');
              this.$router.push('/');
            } else {
              this.$message({
                message: '密码错误',
                type: 'warning'
              });
            }
            this.flushCaptcha();
          }
        });
      },
      flushCaptcha() {
        this.axios.get('/ssnwtweb/admins/getcaptcha').then((res) => {
          this.captchaData = res.data;
        });
      }
    }
  }
</script>

<style scoped>
  #particles-js {
    position: fixed;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 50% 50%;
  }

  .login-page {
    width: 100%;
    height: 100%;
    position: fixed;
    left: 0;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .formStyle {
    position: absolute;
    background-color: white;
    padding: 2rem 3rem;
    border-radius: 10px;
    width: 15rem;
    box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.1);
  }
</style>
