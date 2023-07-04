<?php
require_once(PLUGIN_PATH . "/sossdata/SOSSData.php");
require_once(PLUGIN_PATH_LOCAL . "/profile-stelup/profile.php");

class appService {

    function __construct(){
        
    } 

    public function postLike($req,$res){
        $p=$req->Body(true);
        $result = SOSSData::Query ("products", urlencode("itemid:".($p->itemid==null?0:$p->itemid).""));
        if($result->success){
            if(count($result->result)!=0){
               
                //$r = SOSSData::Query ("products_likes", urlencode("itemid:".$p->itemid.",pid:".$p->pid));
                //if(count($p->result)!=0){
                if($p->liked){
                    SOSSData::Insert("products_likes",$p);
                }else{
                    //$r = SOSSData::Query ("products_likes", urlencode("itemid:".$p->itemid.",pid:".$p->pid));
                    //return $r;
                    SOSSData::Delete("products_likes",$p);
                    return $p;
                }
                $result = SOSSData::Update("products", $result->result[0]);
                return $p;
            }else{
                $res->SetError ("invalied Like.");
                return;
            }
        }else{
            $res->SetError ($result);
            return;
        }
    }


    public function postComment($req,$res){
        $p=$req->Body(true);
        $result = SOSSData::Query ("products", urlencode("itemid:".($p->itemid==null?0:$p->itemid).""));
        if($result->success){
            if(count($result->result)!=0){
                $r=SOSSData::Insert("products_comments",$p);
                if($r->success){
                    $p->id= $r->result->generatedId;
                    return $p;
                }else{
                    $res->SetError ($r);
                    return;
                }
                 
            }else{
                $res->SetError ("invalied Favorite.");
                return;
            }
        }else{
            $res->SetError ($result);
            return;
        }
        
    }

    public function getAllComments($req,$res){
        $result = SOSSData::Query ("products_comments", urlencode("itemid:".($_GET["id"]==null?0:$_GET["id"]).""));
        if($result->success){
            return $result->result;
        }else{
            $res->SetError ($result);
            return;
        }
    }

    public function postFavorite($req,$res){
        $p=$req->Body(true);
        $result = SOSSData::Query ("products", urlencode("itemid:".($p->itemid==null?0:$p->itemid).""));
        if($result->success){
            if(count($result->result)!=0){
               
                //$r = SOSSData::Query ("products_favorites", urlencode("itemid:".$p->itemid.",pid:".$p->pid));
                //if(count($p->result)!=0){
                if($p->liked){
                    SOSSData::Insert("products_favorites",$p);
                }else{
                    SOSSData::Delete("products_favorites",$p);
                }
                $result = SOSSData::Update("products", $result->result[0]);
                return $p;
            }else{
                $res->SetError ("invalied Favorite.");
                return;
            }
        }else{
            $res->SetError ($result);
            return;
        }
    }

    

    public function postSave($req,$res){
        $profile=$req->Body(true);
        $user= Auth::Autendicate("profile","postSave",$res);
        
        $groupid="seller";
        if($user->email!=$profile->email){
            $res->SetError ("You do not have permission to update this profile.");
            return;
        }
        //return $profile;
        if(!isset($profile->email)){
            //http_response_code(500);
            $res->SetError ("provide email");
            return;
        }
        if(!isset($profile->contactno)){
            //http_response_code(500);
            $res->SetError ("provide contact no");
            return;
        }
        //var_dump($profile);
        //exit();
        $result = SOSSData::Query ("profile", urlencode("id:".($profile->id==null?0:$profile->id).""));
        
        //return urlencode("id:".$profile->id."");
        if(count($result->result)==0)
        {
            $profile->createdate=date_format(new DateTime(), 'm-d-Y H:i:s');
            $profile->userid=$user->userid;
            $profile->status="tobeactivated";
            $result = SOSSData::Insert ("profile", $profile,$tenantId = null);
            if($result->success){
                $profile->id=$result->result->generatedId;
                if(isset($profile->attribute)){
                    $profile->attributes->id=$result->result->generatedId;

                    $r = SOSSData::Insert ("profile_attributes", $profile->attributes);
                }
            }
            if(GROUPID=="web_user"){
                Auth::Join(AUTH_DOMAIN,$user->userid,$groupid);
            }
            CacheData::clearObjects("profile");
            CacheData::clearObjects("profile_data");
            return $profile;
        }else{
            if(isset($profile->attributes)){
                $profile->attributes->id=$profile->id;
                $result = SOSSData::Delete ("profile_attributes", $profile->attributes);
                $result = SOSSData::Insert ("profile_attributes", $profile->attributes);
            }
            
            $result = SOSSData::Update("profile", $profile);
            
            if(GROUPID=="web_user"){
                Auth::Join(AUTH_DOMAIN,$user->userid,$groupid);
            }
            CacheData::clearObjects("profile");
            CacheData::clearObjects("profile_data");
            return $profile;
           
        }
        
        
    }

