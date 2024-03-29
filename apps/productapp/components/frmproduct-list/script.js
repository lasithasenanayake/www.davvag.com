WEBDOCK.component().register(function(exports){
    var bindData = {
        submitErrors: undefined,
        SearchItem:"",
        SearchColumn:"name",
        items:[],
        image:''
    };

    var vueData = {
        onReady: function(s){
            initializeComponent();
        },
        data:bindData,
        methods: {
            searchItems:searchItems,
            navigate: function(id){
                handler = exports.getShellComponent("soss-routes");
                handler.appNavigate(id ? "/product?productid=" + id : "/product");
            },
            navigatePublish: function(id){
                handler = exports.getShellComponent("soss-routes");
                handler.appNavigate(id ? "/publish?productid=" + id : "/product");
            },
            deleteProduct:deletepr

        }
    }

    function deletepr(e){
        var handler = exports.getComponent("product");

        handler.services.Delete(e).then(function(result){
            //scope.items = result.result;
            if(result.success){
                let filteredItems = bindData.items.filter(function(item) {
                    if(item.itemid!==result.result.itemid)
                        return item;
                });
                bindData.items=filteredItems==null?[]:filteredItems;
            }else{

            }
            //console.log(JSON.stringify(result));
        }).error(function(){
            
        });
    }
    exports.vue = vueData;
    exports.onReady = function(element){
    }
    //var catogoryid ={"Staff",""};
    //var item ={};
    
    var handler;

    function initializeComponent(){
        handler = exports.getComponent("product");
        searchItems("","");
    }

    

    

    function searchItems(columncode,columnvalue){
        console.log(encodeURI(columncode+":"+columnvalue))
        handler.transformers.allProducts()
        .then(function(response){
            console.log(JSON.stringify(response));
            if(response.success){
                //console
                //bindData.item.id=response.result.result.generatedId;
                bindData.items=[];
                console.log(response);
                if(response.result.length!=0){
                    console.log("items chnaged");
                    //bindData.items=response.result;
                    response.result.forEach(element => {
                        bindData.items.push({
                            name:element.name,
                            itemid:element.itemid,
                            image:"components/dock/soss-uploader/service/get/products/"+element.itemid+"-"+element.imgurl,
                            description:element.description,
                            price:element.price,
                            imgurl:element.imgurl,
                            uom:element.uom
                        })
                    });
                    
                   
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


});
