<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $uid = $_GET['uid'];

    if(empty($uid)) {
        echo json_encode(false);
        return;
    }

    $access = $database->get("User", "access", [
        "uid" => $uid
    ]);

    echo json_encode($access);

?>
