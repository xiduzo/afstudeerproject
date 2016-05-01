<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $userUid = $_GET['userUid'];
    $guildUuid = $_GET['guildUuid'];

    if(empty($userUid) || empty($guildUuid)) {
        echo json_encode(false);
        return;
    }

    // Insert the house to the database
    $database->insert("UserInGuild", [
        "userUid" => $userUid,
        "guildUuid" => $guildUuid
    ]);

    echo json_encode(true);

?>
