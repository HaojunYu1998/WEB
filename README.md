# 计算机网络与WEB技术 实验设计

Web网站的设计实现与攻击:任务分为两部分，同组部分同学设计并创建一个Web网站，可静态和动态发布相应信息；同组其他同学对Web网页进行攻击并篡改相应内容；


## 实验目的

搭建一个“银行网站”，支持注册账号，登录账号，查询与修改账号信息查询余额，转账，查询交易历史记录功能。支持静态发布信息，如发布当期利率与通知；支持动态发布信息，如转账。搭建的网站具有一定的并发性，增删查改操作每一步都应该是线程安全的。

作为攻击方：实现DoS攻击、SQL注入攻击、XSS攻击，并根据防守方对网站的更新，优化攻击方式。

作为防守方：根据攻击者攻击方式，更新网站抵御一定程度的DoS攻击、SQL注入攻击、XSS攻击。

可选：使用机器学习识别恶意URL来增强防御

## 实验内容

暂定分为三轮迭代，每次迭代对应一种攻击，即：无防御->受到攻击->防御攻击
其中的攻击形式从上面所列举的攻击形式中选取

### 系统架构设计：
前端：自主设计搭建（HTML+CSS）
后端：采用php(线程安全版本) + apache + mysql

建站分为两个部分：关于账号的操作与关于余额的操作

### 账号部分：

● 数据库中有一个初始的超管账号，可以查询任意账号的信息，无法转账

● 前端传入用户信息如身份证号、姓名、手机号等，在数据库中建立一个普通账号，初始余额为0，返回一个银行卡号至前端

● 某一个用户在登录后可以查询与修改自己的账号信息，也可以销户从数据库中删除该账号


### 余额部分：

● 用户在登录后可以进行余额查询，返回余额数值即可

● 用户在登录后可以进行转账，修改自己的余额与目标账户余额即可，若余额不足或目标账户不存在返回错误提示


### 攻击方式：

● 跨站脚本攻击(XSS): 攻击者在web页面中插入恶意的script代码。当用户浏览该页面的时候，嵌入到web页面中的script代码会执行，达到恶意攻击用户的目的

● SQL注入：攻击者通过更改网址参数，从而更改数据库查询代码，根据返回的结果，获得想得知的数据

● DDos攻击：使用多台机器（组员的电脑）对服务器同时发出大量请求，从而导致服务器不能及时提供服务甚至瘫痪


程序预计进度：

● 基本网站架构：10.31-11.20

● 多种攻击实现：11.20-1.20

● 网站防护升级：11.20-1.20

● 附加：恶意Url智能识别分析：1.1-1.20


人员分工：

● 基本网站架构：

	○ 前端：张哲瑞

	○ 后端：周一川 俞昊君

● 多种攻击实现：俞昊君  赵云飞

● 网站防护升级：张哲瑞 周一川 肖纪帆

● 附加：恶意Url智能识别分析：赵云飞 肖纪帆

# 网页设计
## 前端GUI
### 登录页面

<div align=center>
	<img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/login1.png"  height = "400"/>
</div>


登录操作：输入USER和PASSWORD，点击LOGIN验证登录
注册操作：点击下方Click Here按钮，填写弹出框内容，点击注册（如下图）

<div align=center>
	<img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/login2.png"  height = "400"/>
</div>

### 个人主页

<div align=center>
	<img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/personal1.png" height = "400"/>
</div>


图例以qikahh身份登录，显示用户名及拥有钱数

转账操作：输入接收对象和转账量，点击转账按钮，弹框显示转账结果


<div align=center>
	<img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/trans.png" height = "400"/>
</div>


查看历史：点击历史按钮，显示用户近期转入转出记录

<div align=center>
	<img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/history.png" height = "400"/>
</div>


## 后端接口
交互字段：
```
$_GET = [
            'action' => 'register',
            'user' => 'hahaha',
            'password' => '666',
            'email' => 'hahaha@pku.edu.cn',
    ];
```


