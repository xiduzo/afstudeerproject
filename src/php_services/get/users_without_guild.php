<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    // http://stackoverflow.com/a/2686266/4655177
    $users = $database->select("User", [
        "[>]UserInGuild" => ["uid" => "userUid"]
    ], [
        "uid",
        "displayname",
        "surname",
        "email"
    ], [
        "AND" => [
            "guildUuid" => null,
            "access" => 1
        ]
    ]);

    echo json_encode($users);

?>
