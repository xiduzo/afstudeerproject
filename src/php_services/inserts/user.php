<?
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $uid               = $_GET['uid'];
    $hvastudentnumber  = $_GET['hvastudentnumber'];
    $email             = $_GET['email'];
    $initials          = $_GET['initials'];
    $surname           = $_GET['surname'];
    $displayname       = $_GET['displayname'];
    $gender            = $_GET['gender'];
    $preferredlanguage = $_GET['preferredlanguage'];
    $lastlogin         = $_GET['lastlogin'];
    $access            = $_GET['access'];

    if(empty($uid) || empty($hvastudentnumber) || empty($email) || empty($initials) || empty($surname) || empty($displayname) || empty($gender) || empty($preferredlanguage) || empty($lastlogin) || empty($access)) {
        echo json_encode(false);
        return;
    }

    // Insert the house to the database
    $database->insert("User", [
        "uid"               => $uid,
        "hvaStudentNumber"  => $hvastudentnumber,
        "email"             => $email,
        "initial"           => $initials,
        "surname"           => $surname,
        "displayname"       => $displayname,
        "gender"            => $gender,
        "preferredLanguage" => $preferredlanguage,
        "lastLogin"         => $lastlogin,
        "access"            => $access
    ]);


?>
