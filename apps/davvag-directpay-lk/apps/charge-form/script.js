WEBDOCK.component().register(function(exports){
    var scope,validator_profile,service_handler,routeData;

    var bindData = {
        submitErrors : [],submitInfo : [],data:{},stripe_pulich_key:"",order:{},reciept:{},mainkey:null,appkey:null
    };

    var vueData =  {
        methods:{
            
           
        },
        data :bindData,
        onReady: function(s){
            scope=s;
            var direct = document.getElementById("DirectPayCardPayment");
        
            if(direct){
                location.reload();
            }else{
                initialize();
            }
            
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
                   bindData.data=result.result;
                   //if(bindData.order.stripeKey!=null){}
                   bindData.appkey=bindData.data.appkey?bindData.data.appkey:null;
                   bindData.mainkey=bindData.data.mainkey?bindData.data.mainkey:null;;
                   if(bindData.appkey==null){
                        if(routeData.url){
                            window.location=decodeURI(routeData.url);
                        }
                   }
                   if(bindData.data.amount>0){
                    InitDirectpay();
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
        if(routeData.repid){
            service_handler.services.ExtPaymentRequest({id:routeData.repid}).then(function(result){
                    
                console.log(result);
                
                if(result.success && result.result!=null){
                   bindData.data=result.result;
                   //if(bindData.order.stripeKey!=null){}
                   
                   bindData.appkey=bindData.data.appkey?bindData.data.appkey:null;
                   bindData.mainkey=bindData.data.mainkey?bindData.data.mainkey:null;;
                   if(bindData.appkey==null){
                        if(routeData.url){
                            window.location=decodeURI(routeData.url);
                        }
                   }
                   if(bindData.data.amount>0){
                        InitDirectpay();
                   }else{
                        bindData.submitErrors.push("Order is already paid.");
                        if(routeData.url){
                            window.location=decodeURI(routeData.url);
                        }
                   }
                   
                }else{
                    bindData.data=null;
                    bindData.submitErrors.push("No payment to pay.");
                }
                
            }).error(function(result){
                bindData.data=null;
                bindData.submitErrors.push("Critical Error please refresh");
                lockForm();
            });
            
        }
        
    }

    
    function InitDirectpay(){
        var direct = document.getElementById("DirectPayCardPayment");
        
        if(direct){
            LoadCard();
        }else{
            const jqueryScript = document.createElement('script')
            jqueryScript.src = bindData.data.apiuri;
            jqueryScript.setAttribute("id", "DirectPayCardPayment");
            jqueryScript.onload = () => { 
                LoadCard();
            }
            document.head.append(jqueryScript);
        }
        
    }

    function LoadCard(){
        $("#card_container").empty();
            DirectPayCardPayment.init({
                container: 'card_container', //<div id="card_container"></div>
                merchantId: bindData.mainkey, //your merchant_id
                amount: bindData.data.amount,
                refCode: bindData.data.refId, //unique referance code form merchant
                currency: bindData.data.currencycode,
                type: 'ONE_TIME_PAYMENT',
                customerEmail: bindData.data.email,
                customerMobile: bindData.data.contactno,
                description: bindData.data.remark?bindData.data.remark:"Payment ",  //product or service description
                debug: false,
                responseCallback: responseCallback,
                errorCallback: errorCallback,
                logo: 'https://'+document.location.hostname+"/"+JSON.parse(sessionStorage.blogheader).icon,
                apiKey: bindData.appkey
            });
    }
    //response callback.
    function responseCallback(result1) {
        console.log("successCallback-Client", result1);
        bindData.data.ExtResults=result1;
        bindData.submitInfo=[];
        service_handler.services.Payment(bindData.data).then(function(result){
            console.log(result);
            
            if(result.success && result.result!=null){
                bindData.submitInfo.push("Payement was Successful.")
                window.location="#/app/userapp/receipt?tid="+result.result.receiptNo;
            
                
               
            }else{
                ///bindData.data=null;
                bindData.submitErrors.push("Payment Errors.");

            }
            
        }).error(function(result){
            bindData.submitErrors.push("Payment was not made Please try again.");
        });
        
    }

    //error callback
    function errorCallback(result) {
            console.log("successCallback-Client", result);
            alert(JSON.stringify(result));
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
