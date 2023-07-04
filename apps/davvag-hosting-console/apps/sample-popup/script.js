WEBDOCK.component().register(function(exports){
    var scope,validator_profile,service_handler,sossrout_handler;

    var bindData = {
        submitErrors : [],submitInfo : [],data:{}
    };

    var vueData =  {
        methods:{
            submit:submit,
           open:function(){
                let shellpopup =exports.getShellComponent("app_popup");
                shellpopup.open("davvag-sample-app-1","sample-input-form",{},function(data){
                    shellpopup.close();
                },"popup name");

           }
        },
        data :bindData,
        onReady: function(s){
            scope=s;
            initialize();
        }
    }

    function initialize(){
        service_handler = exports.getComponent("app-handler");
        if(!service_handler){
            console.log("Service has not Loaded please check.")
        }
        loadValidator();
    }

    function submit(){
        lockForm();
        scope.submitErrors = [];
        scope.submitErrors = validator_profile.validate(); 
        if (!scope.submitErrors){
            lockForm();
            scope.submitErrors = [];
            scope.submitInfo=[];
            service_handler.services.Save(bindData.data).then(function(result){
                
                console.log(result);
                
                if(result.success){
                    scope.submitInfo.push("result.result.message");
                }else{
                    scope.submitErrors.push("Error");
                }
                unlockForm();
            }).error(function(result){
                scope.submitErrors = [];
                bindData.submitErrors.push("Error");
                unlockForm();
            });

        }
    }

    function navigateBack(){

    }

    

    function lockForm(){
        $("#form-details :input").prop("disabled", true);
        $("#form-details :button").prop("disabled", true);
    }

    function unlockForm(){
        $("#form-details :input").prop("disabled", false);
        $("#form-details :button").prop("disabled", false);
    }

    function loadValidator(){
        var validatorInstance = exports.getShellComponent ("soss-validator");

        validator_profile = validatorInstance.newValidator (scope);
        validator_profile.map ("data.email",true, "Please enter your full name");
        validator_profile.map ("data.password",true, "Please enter your contact number");
        validator_profile.map ("data.contactno","numeric", "Phone number should only consist of numbers");
        validator_profile.map ("data.contactno","minlength:9", "Phone number should consit of 10 numbers");

        
        
    }

    exports.vue = vueData;
    exports.onReady = function(element){
        
    }

});
