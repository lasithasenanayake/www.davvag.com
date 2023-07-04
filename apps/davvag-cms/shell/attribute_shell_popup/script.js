WEBDOCK.component().register(function(exports){
    var attrivuteID;
    var formdata=[];
    var callback;
    var data,primaryData=[];
    var attribute;
    var _delete=false;

    function openPopupForm(id,_data,cb,del_option=false){
        attribute=exports.getShellComponent("attribute_shell");
        attrivuteID=id;
        data=_data;
        callback=cb;
        _delete=del_option;
        var popup=document.getElementById('popupAttribute');
        if(popup!=null){
            popup.remove();
        }
        bodyEt=$("body");
        bodyEt.append("<div id='popupAttribute' class='modal fade' tabindex='-1' role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'><div class='modal-dialog' role='document'><div class='modal-content'><div class='modal-header'> <h5 class='modal-title' id='popupAttribute-title'>Form</h5></div><div id='popupAttribute-body' class='modal-body'></div><div class='modal-footer'><button type='button' class='btn btn-secondary' data-dismiss='modal'>Cancel</button>"+
        (_delete?"<button id='btnAttribute_delete' type='button' class='btn btn-danger' >Delete</button>":"")+"<button id='btnAttribute_save' type='button' class='btn btn-primary' >Save</button></div></div></div></div>");
        attribute.renderForm(id,"popupAttribute-body",_data,function(){
            initiate();
        });
        $("#popupAttribute").modal('show');
    }

    function close() {
        frm.modal('toggle');
    }

    function initiate() {
        $("#btnAttribute_save").click(function(){
            data=attribute.get_data();
            
            attribute.services.Save(data).then(function(r){
                
                $("#popupAttribute").modal('toggle');
                callback(r);
            }).error(function(e){
                
                $("#popupAttribute").modal('toggle');
                callback(e);
            });
        });

        $("#btnAttribute_delete").click(function(){
            data=attribute.get_data();
            
            attribute.services.Delete(data).then(function(r){
                
                $("#popupAttribute").modal('toggle');
                callback(r);
            }).error(function(e){
                
                $("#popupAttribute").modal('toggle');
                callback(e);
            });
        });
        
        
    }
    
    //exports.retriveDataFromServer=attribute.retriveDataFromServer;
    exports.open = openPopupForm;
    exports.close=close;
    //exports.get_data=attribute.get_data;

});
