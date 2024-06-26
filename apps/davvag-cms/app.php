<?php

if ($_SERVER['REQUEST_METHOD'] == "GET"){
    if(isset($_GET["q"])){
        $redirectUrl = sprintf(
                        "%s://%s%s",
                        isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off' ? 'https' : 'http',
                        $_SERVER['SERVER_NAME'],
                        $_SERVER['REQUEST_URI']
                    );
        ///echo explode("?",$redirectUrl)[0].$_GET["q"];
        header("Location: ".explode("?",$redirectUrl)[0].$_GET["q"]);
    }else{
        require_once (dirname(__FILE__) . "/pages/index.php");
    }
    
    
}else {
    if ($_SERVER['REQUEST_METHOD'] == "POST"){
        
        $loginResult = login($_POST["username"], $_POST["password"]);
        $redirectUrl="index.php";
        $redirectUrl = str_replace($redirectUrl,"",$_SERVER['PHP_SELF']);
        if (!isset($loginResult)){
            $redirectUrl .="?success=false";
        }
        header("Location: $redirectUrl");
    }
}


function login($username, $password){
    require_once(PLUGIN_PATH . "/auth/auth.php");
    $loginResult = Auth::Login($username,$password, $_SERVER["HTTP_HOST"]);

    if (isset($loginResult)){
        $token = $loginResult->token;
    }

    if (isset($token)){
        setcookie("securityToken", $token, time() + (86400 * 30), "/");
        setcookie("authData", json_encode($loginResult), time() + (86400 * 30), "/");
        return true;
    } 

}


?>