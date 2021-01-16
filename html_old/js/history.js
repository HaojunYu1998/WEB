function GetHistory(user_name) {
    var money = '';
    var search_url = "./php/database.php";
    
    var dataParam = {
        action: "query_history",
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
            console.log(data)
            state = data["state"]
            table = data["table"]
            if(state == 1){
                alert("查询不到转账信息")
                location.reload()
                return
            } else if(state == 2){
                alert("其他错误")
                location.reload()
                return
            }
            table_pos = document.getElementById(history)
            for(let row in table){
                let newTr = table_pos.insertRow(4)
                let newTd0 = newTr.insertCell(0)
                let newTd1 = newTr.insertCell(1)
                let newTd2 = newTr.insertCell(2)
                let newTd3 = newTr.insertCell(3)
                newTd0.innerHTML = row["time"]
                newTd1.innerHTML = row["src_user"]
                newTd2.innerHTML = row["dst_user"]
                newTd3.innerHTML = row["trans_money"]
            }

        },
        error: function (xhr, textStatus, errorThrown) {
            /*错误信息处理*/
            //alert("进入error---");
            //alert("状态码："+xhr.status);
            //alert("状态:"+xhr.readyState);//当前状态,0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成。
            //alert("错误信息:"+xhr.statusText );
            //alert("返回响应信息："+xhr.responseText );//这里是详细的信息
            //alert("请求状态："+textStatus); 　　　　　　　　
            alert(xhr.statusText); 　　　　　　　　
            //alert("请求失败"); 
　　　　 },
    });
    return
};


function search_myself(){
    var name= ''
    var user_name = document.getElementById("user_name"); 
    //解析url中传入的参数
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
    }
    if(name == ''){
        name = 'nobody';
    }
    document.getElementById("user_name").innerHTML = name
};
