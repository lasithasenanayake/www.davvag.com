WEBDOCK.component().register(function(exports){
    var scope;

    var bindData = {
        profile: localStorage.profile ? JSON.parse(localStorage.profile) : {address:{gpspoint:"", city:""},address2:{},address3:{}},
        submitErrors : [],submitInfo : [],
        isLoggedIn: localStorage.loginData ? true: false,
        loginData : localStorage.loginData ? JSON.parse(localStorage.loginData) : {},
        header:sessionStorage.blogheader?JSON.parse(sessionStorage.blogheader):null,
        loginForm : {
            email :"",
            password :""
        },
        signupForm : {},
        canShowSignUp: false,
        partialToShow: 0,
        isBusy: false,
        isCompleted: false,
        fbEnabled:false
    };

    var vueData =  {
        methods:{
            navigate: function(id){
                //handler = exports.getShellComponent("soss-routes");
                var handler = exports.getComponent("login-handler");
                //location.href="http://localhost/sossgrid.js/components/userapp/login-handler/service/FacebookLogin";
                handler.services.FacebookLogin().then(function(result){
                if(result.success){
                    location.href=result.result;
                }else{
                    apprhandler = exports.getShellComponent("soss-routes");
                    apprhandler.appNavigate("../error");
                }
                    
                }).error(function(result){
                    apprhandler = exports.getShellComponent("soss-routes");
                    apprhandler.appNavigate("../error");
                });
            },
            toggleSignUp:function(){
                bindData.submitErrors=[];
                $('#logreg-forms .form-signin').toggle(); // display:block or none
                $('#logreg-forms .form-signup').toggle(); // display:block or none
            },
            toggleResetPswd:function(){
                bindData.submitErrors=[];
                $('#logreg-forms .form-signin').toggle() // display:block or none
                $('#logreg-forms .form-reset').toggle() // display:block or none
            },
            login:function(){
                loginLogic({email: bindData.loginForm.email,password:bindData.loginForm.password}, true);
            },
            resetpassword:function(email){
                bindData.submitErrors=[];
                $("#form-reset :input").prop("disabled", true);

                var handler = exports.getComponent("login-handler");
                bindData.submitErrors=[];
                bindData.submitInfo=[];
                scope.isBusy = true;
                handler.services.ResetToken({email: email}).then(function(result){
                    $("#form-reset :input").prop("disabled", false);
                    console.log(result);
                    if(result.result.success){
                        bindData.submitInfo.push(result.result.message);
                    }else{
                        bindData.submitErrors.push(result.result.message);
                    }
                }).error(function(result){
                    $("#form-reset :input").prop("disabled", false);

                    bindData.submitErrors.push(result.result.message);
                    scope.isBusy = false;
                });
            },
            saveUser:saveUser
        },
        data :bindData,
        onReady: function(s){
            scope = s;
            //scope.isBusy=true;
            pInstance = exports.getShellComponent("soss-routes");
            //routeData = pInstance.getInputData();
            //handler = exports.getShellComponent("soss-routes");
            //handler.appNavigate(id ? "/uom?uomid=" + id : "/uom");
            var handler = exports.getComponent("login-handler");
            handler.services.LoginState().then(function(result){
                if (result.result){
                    localStorage.loginData = JSON.stringify(result.result);
                    localStorage.profile = JSON.stringify(result.result.profile);
                    if(sessionStorage.redirecturl){
                        location.href=sessionStorage.redirecturl;
                    }else{
                        location.href="#/app/userapp/profile";
                    }
                }
            }).error(function(result){
                localStorage.clear();
                sessionStorage.clear();
                //pInstance.appNavigate("/login");
            });
        }
    } 

    exports.vue = vueData;
    exports.onReady = function(element){
    }

    function saveUser (){
        var self = this;
        bindData.submitErrors=[];
        bindData.submitInfo=[];
       if(bindData.signupForm.password!=bindData.signupForm.confirmpassword){
            bindData.submitErrors.push("Password Mismatch");
            return 0;
        }
            var handler = exports.getComponent("login-handler");
            scope.isBusy = true;
            $("#form-signup :input").prop("disabled", true);

            handler.services.registerUser(bindData.signupForm).then(function(result){
                scope.isBusy = false;
                $("#form-signup :input").prop("disabled", false);

                if (result.success)
                {
                    if(result.result.error!=null){
                        bindData.submitErrors.push(result.result.message);
                    }else{
                        handler = exports.getShellComponent("soss-routes");
                        handler.appNavigate("..");
                    }
                    
                }else {
                    bindData.submitErrors.push(result.result);
                    //console.log(JSON.stringify(result));   
                    //console.log('email and password is incorrect.', 'Security!');
                }
    
            }).error (function(result){
                $("#form-signup :input").prop("disabled", false);

                bindData.submitErrors.push(result.result);
                //scope.isBusy = false;
            });;
        //}
    };

    function loginLogic (loginData, validate, cb){
        var self = this;
        

        //if (!scope.submitErrors){
            var handler = exports.getComponent("login-handler");
            scope.isBusy = true;
            $("#form-signin :input").prop("disabled", true);
            //$("btn-login").disabled = true;
            handler.services.login({email: loginData.email,password:loginData.password,domain:window.location.hostname}).then(function(result){
                scope.isBusy = false;
                if (result.result)
                    result = result.result;
                    

                    if (result.token){
                        setCookie("authData", JSON.stringify(result),1);
                        bindData.loginData = result;
                        localStorage.loginData = JSON.stringify(result);
                        bindData.isLoggedIn = true;
                        $("#form-signin :input").prop("disabled", false);
                        if (result.profile){
                            scope.profile = result.profile;
                            localStorage.setItem("profile",JSON.stringify(bindData.profile));
                        }
                    
                    
                        if(cb)
                            cb();
                        else
                        {
                            if(sessionStorage.redirecturl){
                                scope.isBusy=false;
                                r=sessionStorage.redirecturl;
                                sessionStorage.removeItem("redirecturl");
                                location.href="?q="+encodeURI(r);
                            }else{
                                if(sessionStorage.blogheader){
                                    location.href="?q="+encodeURI(JSON.parse(sessionStorage.blogheader).buttonuri);
                                }else{
                                    location.href="?q="+encodeURI("/#/app/userapp/profile");
                                }
                            }
                        }
                     
                }else {    
                    $("#form-signin :input").prop("disabled", false);
                    bindData.submitErrors=[];
                    bindData.submitErrors.push('email and password is incorrect.');
                }
    
            }).error (function(result){
                $("#form-signin :input").prop("disabled", false);

                bindData.submitErrors=[];
                bindData.submitErrors.push('email and password is incorrect.');
                console.log(result);
                scope.isBusy = false;
            });;
        //}
    };

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
});
