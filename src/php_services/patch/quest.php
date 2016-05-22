<?php

    header("Access-Control-Allow-Origin: *");
    header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $questUuid = $_GET['questUuid'];

    $name = $_GET['name'];
    $experience = $_GET['experience'];
    $description = $_GET['description'];

    // Skills
    $id = $_GET['id'];
    $vid = $_GET['vid'];
    $fd = $_GET['fd'];
    $cm = $_GET['cm'];
    $pm = $_GET['pm'];

    $worldUuid = $_GET['worldUuid'];

    if(!isset($questUuid) || !isset($name) || !is_numeric($experience) || !isset($description) || !is_numeric($id) || !is_numeric($vid) || !is_numeric($fd) || !is_numeric($cm) || !is_numeric($pm) || !isset($worldUuid)) {
        echo json_encode(false);
        return;
    }

    // Insert the house to the database
    $database->update("Quest", [
        "name" => $name,
        "description" => $description,
        "experience" => $experience,
        "interaction_design" => $id,
        "visual_interface_design" => $vid,
        "frontend_development" => $fd,
        "content_management" => $cm,
        "project_management" => $pm
    ], [
        "AND" => [
            "uuid" => $questUuid,
            "worldUuid" => $worldUuid
        ]
    ]);

    echo json_encode(true);

?>