    public function postConfirmProductProposal($req,$res){
        $product=$req->Body(true);
        $r=SOSSData::Query("stelup_trade","id:".$product->id);
        $userProfile = Profile::getUserProfile();
        //return $product;
        if($r->success && count($r->result)>0){
            $trad=$r->result[0];
            if($trad->supplier_profileId==$userProfile->profile->id){
                $r1=SOSSData::Query("products","itemid:".$trad->itemid);
                if($r1->success && count($r1->result)>0){
                    $product=$r1->result[0];
                    if($product->qty>=1){
                        $product->qty=$product->qty-1;
                        SOSSData::Update("products",$product);
                        $trad->status="Confirmed";
                        SOSSData::Insert("stelup_trade_confirm",$trad);
                        SOSSData::Delete("stelup_trade",$trad);
                        Profile::AddNotify($trad->profileId,"stelup_proposal_accepted",$trad);
                        Profile::Send_Notify();
                        CacheData::clearObjects("products");
                        return $trad;
                    }else{
                        $trad->status="Error";
                        $trad->error="Item out of stock found to accept Proposal";
                        SOSSData::Insert("stelup_trade_rejected",$trad);
                        SOSSData::Delete("stelup_trade",$trad);
                        Profile::AddNotify($trad->profileId,"stelup_proposal_rejected",$trad);
                        Profile::Send_Notify();
                        $res->SetError("Insuficient Stock");
                        return null;
                    }
                }else{
                    $trad->status="Error";
                    $trad->error="Item not found to accept Proposal";
                    SOSSData::Insert("stelup_trade_rejected",$trad);
                    SOSSData::Delete("stelup_trade",$trad);
                    Profile::AddNotify($trad->profileId,"stelup_proposal_rejected",$trad);
                    Profile::Send_Notify();
                    $res->SetError("Item not found");
                    return null;
                }
            }else{
                $res->SetError("Access Denied");
            }
        }else{
            $res->SetError("There is no trad to be accepted");
            return;
        }
    }

    public function postRejectProductProposal($req,$res){
        $product=$req->Body(true);
        $r=SOSSData::Query("stelup_trade","id:".$product->id);
        $userProfile = Profile::getUserProfile();
        if($r->success && count($r->result)>0){
            $trad=$r->result[0];
            if($trad->supplier_profileId==$userProfile->profile->id){
                $trad->status="Rejected";
                SOSSData::Insert("stelup_trade_rejected",$trad);
                SOSSData::Delete("stelup_trade",$trad);
                Profile::AddNotify($trad->profileId,"stelup_proposal_rejected",$trad);
                Profile::Send_Notify();
                return $trad;
            }else{
                $res->SetError("Access Denied");
            }
        }else{
            $res->SetError("There is no trad to be accepted");
            return;
        }
    }

    public function postSaveProductProposal($req,$res){
        
        $product=$req->Body(true);
        $profile=Profile::getProfile($product->supplier_profileId,$product->profileId);
        if($profile->profile){
            $product->supplier_name= $profile->profile->name;
            $product->supplier_address= $profile->profile->address;
            $product->supplier_country= $profile->profile->country;
            $product->supplier_email= $profile->profile->email;
            $product->status="new";
            $result=SOSSData::Insert ("stelup_trade", $product);
            if($result->success){
                $product->id = $result->result->generatedId;
                Profile::AddNotify($product->supplier_profileId,"stelup_product_proposal",$product);
                Profile::Send_Notify();
                return $product;
            }else{
                $res->SetError ($result);
                return $res;
            }
        }else{
            $res->SetError("Supplier Profile Not Found");
        }

    }

    private function SaveSubProducts($product){
        $items=array();
        if($product->groupItems){
            $result=SOSSData::Query("products_subitems", "itemid:".$product->itemid);
            $databaseItems=$result->success?$result->result:[];
            foreach ($product->groupItems as $key => $value) {
                //$value->
                $product->groupItems[$key]->storeid=$product->storeid;
                $product->groupItems[$key]->storename=$product->storename;
                $product->groupItems[$key]->sellstype=$product->sellstype;
                $product->groupItems[$key]->showonstore="N";
                $product->groupItems[$key]->currencycode=$product->currencycode;
                $product->groupItems[$key]->catogory=$product->catogory;
                $product->groupItems[$key]->uom=$product->uom;
                $product->groupItems[$key]->invType=$product->invType;
                $product->groupItems[$key]->qty=intval($product->groupItems[$key]->grpqty)*intval($product->qty);
                if(isset($value->itemid)){
                    $result=SOSSData::Update("products",$product->groupItems[$key]);
                    $product->groupItems[$key]->updateStatus=$result;
                }else{
                    $result=SOSSData::Insert("products",$product->groupItems[$key]);
                    $product->groupItems[$key]->itemid =$result->success? $result->result->generatedId:0;
                    $product->groupItems[$key]->updateStatus=$result;
                }
                array_push($items,array("itemid"=>$product->itemid,"subitemid"=>$product->groupItems[$key]->itemid,"grpqty"=>$product->groupItems[$key]->grpqty));
            }
            SOSSData::Delete("products_subitems",$databaseItems);
            SOSSData::Insert("products_subitems",$items);
        }
        return $product;
    }

