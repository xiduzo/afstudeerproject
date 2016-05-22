<?php

    header("Access-Control-Allow-Origin: *");
    header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $worldUuid = $_GET['worldUuid'];

    // This took me a while to figure out
    // http://stackoverflow.com/questions/37059148/sql-select-all-users-from-table-x-which-are-not-in-comination-on-table-y/
    $lecturers = $database->select("User", [
        "[>]UserInWorld" => ["uid" => "userUid"]
    ], [
        "uid",
        "displayname",
        "surname",
        "email"
    ], [
        "AND" => [
            "OR" => [
                "worldUuid[!]" => [$worldUuid],
                "worldUuid" => NULL
            ],
            "access" => 2
        ],
        "GROUP" => "uid"
    ]);

    echo json_encode($lecturers);

?>