action用来决定调用register、login、query_amount中的哪一个函数

register接收’user’,’password’,’email’字段，返回值为
```
$result = [
        'user' => $same_user_num == 0, 
        'email' => $same_email_num == 0
    ];
```
返回值中user若为true表示该用户名可以用来注册，email若为true表示该邮箱可以用来注册

login接收‘user’,’password’字段，返回值为
`$ret = ['success' => True];`
返回值中success若为true表示登陆成功

query_amount接收’user’字段，返回值为
```
if (mysqli_num_rows($res) == 1) {
    $row = mysqli_fetch_assoc($res);
    $result = ['success' => True, 'amount' => $row["amount"]];
} else {
    $result = ['success' => False, 'amount' => -1];
    }
```
若查询成功，返回值中success为true，amount为钱数
***注意***
需要限制query_amount只有在确认用户登录后才能调用（使用cookie？）

query_history接收’user’字段，返回值为
`$result = ['state' => '0', 'table' => $table];`
state为1时表示暂时没有记录，为0表示返回正常，表table中包括‘time’,’src_user’,’dst_user’,’trans_money’,’curr_money’字段，为2表示出现异常错误

transfer接收’src_user’,’dst_user’,‘amount’字段
返回0时表示正常转账，返回1时表示转账目标非法，返回2时表示余额不足以转账，返回3时表示出现异常错误

# 攻击设计
## sql注入的攻击方式
1、 在登陆时对于输入的用户名$user和密码$password，服务器会组织成：
  ` "SELECT * FROM Guests WHERE user='$user' AND password='$password'"   `  
那么在$user里添加SQL注释符'#'就可以将AND及之后的password判断屏蔽掉，让数据库直接返回用户名相同即可的用户条目：
如对于用户qikahh，密码为666，正常登录过程如下：

<div align=center>
	<img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/sql1.png" height = "400" /> <img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/sql2.png" height = "400" />
</div>



而攻击者可以通过输入"qikahh'#"，在密码未知时登录到qikahh：

<div align=center>
	<img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/sql3.png" height = "400" /> <img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/sql4.png" height = "400" />
</div>



实现了用SQL攻击登录他人账号

2、 在正常登录之后，服务器对于其后的命令都默认合法，不会再次验证用户身份，这就引入了可以通过更改url参数，从而登录他人账号的漏洞：
当使用qikahh的身份登录后，主页如下

<div align=center>
	<img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/url1.png" height = "400" /> 
</div>

可以看到url中通过参数保存了登录信息。那么假如修改name为他人账号，如superman:

url：http://152.136.160.109:8099/bankpage.html?name=superman&money=349600
页面显示将如下：

<div align=center>
	<img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/url2.png" height = "400" /> 
</div>


但这只是浏览器根据url参数生成的虚假界面，只是修改了显示的用户名，而并未真正获取到superman的信息。但此时就可以利用刷新按钮，无需验证获取他人信息：

刷新后个人信息泄露

<div align=center>
	<img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/url3.png" height = "400" /> 
</div>


## sql注入的防御方式
1. 用hash函数将所有用户名和密码都变成密文；但是如果攻击者知道hash函数，还是有可能设计对应的攻击
```
$user = $_GET['user'];
$email = hash("crc32", $_GET['email']);
$password = hash("sha256", $_GET['password']);
```
2. 使用sql参数化查询；无论用户名是什么都会被sql识别为变量而不是语句，所以sql攻击完全无法实现
使用时将SQL查询中所有待填参数用括号约束
$user_sql = "SELECT user FROM Guests WHERE (user=?) AND (password=?)";
并将用户输入参数依次填入
```
if ($stmt = mysqli_prepare($conn, $user_sql)) {
$stmt->bind_param("ss",$user,$password);
$stmt->execute();
$stmt->bind_result($user_list);
$success_login = mysqli_stmt_fetch($stmt);
$stmt->close();
    }
```
防御后无法通过#忽略参数：