    public function postSaveProduct($req,$res){
        
        $product=$req->Body(true);
        //return $product;
        //$user= Auth::Autendicate("product","save",$res);
        $summery =new stdClass();
        $summery->summery=substr($product->caption,0,500);
        $summery->title=$product->name;
        
        //if(isset())
        $summery->imgname=isset($product->imgurl)? $product->imgurl : '';
        //echo "im in"
        $product->invType="inventry";
        if(!isset($product->itemid)){
            $result=SOSSData::Insert ("products", $product,$tenantId = null);
            //return $result;
            //var_dump($result);
            if($result->success){
                $product->itemid = $result->result->generatedId;
                $product=$this->saveAttributes($product); 
                $product=$this->SaveSubProducts($product);
            }else{
                $res->SetError ("Error Saving.");
                return $res;
            }
        }else{
            $result=SOSSData::Update ("products", $product,$tenantId = null);
            $summery->id=$product->itemid;
            if($result->success){
                $product=$this->saveAttributes($product);
                $product=$this->SaveSubProducts($product);
                
            }else{
                $res->SetError ("Error Saving.");
                //exit();
                return $res;
            }
        }
        CacheData::clearObjects("products");
        CacheData::clearObjects("d_all_summery");
        CacheData::clearObjects("products_attributes");
        if(count($product->RemoveImages)>0){
            $product->removedStatus=SOSSData::Delete("products_image",$product->RemoveImages);
        }

        foreach($product->Images as $key=>$value){
            $product->Images[$key]->articalid=$product->itemid;
            if($product->Images[$key]->id==0){
                $result2=SOSSData::Insert ("products_image", $product->Images[$key],$tenantId = null);
                if($result2->success){
                    $product->Images[$key]->id = $result2->result->generatedId;
                }

            }else{
                $result2=SOSSData::Update ("products_image", $product->Images[$key],$tenantId = null);
            }
            
            //var_dump($invoice->InvoiceItems[$key]->invoiceNo);
        }
        CacheData::clearObjects("products_image");
        return $product;
        
    }

    private function saveAttributes($product){
        if(isset($product->attributes)){
            $attributes = $product->attributes;
            //$attributes->itemid=$product->itemid;
            $r=null;
            if(isset($product->attributes->itemid))
                $r=SOSSData::Update ("products_attributes", $attributes);
            else{
                $attributes->itemid=$product->itemid;
                $r=SOSSData::Insert ("products_attributes", $attributes);
            }
            if($r->success){
                $product->attributes=$attributes;
            }else{
                $product->attributes=null;
            }
            return $product;

        }else{
            return $product;
        }
    }

    function getProduct($req){
        //echo "imain";
        $data =null;
        if(isset($_GET["itemid"])){
            //echo "in here";
            $result= CacheData::getObjects_fullcache(md5("att-itemid:".$_GET["itemid"]),"products");
            if(!isset($result)){
                //echo "in here";
                $result = SOSSData::Query("products",urlencode("itemid:".$_GET["itemid"]));
                //return $result;
                if($result->success){
                    //$f->{$s->storename}=$result->result;
                    if(isset($result->result[0])){
                        $data= $result->result[0];
                        //return $data;
                        $r=SOSSData::Query("products_attributes","itemid:".$data->itemid);
                        $data->attributes=$r->success?$r->result:null;
                        $mainObj = new stdClass();
                        $mainObj->parameters = new stdClass();
                        $mainObj->parameters->itemid = $data->itemid;
                        $r=SOSSData::ExecuteRaw("products_subitems_query",$mainObj);
                        $data->groupItems=$r->success?$r->result:null;
                        CacheData::setObjects(md5("att-itemid:".$_GET["itemid"]),"products",$data);
                        return $data;
                    }
                }else{
                    return "null";
                }
            }else{
                return $result;
            }
            
        }
    }

    public function getAllProducts($req,$res){
        if (isset($_GET["page"]) && isset($_GET["size"])){
            require_once (PLUGIN_PATH . "/sossdata/SOSSData.php");
            $mainObj = new stdClass();
            $mainObj->parameters = new stdClass();
            $mainObj->parameters->page = $_GET["page"];
            $mainObj->parameters->size = $_GET["size"];
            $mainObj->parameters->search = isset($_GET["q"]) ?  $_GET["q"] : "";
            $mainObj->parameters->pid = $_GET["pid"];

            $resultObj = SOSSData::ExecuteRaw("products_stelup_1", $mainObj);
            if($resultObj->success){
                if($mainObj->parameters->page==0 && $mainObj->parameters->search==""){
                    if(count($resultObj->result)==0){
                        $m = new stdClass();
                        $m->itemid=0;
                        $m->pid=0;
                        SOSSData::Insert("products_likes",$m);
                        SOSSData::Insert("products_favorites",$m);
                    }
                }
                return $resultObj->result;
            }else{
                $res->SetError ($resultObj);
                return $resultObj;
            }
        } else {
            
            $mainObj = new stdClass();
            $mainObj->error="Invalied Query";
            return $mainObj;
        }
    }

    


}

?>