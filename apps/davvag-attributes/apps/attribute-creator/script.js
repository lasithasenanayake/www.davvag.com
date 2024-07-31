WEBDOCK.component().register(function(exports){
    var scope,validator_profile,service_handler,sossrout_handler,complete_call;

    var bindData = {
        submitFieldErrors : [],submitErrors : [],submitInfo : [],att_info:{},data:{},valuetype:"",
        primary:false,select:{},select_values:[],field:{},fields:[],
        fieldTypes:["text","textarea","select","checkbox","option","date","fileupload"],
        fieldType:"text",
        datasource:0,
        workflows:[],
        postInput:[]
    };

    var vueData =  {
        methods:{
            submit:submit,
            addField:function(){
                $('#modalFieldPopup').modal('show');
            },
            closeField:function(){
                $('#modalFieldPopup').modal('toggle');
            },
            addNew:function(f){
                bindData.submitFieldErrors=[];
                bindData.fields.forEach(element => {
                    if(element.name==f.name){
                        bindData.submitFieldErrors.push("Duplicate Field. name filed is unique.")
                        return;
                    }
                });
                if(bindData.submitFieldErrors.length>0){
                    return;
                }
                newField={"type":bindData.fieldType,"valuetype":bindData.valuetype,"primary":bindData.primary?bindData.primary:false};
                for(var pname in bindData.field){
                    newField[pname]=bindData.field[pname];
                }
                //,"name":f.name,"label":f.label,e,"req":f.req,
                //s,"fautoIncrement":f.autoIncrement?f.autoIncrement:false,"readonly":f.readonly}
                if(bindData.valuetype=='java.lang.String')
                    newField.maxlen=f.maxlen
                
                bindData.fields.push(newField);
                bindData.field={};
                bindData.primary=false;
                
                createForm(bindData.fields,"sampleForm");
                $('#modalFieldPopup').modal('toggle');
            },
            addValue:function(f){
                bindData.submitFieldErrors=[];
                bindData.select_values.forEach(element => {
                    if(element.sel==f.value){
                        bindData.submitFieldErrors.push("Duplicate Field value")
                        return;
                    }
                });
                if(bindData.submitFieldErrors.length>0){
                    return;
                }
                newField={"label":f.caption,"sel":f.value};
                if(bindData.field.choices==null)
                    bindData.field.choices=[];
                bindData.select_values.push(newField);
                bindData.field.choices.push(newField);
                bindData.select={};
            },
            removeValue:function(x){

            },
            populatePostInputs(data){
                if(data){
                    bindData.postInput=data.inputData;
                }else{
                    bindData.postInput=[]
                }
            },
            loadvalue:loadvalue
           
        },
        data :bindData,
        onReady: function(s,c){
            scope=s;
            call_handler=c;
            complete_call=call_handler.completedEvent?call_handler.completedEvent:null;
            if(c.data.main_node){
                bindData.att_info=c.data;
                //newField={"type":c.data.fieldType,"name":f.name,"label":f.label,"valuetype":bindData.valuetype,"req":f.req}
            }else{
                bindData.att_info={main_node:"attr",name:""};
            }
            
            initialize();
        },
        computed:{
            isPrimary:function(){
                switch (bindData.valuetype) {
                    case "java.lang.String":
                        if(bindData.field.maxlen<100){
                            return true;
                        }else{
                            bindData.primary=false;
                            return false;
                        }
                        break;
                        case "int":
                            return true;
                            break;
                        case "float":
                            return true;
                            break;
                        case "java.util.Date":
                            bindData.primary=false;
                            return false;
                            break;
                    default:
                        return false;
                        break;
                }
            },
            autoIncrement:function(){
                switch (bindData.valuetype) {
                        case "int":
                            if(bindData.primary)
                              return true;
                            else
                              return false;
                            break;
                        case "float":
                            if(bindData.primary)
                                return true;
                            else
                               return false;
                            break;
                    default:
                        bindData.field.autoIncrement=false;
                        return false;
                        break;
                }
            }
        }
    }

    function initialize(){
        service_handler = exports.getComponent("app-handler");
        if(!service_handler){
            console.log("Service has not Loaded please check.")
        }
        service_handler.services.WorkFlows().then(function(r){bindData.workflows=r.success?r.result:[];}).error(function(e){console.log(e)});
        loadValidator();
        
    }

    function loadvalue(id) {
        lockForm();
        service_handler.services.Atrribute({id:bindData.att_info.main_node +'_'+id.toString()}).then(function(result){
                
            if(result.success){
               if(result.result!=null){
                   bindData.att_info=result.result;
                   bindData.fields=bindData.att_info.Fields?bindData.att_info.Fields:[];
                   bindData.postInput=bindData.att_info.postworkflow?bindData.att_info.postworkflow.inputData:[];
                   createForm(bindData.fields,"sampleForm");
               }else{
                    //bindData.att_info=result.result;
                    bindData.fields=[];
                    createForm(bindData.fields,"sampleForm");
               }
            }else{
                bindData.fields=[];
                createForm(bindData.fields,"sampleForm");
            }
            unlockForm();
        }).error(function(result){
            bindData.fields=[];
            createForm(bindData.fields,"sampleForm");
            unlockForm();
        });
    }

    function createForm(arr,id){
        var $formTmp = $('<form id="'+bindData.id+'" class="form-horizontal form-bordered"></form>');
    
        arr.forEach( function(obj, idx) {
            var $fieldSet,
                $selctOpts = $('<select class="form-control" name="" id="'+obj.name+'" '+(obj.readonly==1?'disabled':'')+' '+(obj.req==1?'required':'')+'></select>'),
                inputType = obj.type; 
                
            switch (inputType){
                case 'text':
                    $fieldSet = $('<div class="form-group"></div>');
                    $fieldSet.append('<label class="col-sm-3 control-label">'+obj.label+'</label>');
                    $txt=$('<div class="col-sm-6"></div>');
                    
                    $txt.append('<input class="form-control" type="text" id="'+obj.name+'" '+(obj.readonly==1?'disabled':'')+' '+(obj.req==1?'required':'')+'>');
                    
                    $fieldSet.append($txt); 
                    $formTmp.append($fieldSet);
                    break;
                case 'textarea':
                    $fieldSet = $('<div class="form-group"></div>');
                    $fieldSet.append('<label  class="col-sm-3 control-label">'+obj.label+'</label>');
                    $txt=$('<div class="col-sm-6"></div>');
                    $txt.append('<textarea class="form-control" rows="4" cols="50" id="'+obj.name+' '+(obj.readonly==1?'disabled':'')+' '+(obj.req==1?'required':'')+'"></textarea>');
                    $fieldSet.append($txt); 
                    $formTmp.append($fieldSet);
                    break;
                case 'select':
                    $fieldSet = $('<div class="form-group"></div>');
                    $fieldSet.append('<label  class="col-sm-3 control-label">'+obj.label+'</label>');
                    $txt=$('<div class="col-sm-6"></div>');
                    addOptions($selctOpts, obj.choices);
                    $txt.append($selctOpts);
                    $fieldSet.append($txt);                     
                    $formTmp.append($fieldSet);
                    break;
                case 'checkbox':
                        $fieldSet = $('<div class="form-group"></div>');
                        $fieldSet.append('<label class="col-sm-3 control-label">'+obj.label+'</label>');
                        $txt=$('<div class="col-sm-6"></div>');
                        if ( obj.req === 1) {
                            $txt.append('<input class="form-control" type="checkbox" true-value="'+obj.truevalue+'" false-value="'+obj.falsevalue+'"  id="'+obj.name+'" required>');
                        } else {
                            $txt.append('<input class="form-control" type="checkbox" true-value="'+obj.truevalue+'" false-value="'+obj.falsevalue+'"  id="'+obj.name+'">');
                        }
                        $fieldSet.append($txt); 
                        $formTmp.append($fieldSet);
                        break;  
                    case 'date':
                            $fieldSet = $('<div class="form-group"></div>');
                            $fieldSet.append('<label class="col-sm-3 control-label">'+obj.label+'</label>');
                            $txt=$('<div class="col-sm-6"></div>');
                            
                            $txt.append('<input class="form-control" type="date" id="'+obj.name+'" '+(obj.readonly==1?'disabled':'')+' '+(obj.req==1?'required':'')+'>');
                            
                            $fieldSet.append($txt); 
                            $formTmp.append($fieldSet);
                        break;
                default:
                    alert('There was no input type found.');
                    break;
            }
            $txt=$('<div class="col-sm-3"></div>'); 
            
            $txt.append('<button class="btn btn-danger" onclick="removexdr001('+idx.toString()+')">Delete</button>');
            if(obj.primary){
                $txt.append('<label class=" control-label">Primary </label>');
            }
            $fieldSet.append($txt);
            

        });
        
        $("#" + id).html($formTmp.html())
           
        // Loop for the select options.
        function addOptions(elem, arr){
            if(arr){
                arr.forEach(function(obj){
                    elem.append('<option value="'+obj.sel+'">'+obj.label+'</option>');              
                });
            }
        }
    }

    window.removexdr001=function(id){
        //const index = bindData.fields.indexOf(id);
        if(!(bindData.fields[id].syskey?bindData.fields[id].syskey:false)){
            if (id > -1) {
                bindData.fields.splice(id, 1);
            }
        }
        createForm(bindData.fields,"sampleForm");
       
    }
    
    function submit(){
        lockForm();
        scope.submitErrors = [];
        scope.submitErrors = validator_profile.validate(); 
        if (!scope.submitErrors){
            lockForm();
            scope.submitErrors = [];
            scope.submitInfo=[];
            bindData.att_info.Fields=bindData.fields;
            //bindData.att_info.postworkflow.inpuData=bindData.postInput;
            service_handler.services.Save(bindData.att_info).then(function(result){
                
                if(result.success){
                    if(complete_call){
                        complete_call(result.result);
                    }
                }else{
                    scope.submitErrors.push("Error Saving");
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
        validator_profile.map ("att_info.name",true, "Please enter attribute name");
        
    }

    exports.vue = vueData;
    exports.onReady = function(element){
        
    }

});
