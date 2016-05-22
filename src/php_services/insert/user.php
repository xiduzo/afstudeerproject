<?php

    header("Access-Control-Allow-Origin: *");
    header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';
    require_once '../function/now.php';

    $uid               = $_GET['uid'];
    $hvastudentnumber  = $_GET['hvastudentnumber'];
    $email             = $_GET['email'];
    $initials          = $_GET['initials'];
    $surname           = $_GET['surname'];
    $displayname       = $_GET['displayname'];
    $gender            = $_GET['gender'];
    $preferredlanguage = $_GET['preferredlanguage'];
    $access            = $_GET['access'];

    if(!isset($uid) || !isset($hvastudentnumber) || !isset($email) || !isset($initials) || !isset($surname) || !isset($displayname) || !isset($gender) || !isset($preferredlanguage) || !isset($access)) {
        echo json_encode(false);
        return;
    }

    // Insert the house to the database
    $database->insert("User", [
        "uid"               => $uid,
        "hvaStudentNumber"  => $hvastudentnumber,
        "email"             => $email,
        "initials"          => $initials,
        "surname"           => $surname,
        "displayname"       => $displayname,
        "gender"            => $gender,
        "preferredLanguage" => $preferredlanguage,
        "lastLogin"         => now(),
        "access"            => $access
    ]);

    echo json_encode(true);


?>
