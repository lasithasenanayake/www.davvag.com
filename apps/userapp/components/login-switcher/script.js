WEBDOCK.component().register(function(exports){
    var scope;

    var bindData = {
        profile: {},
        submitErrors : [],
        isLoggedIn: false,
        loginData :  {},
        loginForm : {
            email :"",
            password :""
        },
        signupForm : {},
        canShowSignUp: false,
        partialToShow: 0,
        isBusy: false,
        isCompleted: false
    };

    function Login(routeData){
        /*
        if(localStorage.loginData!=null){
            if(routeData.u){
                //scope.isBusy=false;
                location.href=unescape(routeData.u);
            }else{
                location.href="#/app/userapp/profile";
                //pInstance.appNavigate("/profile");

            }
        }else{*/
            var handler = exports.getComponent("login-handler");
            handler.services.LoginState().then(function(result){
                if (result.result){
                    //setCookie("authData", JSON.stringify(result),1);
                    // var passhash = CryptoJS.MD5(result.email);
                    // self.profileimage = "https://www.gravatar.com/avatar/" + passhash+"?s=200&r=pg&d=mm";
                   // bindData.loginData = result.;
                    localStorage.loginData = JSON.stringify(result.result);
                    localStorage.profile = JSON.stringify(result.result.profile);
                    if(routeData.u){
                        //scope.isBusy=false;
                        location.href=unescape(routeData.u);
                    }else{
                        
                        location.href="#/app/userapp/profile";
        
                    }
                }else{
                    if(routeData.u)
                        sessionStorage.redirecturl=unescape(routeData.u);

                    location.href="#/app/userapp/login";
                }
            }).error(function(result){
                if(routeData.u)
                        sessionStorage.redirecturl=unescape(routeData.u);
                localStorage.clear();
                location.href="#/app/userapp/login";
                //pInstance.appNavigate("/login");
            });
       // }
    }

    var vueData =  {
        methods:{
            
        },
        data :bindData,
        onReady: function(s){
            scope = s;
            //scope.isBusy=true;
            pInstance = exports.getShellComponent("soss-routes");
            routeData = pInstance.getInputData();
            bindData.profile=localStorage.profile ? JSON.parse(localStorage.profile) : {address:{gpspoint:"", city:""},address2:{},address3:{}};
            bindData.isLoggedIn= localStorage.loginData ? true: false;
            bindData.loginData = localStorage.loginData ? JSON.parse(localStorage.loginData) : {};
            Login(routeData);
            /*
            if(bindData.isLoggedIn){
                if(routeData.u){
                    scope.isBusy=false;
                    location.href=unescape(routeData.u);
                }else{
                    
                    pInstance.appNavigate("/profile");

                }
            }else{
                if(routeData.u){
                    sessionStorage.redirecturl=unescape(routeData.u);
                    pInstance.appNavigate("/login");
                }else{
                    pInstance.appNavigate("/login");
                }
            }*/
        }
    } 

    exports.vue = vueData;
    exports.onReady = function(element){
    }


});
