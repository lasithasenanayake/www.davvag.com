<?php
require_once(PLUGIN_PATH . "/sossdata/SOSSData.php");
require_once(PLUGIN_PATH . "/phpcache/cache.php");
require_once(PLUGIN_PATH . "/auth/auth.php");

class ProductServices {

    public function getAllProducts($req){
        if (isset($_GET["page"]) && isset($_GET["size"])){
            require_once (PLUGIN_PATH . "/sossdata/SOSSData.php");
            $mainObj = new stdClass();
            $mainObj->parameters = new stdClass();
            $mainObj->parameters->page = $_GET["page"];
            $mainObj->parameters->size = $_GET["size"];
            $mainObj->parameters->search = isset($_GET["q"]) ?  $_GET["q"] : "";
            $mainObj->parameters->rad = '0';
            $mainObj->parameters->lon = '0';
            $mainObj->parameters->lan = '0';
            $mainObj->parameters->cat = isset($_GET["cat"]) ? $_GET["cat"] : "";

            $resultObj = SOSSData::ExecuteRaw("nearproducts", $mainObj);
            return $resultObj->result;
        } else {
            
            $mainObj = new stdClass();
            $mainObj->error="Invalied Query";
            return $mainObj;
        }
    }

    public function postCheckout($req,$res){
        require_once (PLUGIN_PATH_LOCAL . "/davvag-order/davvag-order.php");
        require_once (PLUGIN_PATH_LOCAL . "/profile/profile.php");
        $handler =new Davvag_Order();
        $profile = $req->Body(true);
        $profile->order = new stdClass();
        if(isset($_COOKIE["Location"])){
            $location = json_decode($_COOKIE["Location"]);
            $profile->order->lat = $location->lat;
            $profile->order->lon = $location->lng;
        }
        $Store_profile= Profile::getProfile($profile->data->storeid,0);
        if(isset($Store_profile->profile)){
            //return $Store_profile->profile;
            $Store_profile=$Store_profile->profile;
            $profile->order->supplier_profileId = $Store_profile->id; 
            $profile->order->supplier_name = $Store_profile->name;
            $profile->order->supplier_contactno = isset($Store_profile->contactno)?$Store_profile->contactno:null;
            $profile->order->supplier_address = isset($Store_profile->address)?$Store_profile->address:null;
            $profile->order->supplier_city = isset($Store_profile->city)?$Store_profile->city:null;
            $profile->order->supplier_country = isset($Store_profile->country)?$Store_profile->country:null;
            $profile->order->supplier_email = isset($Store_profile->email)?$Store_profile->email:null;
        }
        
        $profile->order->profileId = $profile->id;
        $profile->order->name = $profile->name;
        $profile->order->contactno = $profile->contactno;
        $profile->order->address = $profile->address;
        $profile->order->city = $profile->city;
        $profile->order->country = $profile->country;
        $profile->order->orderdate = date("m-d-Y H:i:s");
        $profile->order->currencycode='gbp';
        $profile->order->InvoiceItems = array();
        $profile->order->deliverydate = $profile->deliverydate;
        $profile->order->paymenttype = $profile->paymenttype;
        $profile->order->status = "new";//$profile->orderstatus;
        $profile->order->remarks = isset($profile->remarks) ?$profile->remarks : "";
        $profile->order->total = 0;
        $profile->order->subtotal = 0;
        $profile->order->paidamount = 0;
        $profile->order->balance = 0;
        $profile->order->taxamount = 0;
        //$profile->order->tenant = $_SERVER["HTTP_HOST"];
        $profile->order->invoiceDate = date("m-d-Y H:i:s");
        $profile->order->invoiceDueDate = date("m-d-Y H:i:s");
        
       //$authData = json_decode($_COOKIE["authData"]);
        $profile->order->email = $profile->email;
        if(!isset($profile->data->items)){
            $res->SetError("Invalied call");
            return $profile->items;
        }
        for ($i=0;$i<sizeof($profile->data->items);$i++){
            $item = $profile->data->items[$i];
            
            $detail = new stdClass();
            $detail->itemid = $item->itemid;
            $detail->productid = $item->itemid;
            $detail->invType= $item->invType;
            $detail->tid = $item->tid;
            $detail->tenant = HOST_NAME;
            $profile->order->tenant = HOST_NAME;
            $detail->name = $item->name;
            $detail->uom = $item->uom;
            $detail->qty = $item->qty;
            $detail->price = $item->price-($item->price*($item->discountper/100));
            $detail->total = $item->qty * $detail->price;
            $profile->order->total += ($detail->total);
            $profile->order->subtotal += ($detail->total);
            array_push($profile->order->InvoiceItems, $detail);
        }
        unset ($profile->data);
        try{
            $order= $handler->InvoiceSave($profile->order,$res);
            CacheData::clearObjects("products");
            $result = SOSSData::Insert ("orderheader_pending", $order);
            $result = SOSSData::Insert ("orderdetails_pending", $order->InvoiceItems);
            return $order;
        }catch(Exception $e){
            $req->SetError($e);
        }
    }

    function getProduct($req){
        //echo "imain";
        $data =null;
        if(isset($_GET["q"])){
            //echo "in here";
            $result= CacheData::getObjects_fullcache(md5("itemid:".$_GET["q"]),"products");
            if(!isset($result)){
                //echo "in here";
                $result = SOSSData::Query("products",urlencode("itemid:".$_GET["q"]));
                //return $result;
                if($result->success){
                    //$f->{$s->storename}=$result->result;
                    if(isset($result->result[0])){
                        $data= $result->result[0];
                        CacheData::setObjects(md5("itemid:".$_GET["q"]),"products",$result->result);
                    }
                }
            }else{
                $data= $result[0];
            }
            //$result = SOSSData::Query ("d_cms_artical_v1",urlencode("id:".$_GET["q"]));
            //var_dump($result);
            //echo "imain";
            if(isset($data)){
                
                
                echo '<!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8" />
                    <meta name="description" content="'.urldecode(strip_tags($data->caption)).'">
                    <meta name="tags" content="'.urldecode($data->tags).'">
                    <meta property="og:type" content="product">
                    <meta name="og:title" content="'.urldecode($data->name).'">
                    <meta property="og:category" content="'.urldecode($data->cat).'" />
                    <meta name="og:description" content="'.urldecode(strip_tags($data->caption)).'">
                    <meta name="og:tags"  content="'.urldecode($data->keywords).'">
                    <meta name="og:image"  content="http://'.$_SERVER["HTTP_HOST"].'/components/dock/soss-uploader/service/get/products/'.$_GET["q"]."-".$data->imgurl.'">
                    <meta property="og:price:amount" content="'.urldecode($data->price).'">
                    <meta property="og:price:currency" content="'.urldecode($data->currencycode).'">
                    <meta property="og:availability" content="instock" />
                    <title>'.urldecode($data->name).'</title>
                    
                </head>
                <body>
                    loading.....
                    <script type="text/javascript">
                        setTimeout(function(){ window.location = "/#/app/davvag-shop/a?id='.$_GET["q"].'"; }, 1000);
                        
                    </script>    
                </body>
                </html>';
                exit();      

            }
        }
    }
}

?>