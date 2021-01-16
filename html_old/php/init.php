<?php
$servername = "bankDB";
$username = "admin";
$password = "666666";
$dbname = "myDB";

// 创建连接
$conn = new mysqli($servername, $username, $password);
// 检测连接
if ($conn->connect_error) {
    die("Connect Error: " . $conn->connect_error);
} 
 
// 创建数据库
$sql = "CREATE DATABASE myDB";
if ($conn->query($sql) === TRUE) {
    echo "Database myDB Created Successfully";
} else {
    echo "Error creating database: " . $conn->error;
}
 
// 使用 sql 创建数据表
$sql = "CREATE TABLE Guests (
user VARCHAR(25) PRIMARY KEY, 
passwd VARCHAR(25) NOT NULL,
email VARCHAR(50) NOT NULL,
amount decimal NOT NULL,
)";
     
if (mysqli_query($conn, $sql)) {
    echo "Table Guests Created Successfully";
} else {
    echo "Creation Error: " . mysqli_error($conn);
}

$conn->close();
?>

