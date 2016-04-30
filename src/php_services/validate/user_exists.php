<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $uid = $_GET['uid'];

    if(!$uid) {
        echo json_encode(false);
        return;
    }

    if($database->has("User", [
        "uid" => $uid
    ])) {
        echo json_encode(true);
    } else {
        echo json_encode(false);
    }

?>
