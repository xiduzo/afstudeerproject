<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $guildUuid = $_GET['guildUuid'];

    if(!isset($guildUuid)) {
        echo json_encode(false);
        return;
    }

    $users = $database->select("User", [
        "[>]UserInGuild" => ["uid" => "userUid"]
    ], [
        "uid",
        "displayname",
        "surname",
        "email"
    ], [
        "guildUuid" => $guildUuid
    ]);

    echo json_encode($users);

?>
