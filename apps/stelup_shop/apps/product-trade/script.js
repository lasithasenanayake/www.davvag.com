WEBDOCK.component().register(function(exports){
    var scope,validator_profile,service_handler,sossrout_handler,cropper1,routeData;
    var newFile_1,newFile_2,newFile_3,newFile_4;
    var bindData = {
        submitErrors : [],submitInfo : [],data:{},profile:{},attributes:{},
        p_image_1:"components/dock/soss-uploader/service/get/products_proposal/i_1",
        p_image_2:"components/dock/soss-uploader/service/get/products_proposal/i_2",
        p_image_3:"components/dock/soss-uploader/service/get/products_proposal/i_3",
        p_image_4:"components/dock/soss-uploader/service/get/products_proposal/i_4",
        p_image:[],
        product:{},product_attributes:{},errorMessage:""
    };
    
    var vueData =  {
        methods:{
            sellersiginup:function(){
                scope.submitErrors = [];
                scope.submitErrors = validator_profile.validate();
                if(!scope.submitErrors){ 
                    $("#form-details-1").toggle();
                    $("#form-details-2").toggle();
                }
            },
            biosiginup:function(){
                $("#form-details-2").toggle();
                $("#form-details-3").toggle();;
            },
            stripesiginup:function(){
                $("#form-details-3").toggle();
                $("#form-details-4").toggle();;
            },
            sellingoplicy:function(){
                $("#form-details-4").toggle();
                $("#form-details-5").toggle();;
            },
            tradingoplicy:function(){
                $("#form-details-5").toggle();
                $("#form-details-6").toggle();;
            },
            crope:function(id){
                cropper1.crope(1,1,function(e){
                    //console.log(e);
                    switch(id){
                        case 1:
                            bindData.p_image_1=e.data;
                            newFile_1=e.fileData;
                            break;
                        case 2:
                            bindData.p_image_2=e.data;
                            newFile_2=e.fileData;
                            break;
                        case 3:
                            bindData.p_image_3=e.data;
                            newFile_3=e.fileData;
                            break;
                        case 4:
                            bindData.p_image_4=e.data;
                            newFile_4=e.fileData;
                            break;
                    }
                    
                });
            },
            submit:submit
           
        },
        data :bindData,
        onReady: function(s){
            scope=s;
            pInstance = exports.getShellComponent("soss-routes");
            routeData = pInstance.getInputData();
            Login(routeData,function(){
                initialize();
            });
            
        }
    }

    function Login(routeData,cb){
        if(localStorage.profile==null){
            
            location.href="#/app/userapp?u="+escape("#/app/stelup_shop/traditem?itemid="+routeData.itemid);
            return;
        }else{
            bindData.profile=JSON.parse(localStorage.profile);
            //bindData.p_image="components/dock/soss-uploader/service/get/profile/"+bindData.data.id.toString();
            cb();
            return;
            
        }
    }

    function initialize(){
        
        
        service_handler = exports.getComponent("app-handler");
        if(!service_handler){
            console.log("Service has not Loaded please check.")
        }
        exports.getAppComponent("davvag-tools","davvag-img-cropper", function(cropper){
            cropper.initialize(300,300);
            cropper1=cropper;
        });
        pInstance = exports.getShellComponent("soss-routes");
        routeData = pInstance.getInputData();
        loadValidator();
        if(routeData.itemid){
            loadInitialData(routeData);
        }
    }

    function loadInitialData(routeData){
        
        var menuhandler  = exports.getShellComponent("soss-data");
            var query=[];
            //var tmpmenu=[];
            if(routeData.itemid!=null){
                //loadProduct(bindData);
                query.push({storename:"products",search:"itemid:"+routeData.itemid});
                query.push({storename:"products_attributes",search:"itemid:"+routeData.itemid});
                //query.push({storename:s"products_image",search:"articalid:"+routeData.productid});
            }
            menuhandler.services.q(query)
                        .then(function(r){
                            console.log(JSON.stringify(r));
                            if(r.success){
                               if(r.result.products!=null){
                                bindData.product = r.result.products[0];
                                bindData.data.address=bindData.profile.address;
                                bindData.data.country=bindData.profile.country;
                                //$("#txtcaption").data("editor").html(bindData.product.caption);
                                $("#form-details-0").toggle();
                                $("#form-details-1").toggle();
                                bindData.data
                                if(r.result.products_attributes.length!=0)
                                    bindData.product_attributes=r.result.products_attributes[0];
                                else
                                    bindData.attributes={};
                                
                                    bindData.p_image_1="components/dock/soss-uploader/service/get/products_proposal/"+bindData.product.itemid.toString()+"_1";
                                    bindData.p_image_2="components/dock/soss-uploader/service/get/products_proposal/"+bindData.product.itemid.toString()+"_2";
                                    bindData.p_image_3="components/dock/soss-uploader/service/get/products_proposal/"+bindData.product.itemid.toString()+"_3";
                                    bindData.p_image_4="components/dock/soss-uploader/service/get/products_proposal/"+bindData.product.itemid.toString()+"_4";
                               }

                            }
                        })
                        .error(function(error){
                            
            });
        

        
    }

    function imageList(){
        bindData.p_image=[];
        if(newFile_1){
            bindData.p_image.push({id:0,name:"1",caption:"",default_img:"Y"});
        }
        if(newFile_2){
            bindData.p_image.push({id:0,name:"2",caption:"",default_img:"N"});
        }

        if(newFile_3){
            bindData.p_image.push({id:0,name:"3",caption:"",default_img:"N"});
        }

        if(newFile_4){
            bindData.p_image.push({id:0,name:"4",caption:"",default_img:"N"});
        }
        return bindData.p_image;
    }
    var uploader;
    function uploadFile(productId, cb){
        var files=[];
        if(newFile_1){
            newFile_1.name="1";
            files.push(newFile_1);
        }
        if(newFile_2){
            newFile_2.name="2";
            files.push(newFile_2);
        }

        if(newFile_3){
            newFile_3.name="3";
            files.push(newFile_3);
        }

        if(newFile_4){
            newFile_4.name="4";
            files.push(newFile_4);
        }
        if (files.length==0)cb();
        else{
            exports.getAppComponent("davvag-tools","davvag-file-uploader", function(_uploader){
                uploader=_uploader;
                uploader.initialize();
                uploader.upload(files, "products_proposal", productId,cb);
            });
        }
    }
    function draftDefaults(){
        bindData.data.Images=imageList();
        bindData.data.catogory="listing";
        bindData.data.currencycode="GBP";
        bindData.data.uom="Units";
        bindData.invType="Inventory";
        bindData.showonstore="N";
        bindData.data.RemoveImages=[];
    }

    function submit(){
        lockForm();
        scope.submitErrors = [];
        scope.submitErrors = validator_profile.validate(); 
        if (!scope.submitErrors){
            lockForm();
            scope.submitErrors = [];
            scope.submitInfo=[];
            bindData.data.Images=imageList();
        
            bindData.data.RemoveImages=[];
            
            bindData.data.profileId=bindData.profile.id;
            bindData.data.name=bindData.profile.name;
            bindData.data.email=bindData.profile.email;
            bindData.data.itemid=bindData.product.itemid;
            bindData.data.item=bindData.product;
            bindData.data.supplier_profileId=bindData.product.storeid;

            
            
            service_handler.services.SaveProductProposal(bindData.data).then(function(result){
                
                console.log(result);
                
                if(result.success){
                    uploadFile(result.result.id,function(){
                        scope.submitInfo.push("Saved Successfully.");
                        
                        location.href="#/app/stelup_shop";
                        
                    });
                    //scope.submitInfo.push("result.result.message");
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
        validator_profile.map ("data.description",true, "Please Write what you have to offer.");
        validator_profile.map ("data.item_condition",true, "Please Write the condition of the item condition you have to offer");
        //validator_profile.map ("data.contactno",true, "Please enter your contact number");
        //validator_profile.map ("data.contactno","numeric", "Phone number should only consist of numbers");
        ///validator_profile.map ("data.contactno","minlength:9", "Phone number should consit of 10 numbers");
        //validator_profile.map ("data.country",true, "Please pick your country");
        //validator_profile.map ("data.country",true, "Please pick your country");

        
        
    }

    exports.vue = vueData;
    exports.onReady = function(element){
        
    }

});
