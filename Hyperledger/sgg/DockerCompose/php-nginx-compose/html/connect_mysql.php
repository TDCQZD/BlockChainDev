<?php
// mysqli_connect参数：ip:port、账号、密码、数据库
$link = mysqli_connect("10.10.10.1:3306", "root", "root", "mysql");

if (!$link) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL . "</br>";
    echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL. "</br>";
    echo "Debugging error: " . mysqli_connect_error() . PHP_EOL. "</br>";
    exit;
}

echo "Success: A proper connection to MySQL was made! The my_db database is great." . PHP_EOL. "</br>";
echo "Host information: " . mysqli_get_host_info($link) . PHP_EOL;

mysqli_close($link);
?>