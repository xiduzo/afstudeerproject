<?php

    header("Access-Control-Allow-Origin: *");
    header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $userUid = $_GET['userUid'];
    $guildUuid = $_GET['guildUuid'];

    if(!isset($userUid) || !isset($guildUuid)) {
        echo json_encode(false);
        return;
    }

    // Insert the house to the database
    $database->delete("UserInGuild", [
        "AND" => [
            "userUid" => $userUid,
            "guildUuid" => $guildUuid
        ]
    ]);

    echo json_encode(true);

?>
