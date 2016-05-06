<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $worldUuid = $_GET['worldUuid'];

    // This took me a while to figure out
    // http://stackoverflow.com/questions/37059148/sql-select-all-users-from-table-x-which-are-not-in-comination-on-table-y/
    // $lecturers = $database->select("User", [
    //     "[>]UserInWorld" => ["uid" => "userUid"]
    // ], [
    //     "uid",
    //     "displayname",
    //     "surname",
    //     "email"
    // ], [
    //     "AND" => [
    //         "OR" => [
    //             "worldUuid[!]" => [$worldUuid],
    //             "worldUuid" => NULL
    //         ],
    //         "access" => 2
    //     ],
    //     "GROUP" => "uid"
    // ]);

    $lecturers = $database->select("User", [
        "[>]UserInWorld" => ["uid" => "userUid"]
    ], [
        "uid",
        "displayname",
        "surname",
        "email"
    ], [
        "AND" => [
            "worldUuid" => NULL,
            "access" => 2
        ],
        "GROUP" => "uid"
    ]);

    echo json_encode($lecturers);

?>
