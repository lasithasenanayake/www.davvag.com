WEBDOCK.component().register(function(exports){
    var scope,validator_profile,service_handler,routeData;

    var bindData = {
        submitErrors : [],submitInfo : [],data:{},stripe_pulich_key:"",order:{},reciept:{}
    };

    var vueData =  {
        methods:{
            submit:stripePay
           
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
        pInstance = exports.getShellComponent("soss-routes");
        routeData = pInstance.getInputData();
        lockForm();
        if(routeData.orderid){
            service_handler.services.Order({id:routeData.orderid}).then(function(result){
                    
                console.log(result);
                
                if(result.success){
                   bindData.order=result.result;
                   //if(bindData.order.stripeKey!=null){}
                   bindData.stripe_pulich_key=bindData.order.stripeKey?bindData.order.stripeKey:null;
                   bindData.data.email=bindData.order.email;
                   if(bindData.stripe_pulich_key==null){
                        if(routeData.url){
                            window.location=decodeURI(routeData.url);
                        }
                   }
                   if(bindData.order.balance>0){
                        unlockForm();
                   }else{
                        bindData.submitErrors.push("Order is already paid.");
                        if(routeData.url){
                            window.location=decodeURI(routeData.url);
                        }
                   }
                   
                }else{
                    bindData.order=null;
                    bindData.submitErrors.push("Order is not found to pay.");
                }
                
            }).error(function(result){
                bindData.order=null;
                bindData.submitErrors.push("Critical Error please refresh");
                lockForm();
            });
            loadValidator();
        }
        
    }

    function stripePay(){
        lockForm();
        Stripe.setPublishableKey(bindData.stripe_pulich_key);
        Stripe.createToken({
            number: bindData.data.cardnumber,
            cvc: bindData.data.cvc,
            exp_month: bindData.data.month,
            exp_year: bindData.data.year
        }, function(status,response){
            if (response.error) {
                
                scope.submitErrors.push(response.error.message);
                unlockForm();
            } else {
                //get token id
                var token = response['id'];
                console.log(JSON.stringify(response));
                bindData.data.token=token;
                service_handler.services.ChargeAmountFromCard({token:response['id'],id:bindData.order.invoiceNo}).then(function(result){
                
                    console.log(result);
                    
                    if(result.success){
                        if(routeData.url){
                            sessionStorage.tmpRept=JSON.stringify(result.result);
                            window.location=decodeURI(routeData.url);
                        }
                        //localStorage.tmpOrder
                        bindData.reciept=result.result;
                        scope.submitInfo.push("Purchase Complete");
                        unlockForm();
                    }else{
                        scope.submitErrors.push("Error");
                    }
                    
                }).error(function(result){
                    scope.submitErrors = [];
                    bindData.submitErrors.push("Error");
                    unlockForm();
                });
                
            }
        });
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
        validator_profile.map ("data.cardnumber",true, "Please enter your card number");
        validator_profile.map ("data.name",true, "Please enter name appers on your card");
        validator_profile.map ("data.cvc",true, "cvc number on the back of the card");
        validator_profile.map ("data.year",true, "Please Select your Expiry Year");
        validator_profile.map ("data.month",true, "Please Select your Expiry Month");

        
        
    }

    exports.vue = vueData;
    exports.onReady = function(element){
        
    }

});
