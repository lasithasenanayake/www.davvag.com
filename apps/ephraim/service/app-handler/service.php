<?php


require_once(PLUGIN_PATH . "/sossdata/SOSSData.php");
require_once(PLUGIN_PATH . "/mpdf/mpdf.php");
require_once(PLUGIN_PATH . "/notify/notify.php");

class appService {

    function __construct(){
        
    } 

    function getCountries(){
        return array("161"=>"Armenia",  
        "105"=>"Australia", 
        "125"=>"Canada",
        "026"=>"France",
        "053"=>"Germany", 
        "071"=>"Hungary", 
        "035"=>"Malta", 
        "017"=>"Netherlands",
        "116"=>"New Zealand",
        "044"=>"Poland", 
        "134"=>"Singapore", 
        "062"=>"Spain",
        "143"=>"Sri Lanka",
        "080"=>"Switzerland",
        "152"=>"UK"); 
    }

    function drawBox($nc,$text){
        $t=str_split($text);
        $out='';
        for ($i=0; $i < $nc ; $i++) { 
            # code...
            $out.='<td style="width=5px;">'.(isset($t[$i])?strtoupper($t[$i]):"&emsp;").'</td>';
        }
        return $out;
    }

    public function postSave($req,$res){
        $data = $req->Body(true);
        $data->regdate=time();
        //$data->country=$this->getCountries()[$data->countrycode];
        $rec=SOSSData::Query("profile",urlencode("email:".$data->email));
            $data->profileid=0;
            if(!count($rec->result)>0 && !$this->CheckPro($rec->result[0],$data)){
                $new=new stdClass();
                $new->name=$data->name;
                $new->email=$data->email;
                $new->id_number=$data->id_number;
                $new->contactno=$data->contactno;
                $r=SOSSData::Insert("profile",$new);
                $data->profileid=$r->result->generatedId;
            }else{
                $data->profileid=$rec->result[0]->id;
            }
        
        $rec=SOSSData::Query("eprahimprofilerequest",urlencode("email:".$data->email));
        if(count($rec->result)>0){
            if($this->CheckPro($rec->result[0],$data)){
                $data->id=$rec->result[0]->id;
                $r=SOSSData::Update("eprahimprofilerequest",$data);
                $data->emailstatus=Notify::sendEmailMessage($data->name,$data->email,"qib-admision",$data);
                return $data;
            }else{
                $r=SOSSData::Insert("eprahimprofilerequest",$data);
                $data->id=$r->result->generatedId;
            }
        }else{
            
            $r=SOSSData::Insert("eprahimprofilerequest",$data);
            $data->id=$r->result->generatedId;
        }
        $data->emailstatus=Notify::sendEmailMessage($data->name,$data->email,"qib-admision",$data);
        return $data; 
    }

    private function CheckPro($data1,$data2){
        
        if($data1->result[0]->name==$data1->name){
            return true;
        }
        if(isset($data2->id_number)){
            if($data1->result[0]->id_number==$data1->id_number){
                return true;
            }
        }   
        return false;
    }

    public function getRegxForm($req,$res){
       $id=$_GET["ref"];
       $rec=SOSSData::Query("eprahimprofilerequest","id:".$id);
       if(count($rec->result)>0){
            $html=$this->getRenderedHTML("admision.php",array("data"=>$rec->result[0]));
            $mpdf = new \Mpdf\Mpdf();
            //echo $html;
            //exit;
            $mpdf->allow_charset_conversion=true;  // Set by default to TRUE

            $mpdf->charset_in='windows-1252';
            $mpdf->WriteHTML(mb_convert_encoding($html,"UTF-8", "windows-1252"));
            
            $pagecount=$mpdf->SetSourceFile(dirname(__FILE__)."/Instruction_manual.pdf");
            for ($i = 1; $i <= $pagecount; $i++) {
                $mpdf->WriteHTML('<pagebreak />');
                $tplId = $mpdf->ImportPage($i); // in mPdf v8 should be 'importPage($i)'
                $mpdf->UseTemplate($tplId);
            }
            $mpdf->Output("reg-ex.pdf",\Mpdf\Output\Destination::DOWNLOAD);
            exit();
        }else{
            echo "<h1>Error: Invalid Request</h1><br>We apologize, but the request you submitted is invalid. Please review the information provided and try again.";
        }
    }

    public function getListOfPeople($req,$res)
    {
        if(isset($_GET["ref"])){
            $id=$_GET["ref"];
            $rec=SOSSData::Query("eprahimprofilerequest","referelid:".$id);
            if(count($rec->result)>0){
                $html=$this->getRenderedHTML("regdata.php",array("data"=>$rec->result));
                echo $html;
            }
        }else{
            $rec=SOSSData::Query("eprahimprofilerequest",null);
            if(count($rec->result)>0){
                $html=$this->getRenderedHTML("regdata.php",array("data"=>$rec->result));
                echo $html;
            }
        }


    }

    function getRenderedHTML($path,$_data=array()) {
        foreach ($_data as $key => $value) {
            # code...
            
            $$key=$value;
        }
        ob_start();
        include($path);
        //if(isset($data)){
        
        //}
        $var = ob_get_contents();
        ob_end_clean();
        return $var;
    }

    public function getCSV($req,$res){
        $rec=SOSSData::Query("eprahimprofilerequest",null);
        //var_dump($rec);
        
        header("Content-Type: text/csv");
        header("Content-Disposition: attachment; accounts_list.csv");
        echo $this->getRenderedHTML("csv.php",array("data"=>$rec->result));
        exit();
    }


}

?>