<div align=center>
	<img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/sql_defend1.png" height = "400" /> 
</div>

防御对直接替换SQL参数的攻击，在每次刷新页面时将SQL输入参数用登录时保存的cookie值覆盖，以用户名为例
`user_name = getCookie("user");`
刷新后的结果只会显示登录用户信息

<div align=center>
	<img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/sql_defend2.png" height = "400" /> <img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/sql_defend3.png" height = "400" /> 
</div>


## XSS的攻击方式
跨站脚本需要嵌入在html页面显示区域中才会被触发，而设计的转账网站只有用户名信息是用户自由输入并嵌入在显示区域的。因此设计用户名为一段html内嵌script代码，用以触发alert功能，获取用户信息。

存储型XSS脚本需要嵌入在html页面显示区域中才会被触发，而设计的转账网站只有用户名信息是用户自由输入并嵌入在显示区域的。因此设计用户名为一段html内嵌script代码，用以触发alert功能，获取用户信息。
简化实验目标为：在被攻击方登录下，通过诱导其向攻击方转账，弹框显示被攻击方cookie信息。即希望触发的js代码为：
`alert(document.cookie);`
设计攻击方对应用户名为：
`getcookie<script>alert(document.cookie);</script>`
利用qikahh账号转账时就会暴露用户名和密码：

<div align=center>
	<img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/xss1.png" height = "400" /> <img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/xss2.png" height = "400" /> 
</div>

## XSS的防御方式
html中可以通过转义字符破环脚本的可执行性
```
function escapeHTML(str) {
     return str.replace(/[&<>'"]/g, tag =>({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
            }[tag] || tag)
    );}
```

将数据库提取的用户名先通过escapeHTML函数转换，转账结果可以正常显示

<div align=center>
	<img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/xss3.png" height = "400" /> 
</div>

# 恶意URL识别
正如前文所提到，用户可以通过SQL或者XSS的方式对网站进行攻击，所以针对于此，我们希望对URL进行识别，传统的机器学习方法包括SVM、决策树、逻辑回归等，在这里，我们使用深度学习模型：长短时记忆循环神经网络（LSTM），对URL进行分类，隔离掉“坏”的URL，使得我们的网站更安全。
我们寻找了关于good queries与bad queries的数据集，其中好的查询有10万，坏的有5万，过滤掉长度不在[7, 150]之中的数据，最终训练数据共114646条，验证集与训练集各14331条。
经过10个epoch的训练，他在验证集上的准确率达到了77.56%，且最终测试集的准确率也在78%左右，我们认为能够对防止网站被攻击提供一定的支持。

<div align=center>
	<img src="https://github.com/HaojunYuPKU/WEB/blob/main/images/dl.png" height = "400" /> 
</div>

为方便用户了解我们工作的数据，下面选取了我们所用数据集中的部分正常url和恶意url：

正常url：
```
/includes/functions_kb.php?phpbb_root_path=http://cirt.net/rfiinc.txt?
/javascript/usr.ep
/page-13/
/comxast/
/dj mortis - stringent bass/
/javascript/children.war
...
```
恶意url：
```
+echo+db+4d+5a+50+00+02+00+00+00+04+00+0f+00+ff+ff+00+00+b8+00+00+00+00+00+00+00+40++>>esbq
/cgi-bin/index.php?op=default&date=200607' union select 1,501184215,1,1,1,1,1,1,1,1--&blogid=1
/debug/showproc?proc===<script>alert('vulnerable');</script>
/<script>document.cookie="testnvxc=4301;"</script>
/cacti/base_local_rules.php?dir=<script>alert('base_local_rules_xss.nasl-1331905098')</script>
...
```
可以看到bad url集合中包含了XSS和SQL的注入攻击





