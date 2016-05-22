<?php

    header("Access-Control-Allow-Origin: *");
    header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
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
