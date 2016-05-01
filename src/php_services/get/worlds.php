<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once '../config.php';

    $worlds = $database->select("World", "*");

    echo json_encode($worlds);

?>
