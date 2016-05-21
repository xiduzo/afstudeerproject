<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';
    require_once '../function/uuid.php';

    $uuid = uuid();

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

    if(!isset($name) || !is_numeric($experience) || !isset($description) || !is_numeric($id) || !is_numeric($vid) || !is_numeric($fd) || !is_numeric($cm) || !is_numeric($pm) || !isset($worldUuid)) {
        echo json_encode(false);
        return;
    }

    $uuid = uuid();

    // Insert the house to the database
    $database->insert("Quest", [
        "uuid" => $uuid,
        "name" => $name,
        "description" => $description,
        "experience" => $experience,
        "interaction_design" => $id,
        "visual_interface_design" => $vid,
        "frontend_development" => $fd,
        "content_management" => $cm,
        "project_management" => $pm,
        "worldUuid" => $worldUuid
    ]);

    $quest = $database->get("Quest", "*", [
        "uuid" => $uuid
    ]);

    echo json_encode($quest);

?>
