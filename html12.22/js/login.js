var addCookie = function (name, value, time) {
    var strSec = getSec(time); var exp = new Date(); exp.setTime(exp.getTime() + strSec * 1); //设置cookie的名称、值、失效时间 
    document.cookie = name + "=" + value + ";expires="+ exp.toGMTString(); }

function Login() {
    var form = document.getElementById("LoginForm");
    var user_name = document.getElementById("login_user").value;
    var password = document.getElementById("login_password").value;
    var user_data = GetUser(user_name, password);
    if (user_data["success"]) {
        var user_money = GetMoney(user_name)
        if (user_money["success"]){
            bank_url = "bankpage.html?name="+user_name+"&money="+user_money["amount"];
            document.cookie = "user=" + user_name 
            document.cookie = "password="+ password
            console.log(document.cookie)
            console.log(document.cookie)
            console.log(document.cookie)
            console.log(document.cookie)
            console.log(document.cookie)
            console.log(document.cookie)
            //alert('make cookie')
            form.action = bank_url;
        }
        else{
            alert("Incorrect user name");
            bank_url = "login.html";
            form.action = bank_url;
            }
        } 
        else {
            alert("Incorrect user name or password!");
    }
}

function GetUser(_user, _password){
    var success = '';
    var search_url = "./php/database.php";

    var dataParam = {
        action: "login",
        user: _user,
        password: _password
    };
    console.log(dataParam);

    $.ajax({
        type: "GET",
        url: search_url,
        data: dataParam,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        async:false,
        success: function(data) {
            success = data
            console.log(data);
       },
        error: function(data) {
            //alert("can not connect to the server");
            window.location.replace("../test_fail.html");
        },
    });
    return success;
}

function GetMoney(user_name) {
    var money = '';
    var search_url = "./php/database.php";
    
    var dataParam = {
        action: "query_amount",
        user: user_name
    };
    console.log(dataParam);
    $.ajax({
        type: "GET",
        url: search_url,
        data: dataParam,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        async:false,
        success: function(data) {
            money = data
        },
        error: function (xhr, textStatus, errorThrown) {
            /*错误信息处理*/
            alert("error---");
            console.log(xhr.status);
            console.log(xhr.readyState);
            console.log(xhr.statusText );
            console.log(xhr.responseText );
            console.log(textStatus); 
            console.log(xhr.statusText);
　　　　 },
    });
    return money;
}



function Register() {
    var search_url = "./php/database.php";
    passwd = document.getElementById("reg_passwd").value
    conf_passwd = document.getElementById("reg_conf_passwd").value
    user_name = document.getElementById("reg_user").value
    email_addr = document.getElementById("reg_email").value

    if(passwd != conf_passwd){
        alert("Two passwords not matched !")
        return
    }
    /* 
    //用户名正则，4�?6位（字母，数字，下划线，减号�?    
    var uPattern = /^[a-zA-Z0-9_-]{4,16}$/;
    if(!uPattern.test(user_name)){
        alert("用户名必须是4-6位(字母，数字，下划线，减号)")
        return
    }
    //密码强度正则，最�?位，包括至少1个大写字母，1个小写字母，1个数字，1个特殊字�?    
    var pPattern = /^.*(?=.{6,})(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*? ]).*$/;
    if(!pPattern.test(passwd)){
        alert("密码最少6位，包括至少1个大写字母，1个小写字母，1个数字，1个特殊字")
        return
    }*/
    //Email正则
    var ePattern = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if(!ePattern.test(email_addr)){
        alert("Email地址不合规")
        return 
    }

    var dataParam = {
        action: "register",
        user: user_name,
        password: passwd,
        email: email_addr
    };
    console.log(dataParam);

    $.ajax({
        type: "GET",
        url: search_url,
        data: dataParam,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        success: function(result) {
            console.log(result)
            if (result["email"]) {
                if(result["user"]){
                    alert("Register Success")
                }
                else{
                    alert("User already exists")
                }
            }
            else{
                alert("Email has been registered")
            }
        },
        error: function(result) {
            alert("can not connect to the server");
            location.reload()
        },
    });
}
