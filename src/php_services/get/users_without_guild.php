<?php

    header("Access-Control-Allow-Origin: *");
    header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $worldUuid = $_GET['worldUuid'];

    if(!isset($worldUuid)) {
        echo json_encode(false);
        return;
    }

    // http://stackoverflow.com/a/2686266/4655177
    $users = $database->select("User", [
        "[>]UserInGuild" => ["uid" => "userUid"],
        "[>]Guild" => ["UserInGuild.guildUuid" => "uuid"]
    ], [
        "uid",
        "displayname",
        "surname",
        "email"
    ], [
        "AND" => [
            "OR" => [
                "worldUuid[!]" => [$worldUuid],
                "worldUuid" => null
            ],
            "access" => 1
        ],
        "GROUP" => "uid"
    ]);

    echo json_encode($users);

?>
