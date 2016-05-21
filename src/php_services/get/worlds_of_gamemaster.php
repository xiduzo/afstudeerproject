<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $userUid = $_GET['userUid'];

    if(!isset($userUid)) {
        echo json_encode(false);
        return;
    }

    $worlds = $database->select("World", [
        "[>]UserInWorld" => ["uuid" => "worldUuid"]
    ], [
        "uuid",
        "name"
    ], [
        "UserInWorld.userUid" => $userUid
    ]);

    echo json_encode($worlds);

?>
