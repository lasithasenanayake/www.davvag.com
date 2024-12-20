WEBDOCK.component().register(function(exports){
    var bindData = {
        submitErrors: undefined,
        SearchItem:"",
        SearchColumn:"name",
        items:undefined,
        image:'',
        Message:'Please start by searching the profile or creating a new profile',
        Launchers:[]
    };

    var vueData = {
        onReady: function(){
            initializeComponent();
        },
        data:bindData,
        methods: {
            searchItems:searchItems,
            clear:function(){
                localStorage.setItem("tmpprofiles",undefined);
                bindData.items=undefined;
            },
            select:function(p){
                exports.Complete(p);
            },
            navigate: function(pagev,p){
                //console.log(p);
               
                handler = exports.getShellComponent("soss-routes");
                if(p!=null){
                    handler.appNavigate("/"+pagev+"?id=" + p.id);
                    addProfileToTmp(p);
                }else{
                    handler.appNavigate("/"+pagev);
                }
            },status:function(status){
                switch((status?status:'active').toString().toLowerCase()){
                    case "tobeactive":
                        return "primary";
                    break;
                    case "tobeactivated":
                        return "pramary";
                        break;
                    case "inactive":
                        return "warning";
                    break;
                    case "void":
                        return "danger";
                    break;
                    case "active":
                        return "success";
                    break;
                    default:
                        return "warning";
                    break;
                }
            }
        }
    }

    function addProfileToTmp(p){
        var profiles=[];
        var additem=true;
        if( localStorage.getItem("tmpprofiles")!==null)
        {
            profiles=JSON.parse(localStorage.getItem("tmpprofiles"));
        }
        profiles.forEach(element => {
            if(element.id==p.id){
                element=p;
                additem=false;
                return;
            }
        });
        if(additem){
            profiles.push(p);
        }
        localStorage.setItem("tmpprofiles",JSON.stringify(profiles));
    }
    
    exports.vue = vueData;
    exports.onReady = function(element){
    }
    //var catogoryid ={"Staff",""};
    //var item ={};
    
    var profileHandler;

    function initializeComponent(){
        profileHandler = exports.getComponent("profile");
        //document.title="test";
        //console.log(document.getElementsByTagName("META"));
        handler  = exports.getShellComponent("auth-handler");
        //var menuhandler  = exports.getComponent("soss-data");
        
        var tmpmenu=[];
       
        handler.services.Launchers({appcode:"profileapp",component:"frmprofile-list"})
            .then(function(r){
                if(r.success){
                    bindData.Launchers=r.result;
                    console.log(bindData.Launchers);
                }
            }).error(function(e){

        });

        var x = document.getElementsByTagName("META");
        var i;
        for (i = 0; i < x.length; i++) {
            if(document.getElementsByTagName("META")[i].name=="description"){
                console.log("changed");
                document.getElementsByTagName("META")[i].content="yo yo mom";
            }
        }
        document.getElementsByTagName("TITLE").innerHTML="Profile Bro";
        if( localStorage.getItem("tmpprofiles")!==null)
        {
            bindData.items=JSON.parse(localStorage.getItem("tmpprofiles"));
            bindData.Message="";
        }
        
    }

    

    

    function searchItems(columncode,columnvalue){
        //console.log(encodeURI(columncode+":"+columnvalue))
        WEBDOCK.freezeUiComponent("soss-routes",true); 
        bindData.Message="Searching Profiles Please wait....";
        profileHandler.services.SearchV1({column:columncode,value:columnvalue})
        .then(function(response){
            console.log(JSON.stringify(response));
            if(response.success){
                //console
                //bindData.item.id=response.result.result.generatedId;
                bindData.items=[];
                console.log(response);
                if(response.result.length!=0){
                    console.log("items chnaged");
                    response.result.forEach(element => {
                        bindData.items.push({
                            name:element.name,
                            id:element.id,
                            image:"components/dock/soss-uploader/service/get/profile/"+element.id,
                            email:element.email,
                            contactno:element.contactno,
                            organization:element.organization,
                            Status:element.Status
                        })
                    });
                    
                    bindData.Message="";
                    WEBDOCK.freezeUiComponent("soss-routes",false); 
                    //console.log(JSON.stringify(bindData.items));
                }else{
                    bindData.Message="No profiles Found for "+columncode+" = "+ columnvalue;
                    WEBDOCK.freezeUiComponent("soss-routes",false); 
                }
            }else{
                alert (response.error);
                WEBDOCK.freezeUiComponent("soss-routes",false); 
            }
        })
        .error(function(error){
            alert (error.responseJSON.result);
            WEBDOCK.freezeUiComponent("soss-routes",false); 
        });
    }


});
