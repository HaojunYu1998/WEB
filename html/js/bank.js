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
            alert(xhr.statusText); 　　　　　　　　
　　　　 },
    });
    return money;
};

function refresh_myself(){
    var user_name = document.getElementById("user_name").lastChild.lastChild.data;
    var user_money = GetMoney(user_name)
    
    if (user_money["success"]){
        bank_url = "../bankpage.html?name="+user_name+"&money="+user_money["amount"];
        window.location.href = bank_url;
    }
    else{
        alert("Incorrect user name");
    }
};

function search_myself(){
    var name= ''
    var money = 0
    var user_name = document.getElementById("user_name"); 
    var childs = user_name.childNodes; 
    user_name.removeChild(childs[childs.length - 1]); 
    var user_money = document.getElementById("user_money"); 
    var childs = user_money.childNodes; 
    user_money.removeChild(childs[childs.length - 1]); 
    var mystring = location.href
    var num=mystring.indexOf("?") 
    var theRequest = new Object();
    if(num>=0){
        str=mystring.substr(num+1); //取得所有参数
        var arr=str.split("&"); //各个参数放到数组里
        for(var i=0;i < arr.length;i++){ 
            num=arr[i].indexOf("="); 
            if(num>0){ 
                key=arr[i].substring(0,num);
                value=arr[i].substr(num+1);
                theRequest[key]=value;
            } 
        } 
        name = theRequest['name'];
        money = theRequest['money'];
    }
    if(name == ''){
        name = 'nobody';
        money = 'zero';
    }
    var name1 = document.createTextNode(name);
    var name2 = document.createElement("font");
    name2.appendChild(name1);
    document.getElementById("user_name").appendChild(name2);
    var money1 = document.createTextNode(money);
    var money2 = document.createElement("font");
    money2.appendChild(money1);
    document.getElementById("user_money").appendChild(money2);
};

function transfer_amount(){
    var search_url = "./php/database.php";
    var url = "./bank.html";
    var src_user = document.getElementById("user_name").lastChild.lastChild.data;
    var dst_user = document.getElementById("receiver").value;
    var amount = document.getElementById("transfer_count").value;

    if(dst_user == ''){
        document.getElementById("transfer_button").href = "#";
        console.log(document.getElementById("transfer_button").href)
        alert("need receiver!")
        return
    }

    //检查转账钱数
    str = amount;
    var reg = /^(0\.(?!0+$)\d{1,4}|^[1-9][0-9]{0,11}(\.\d{0,2})?)$/;
    if(str == "0" || str == ''){
        document.getElementById("transfer_button").href = "#";
        console.log(document.getElementById("transfer_button").href)
        alert("amount>0!");
        return;
    }
    if (reg.test(str) == false) {
        
        //document.getElementById("transfer_button").href = "#";
        console.log(document.getElementById("transfer_button").href)
        alert("amount wrong!");
        return;
    }

    //url 中问号后面的参数 action，这个对象就是查询的参数
    var dataParam = {
        action: "transfer",
        src_user: src_user,
        dst_user: dst_user,
        amount: amount.toString()
    };
    console.log(amount)
    console.log(amount)
    console.log(amount)
    console.log(amount.toString())


    $.ajax({
        type: "get",
        url: search_url,
        data: dataParam,
        dataType: 'json',
        async:false,
        contentType: 'application/json; charset=utf-8',
        success: function(data) {
            success = data
       },
        error: function(xhr, textStatus, errorThrown) {
            //alert("can not connect to the server");
            
            console.log("状态码："+xhr.status);
            console.log("状态:"+xhr.readyState);//当前状态,0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成。
            console.log("错误信息:"+xhr.statusText );
            console.log("返回响应信息："+xhr.responseText );//这里是详细的信息
            console.log("请求状态："+textStatus); 　
            console.log(xhr.statusText);
            alert("进入error---");
            alert("进入error---");
            window.location.replace("../test_fail.html");
        },
    });
    var result = document.getElementById("transfer_result"); 
    var childs = result.childNodes; 
    if(childs.length>0){
        result.removeChild(childs[childs.length - 1]); 
    }
    if(success == 0){
        var name1 = document.createTextNode("success");
    }
    else if(success == 1){
        var name1 = document.createTextNode("receiver wrong");
    }
    else if(success == 2){
        var name1 = document.createTextNode("not enough money");
    }
    else if(success == 3){
        var name1 = document.createTextNode("unknown error");
    }
    var name2 = document.createElement("font");
    name2.appendChild(name1);
    document.getElementById("transfer_result").appendChild(name2);
};

function get_history(){
    var user = document.getElementById("user_name").lastChild.lastChild.data;
    var search_url = "./php/database.php";
    var dataParam = {
        action: "query_history",
        src_user: user
    };

    history_url = "../history.html?user="+user;
    window.location.replace(history_url);

    
    $.ajax({
        type: "get",
        url: search_url,
        data: dataParam,
        dataType: 'json',
        async:false,
        contentType: 'application/json; charset=utf-8',
        success: function(data) {
            success = data
            console.log(data);
       },
        error: function(xhr, textStatus, errorThrown) {
            //alert("can not connect to the server");
            alert("进入error---");
            console.log("状态码："+xhr.status);
            console.log("状态:"+xhr.readyState);//当前状态,0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成。
            console.log("错误信息:"+xhr.statusText );
            console.log("返回响应信息："+xhr.responseText );//这里是详细的信息
            console.log("请求状态："+textStatus); 　
            console.log(xhr.statusText);
            window.location.replace("../test_fail.html");
            alert("离开error---");
            alert("离开error---");
        },
    });

    
};
