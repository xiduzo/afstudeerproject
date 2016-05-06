<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $userUid = $_GET['userUid'];
    $worldUuid = $_GET['worldUuid'];

    if(empty($userUid) || empty($worldUuid)) {
        echo json_encode(false);
        return;
    }

    // Insert the house to the database
    $database->delete("UserInWorld", [
        "AND" => [
            "userUid" => $userUid,
            "worldUuid" => $worldUuid
        ]
    ]);

    echo json_encode(true);

?>
