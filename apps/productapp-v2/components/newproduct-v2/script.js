WEBDOCK.component().register(function(exports){
    var pInstance;
    var routeData;
    var validatorInstance;
    var handler,attribute,cropper1;
    var newfiles;
    var validatorPage1,validatorPrice,validatorcat;

    function loadValidator(){
        bindData.product.caption=$("#txtcaption").data("editor").html(); 
        validatorPage1 = validatorInstance.newValidator (bindData);
        validatorPage1.map ("product.name",true, "You should enter a name.");
        validatorPage1.map ("product.showonstore",true, "Please Select Show On Store Yes or No.");
        validatorPage1.map ("product.keywords",true, "Please input some keywords so people can search your products.");
        validatorPrice = validatorInstance.newValidator (bindData);
        validatorPrice.map ("product.price",true, "You should enter a price.");
        validatorPrice.map ("product.price","number", "Price should be a number.");
        validatorPrice.map ("product.cost",true, "You should enter a cost.");
        validatorPrice.map ("product.cost","number", "Cost should be a number.");
        validatorcat = validatorInstance.newValidator (bindData);
        validatorcat.map ("selectedCat.name",true, "You should select a product category.");
        validatorcat.map ("product.sellstype",true, "Please select a selling type.");
        validatorcat.map ("product.uom",true, "Please Select Unit of Measure.");
        validatorcat.map ("product.invType",true, "Please Select Inventory keeping Type .");
    }

    var bindData = {
        product:{uom:"",invType:"",currencycode:"",catogory:"",attributes:{"temp":"aaaa"}},
        image:'',
        files:null,
        p_image:[],
        categories:[],
        uoms: [],
        submitErrors: undefined,
        p_removed:[],
        imageSize:{width:450,hieght:500},
        selectedCat:{}
    };

    var vueData = {
        onReady: function(s){
            initializeComponent();
        },
        data:bindData,
        methods: {
            gotoCatNext:function(){
                bindData.submitErrors = validatorPage1.validate(); 
                if (bindData.submitErrors)
                    return;
                
                $("#settings-users").toggleClass('active');
                $("#Product-cat").toggleClass('active');

            },
            gotoPricing:function(){
                bindData.submitErrors = validatorcat.validate(); 
                if (bindData.submitErrors)
                    return;

                $("#Product-cat").toggleClass('active');
                $("#Product-pricing").toggleClass('active');
            },
            gotoInventory:function(){
                bindData.submitErrors = validatorPrice.validate(); 
                if (bindData.submitErrors)
                    return;

                $("#Product-pricing").toggleClass('active');
                if(bindData.product.invType=="Inventory"){
                    $("#Product-Inventory").toggleClass('active');
                    return;
                }else  if($("#sellstype").text().length>3){
                    console.log($("#sellstype").html());
                    $("#settings-sellstype").toggleClass('active');
                    return;
                }else if ($("#AttributeText").text().length>3){
                    console.log($("#AttributeText").html());
                    $("#settings-attributes").toggleClass('active');
                    return;
                }else{
                    $("#settings-logo-title").toggleClass('active');
                }

            },
            gotoSellstype:function() {
                if(bindData.product.invType=="Inventory")
                    $("#Product-Inventory").toggleClass('active');
                else
                    $("#Product-pricing").toggleClass('active');

                console.log($("#sellstype").html());
                if ($("#AttributeText").text().length>3){
                    console.log($("#AttributeText").html());
                    $("#settings-attributes").toggleClass('active');
                    return;
                }else{
                    $("#settings-logo-title").toggleClass('active');
                }
                
            },
            gotoAtrributes:function() {
                if($("#sellstype").text().length>3){
                    $("#settings-sellstype").toggleClass('active');
                }else{
                    $("#Product-Inventory").toggleClass('active');
                }
                if ($("#AttributeText").text().length>3){
                    $("#settings-attributes").toggleClass('active');
                    return;
                }else{
                    $("#settings-logo-title").toggleClass('active');
                }
            },
            submit:submit,
            clear:clearProfile,
            searchItems:searchItems,
            createImage:createImage ,
            removeImage: removeImage,
            changeType:changType,
            crop:function(){
                cropper1.crope(bindData.imageSize.width,bindData.imageSize.hieght,function(e){
                    newfiles=newfiles?newfiles:[];
                    bindData.p_image.push({id:0,name:e.fileData.name,scr:e.data,file:e.fileData});
                    newfiles.push(e.fileData);
                });
            },
            onFileChange: function(e) {
                var files = e.target.files || e.dataTransfer.files;
                if (!files.length)
                    return;
                this.createImage(files[0]);
            },
            onFileMultiChange: function(e) {
                var files = e.target.files || e.dataTransfer.files;
                if (!files.length)
                    return;
                createImageMulti(files);
            },
            navigateBack: function(){
                handler1 = exports.getShellComponent("soss-routes");
                handler1.appNavigate("..");
            }
        }
    }
    exports.vue = vueData;


    function changType(sellstype){
        console.log(sellstype);
        document.getElementById("sellstype").innerHTML = "";
        attribute.renderForm("attr_"+sellstype,"sellstype",{itemid:bindData.product.itemid},function(){
            //initiate();
            switch(sellstype){
                case "":
                    createTab();
                    break;
            }
        });
        
    }

    function createTab(){

    }

    exports.onReady = function(element){
    }
    
    function initializeComponent(){
        pInstance = exports.getShellComponent("soss-routes");
        routeData = pInstance.getInputData();
        validatorInstance = exports.getShellComponent("soss-validator");
        producthandler = exports.getComponent("product");
        uploaderInstance = exports.getShellComponent("soss-uploader");
        attribute=exports.getShellComponent("attribute_shell");
        editor=$("#txtcaption").Editor();
        loadValidator();
        
        uploaderInstance = exports.getShellComponent("soss-uploader");
        exports.getAppComponent("davvag-tools","davvag-img-cropper", function(cropper){
            cropper.initialize(300,300);
            cropper1=cropper;
            //$('#carousel-uploader').modal('show');
        });
        

        loadInitialData();
        console.log(routeData);
        
    }

    
    
    var imagecount=0;
    var completed=0;    
    function uploadFile(productId, cb){
        if(!newfiles){
            cb();
            return;
        }
        if(newfiles.length>0){
            exports.getAppComponent("davvag-tools","davvag-file-uploader", function(_uploader){
                uploader=_uploader;
                uploader.initialize();
                uploader.upload(newfiles, "products", productId,function(r){
                    $.notify("product Image Has been uploaded", "info");
                    cb();
                    newfiles=[];
                });
                //bindData.product=r.result;
            });
        }else{
            cb();
        }
            
        
    }

    function removeImage(e) {
        bindData.image = '';
    }

    function removeImage(e) {
        //const index = array.indexOf(e);
        if (e > -1) {
            if(bindData.p_image[e].id!=0){
                bindData.p_removed.push({id:bindData.p_image[e].id,name:bindData.p_image[e].name,
                    caption:bindData.p_image[e].caption,default_img:bindData.p_image[e].default_img});
            }
            bindData.p_image.splice(e, 1);
            newfiles.splice(e,1);
        }

    }

    function createImage(file) {
        newFile = file;
        var image = new Image();
        var reader = new FileReader();

        reader.onload = function (e) {
            bindData.image = e.target.result;
        };

        reader.readAsDataURL(file);
    }

    function createImageMulti(files) {
        //console.log(JSON.stringify(files));
        //if(!newfiles){
        newfiles=newfiles?newfiles:[];
        //}
        for (var i = 0; i < files.length; i++) {
            newfiles.push(files[i]);
            getImage(i,files[i]);
            //console.log();
        }
        

        console.log(JSON.stringify(bindData.p_image));
    }

    function getImage(index,file){
        var reader = new FileReader();
            reader.onload = function (e) {
                //console.log(e);
                //console.log(newfiles);
                newfiles[index].scr=e.target.result;
                
                bindData.p_image.push({id:0,name:newfiles[index].name,scr:e.target.result,file:file});
                console.log(newfiles);
            };
        reader.readAsDataURL(file);
    }

    function clearProfile(){
        bindData.item={};
        showSearch=false;
    }

    function loadInitialData(){
        
        var menuhandler  = exports.getShellComponent("soss-data");
            var query=[{storename:"productcat",search:""},
            {storename:"uom",search:""}];
            //var tmpmenu=[];
            if(routeData.productid!=null){
                //loadProduct(bindData);
                query.push({storename:"products",search:"itemid:"+routeData.productid});
                query.push({storename:"products_attributes",search:"itemid:"+routeData.productid});
                query.push({storename:"products_image",search:"articalid:"+routeData.productid});
            }
            menuhandler.services.q(query)
                        .then(function(r){
                            console.log(JSON.stringify(r));
                            if(r.success){
                                for (var i=0;i<r.result.productcat.length;i++){
                                    bindData.categories.push({id:r.result.productcat[i].id,name:r.result.productcat[i].name});
                                }
                                for (var i=0;i<r.result.uom.length;i++)
                                    bindData.uoms.push(r.result.uom[i]["symbol"]);
                                
                               
                               if(r.result.products!=null){
                                bindData.product = r.result.products[0];
                                bindData.selectedCat={id:bindData.product.catogoryid,name:bindData.product.catogory};
                                $("#txtcaption").data("editor").html(bindData.product.caption);
                                if(r.result.products_attributes.length!=0)
                                    bindData.product.attributes=r.result.products_attributes[0];
                                else
                                    bindData.product.attributes={};
                                
                                changType(bindData.product.sellstype);
                                bindData.image = 'components/dock/soss-uploader/service/get/products/' + bindData.product.itemid+'-'+bindData.product.imgurl;
                                if(r.result.products_image!=null){
                                    bindData.p_image =[];
                                    
                                    bindData.p_image =  r.result.products_image;
                                    for (var i = 0; i < bindData.p_image.length; i++) {
                                        bindData.p_image[i].scr='components/dock/soss-uploader/service/get/products/'+bindData.product.itemid+'-'+bindData.p_image[i].name;
                                    }
                                }
                                
                               }

                            }
                        })
                        .error(function(error){
                            
            });
        

        
    }
    

    
    

    function submit(){
        $('#send').prop('disabled', true);
        bindData.submitErrors = validatorPage1.validate(); 
        if (!bindData.submitErrors){
            bindData.product.caption=$("#txtcaption").data("editor").html(); 
            bindData.product.Images=[];
            bindData.product.catogory=bindData.selectedCat.name;
            bindData.product.catogoryid=bindData.selectedCat.id;
            bindData.product.sellsInfo_data=attribute.get_data();
            for (var i = 0; i < bindData.p_image.length; i++) {
                bindData.product.Images.push({id:bindData.p_image[i].id,name:bindData.p_image[i].name,
                    caption:bindData.p_image[i].caption,default_img:bindData.p_image[i].default_img});
            }
            bindData.product.RemoveImages=bindData.p_removed;
            var promiseObj = producthandler.services.Save(bindData.product);
           
            

            promiseObj
            .then(function(result){
                //uploadFile(promiseObj.)
                
                uploadFile(result.result.itemid, function(){
                    gotoProducts();
                });
                
            })
            .error(function(){
                $('#send').prop('disabled', false);
            });
        }else{
            $('#send').prop('disabled', false);
        }
    }

    

    function gotoProducts(){
        //location.href = "#/admin-allproducts";
        handler1 = exports.getShellComponent("soss-routes");
        handler1.appNavigate("..");
    }

    function searchItems(columncode,columnvalue){
        console.log(bindData.items)
        profileHandler.services.Search({q:columncode+":"+columnvalue})
        .then(function(response){
            console.log(JSON.stringify(response));
            if(response.success){
                //console
                //bindData.item.id=response.result.result.generatedId;
                console.log(response);
                if(response.result.length!=0){
                    console.log("items chnaged");
                    //bindData.items=response.result;
                /*
                    response.result.forEach(element => {
                        //var o=;
                        //if(bindData.items.includes(element)){
                            
                        var found=false;
                        bindData.items.forEach(searchEl => {
                                if(searchEl.id==element.id){
                                    found=true;
                                }
                            
                          });  
                          if(!found){
                            bindData.items.push(element);
                          }
                            
                        //}
                    });*/
                    bindData.items=response.result;
                    bindData.showSearch=true;
                    console.log(JSON.stringify(bindData.items));
                }
            }else{
                alert (response.error);
            }
        })
        .error(function(error){
            alert (error.responseJSON.result);
            console.log(error.responseJSON);
        });
    }



    //createForm(formData);

    
});
