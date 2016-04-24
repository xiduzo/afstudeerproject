<?php
    // Require the DB class
    require_once 'medoo.php';


    // DB settings
    $host = "sql8.pcextreme.nl";
    $user = "63744cmd";
    $pass = "O3pXgXgRZ9";
    $db   = "63744cmd";

    // Make the database connections using medoo
	$database = new medoo([
		'database_type' => 'mysql',
		'database_name' => $db,
		'server'        => $host,
		'username'      => $user,
		'password'      => $pass,
		'charset'       => 'utf8'

	]);

    // Make sure there is a database connection when using the site
	if(!$database) die("Database error");

    $salt = 'vew8*F47#K)@011%9kz#8Ge';

?>
