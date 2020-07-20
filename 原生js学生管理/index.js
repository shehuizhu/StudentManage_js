var menuList = document.getElementsByClassName('menu')[0]
var tBody = document.getElementsByTagName('tbody')[0];
var tableData = [];
var editForm = document.getElementById('edit');
var stuEditSubmit = document.getElementById('edit_sumbit');
var stuAdd = document.getElementById('stuAdd');
var edit_modal = document.getElementsByClassName('edit_modal')[0];
var allPage = 1;
var nextPage = document.getElementById('nextPage');
var prePage = document.getElementById('prePage');
var nowPage = 1;
var pageSize = 5;

function bindEvent() {
    // 切换侧边栏选项
    getTableTime();
    menuList.addEventListener('click', function(e) {
            if (e.target.nodeName == 'DD') {
                changeStyle(e.target);
                var id = e.target.getAttribute('data-id');
                var showContent = document.getElementById(id);
                changeStyle(showContent);
            }
        })
        //添加学生个人数据
    var submit = document.getElementById('submit');
    submit.onclick = function(e) {
        e.preventDefault();
        var formData = getFormData(stuAdd);
        transformData('/api/student/addStudent', formData, function(data) {
            // 保存成功  弹出弹框 充值表单 进行跳转
            var reset = document.getElementById('reset');
            reset.click();
            // renderDat();
            getTableTime();
            var studentListDom = document.getElementsByTagName('dd')[0];

            studentListDom.click();
        })

    }

    var edit = document.getElementsByClassName('edit')[0];

    tBody.onclick = function(e) {
        // console.log(e.target)  判断当前点击的按钮是不是编辑按钮
        if (e.target.classList.contains('edit')) {
            edit_modal.style.display = 'block';
            var index = e.target.dataset.index;
            // 将学生数据回填到编辑表单当中
            renderForm(tableData[index]);

        } else if (e.target.classList.contains('del')) { // 判断当前电机的按钮是删除按钮
            var isDel = confirm('确认删除？');
            if (isDel) {
                var index = e.target.dataset.index;
                transformData('/api/student/delBySno', {
                    sNo: tableData[index].sNo
                }, function() {
                    alert('删除成功');
                    getTableTime()
                })
            }
        }
    }

    stuEditSubmit.onclick = function(e) {
        e.preventDefault();
        var data = getFormData(editForm);
        if (data) {
            transformData('/api/student/updateStudent', data, function(data) {

                alert('修改成功');
                getTableTime();
                edit_modal.style.display = 'none';
            });
        }
        return false;
    }
    edit_modal.onclick = function(e) {
        if (e.target == this) {
            edit_modal.style.display = 'none';
        }
    }
    nextPage.onclick = function() {
        nowPage++;
        getTableTime();
    }

    prePage.onclick = function() {
        nowPage--;
        getTableTime();

    }
}
bindEvent();

//编辑表单后获取数据
function renderForm(data) {
    for (var prop in data) {
        if (editForm[prop]) {
            editForm[prop].value = data[prop]
        }
    }
}

// 按照页获取数据
function getTableTime() {
    var param = {
        page: nowPage,
        size: pageSize
    }
    transformData('/api/student/findByPage', param, function(data) {
        var findByPageData = data.data.findByPage;
        allPage = Math.ceil(data.data.cont / pageSize);
        tableData = findByPageData;
        renderData(findByPageData);

    })
}
// 渲染数据
function renderData(data) {
    var str = '';

    data.forEach(function(item, index) {
        str += `<tr>
        <td>${item.sNo}</td>
        <td>${item.name}</td>
        <td>${item.sex == 0 ? '男' : '女'}</td>
        <td>${item.email}</td>
        <td>${(new Date().getFullYear() - item.birth)}</td>
        <td>${item.phone}</td>
        <td>${item.address}</td>
        <td>
            <button class="edit btn" data-index=${index}>编辑</button>
            <button class="del btn" data-index=${index}>删除</button>
        </td>
    </tr>`
    });
    tBody.innerHTML = str;
    if (allPage > nowPage) {
        nextPage.style.display = 'inline-block';
    } else {
        nextPage.style.display = 'none';

    }
    if (nowPage > 1) {
        prePage.style.display = 'inline-block';
    } else {
        prePage.style.display = 'none';

    }
}

// 获得表单数据
function getFormData(form) {
    var sNo = form.sNo.value;
    var name = form.name.value
    var sex = form.sex.value;
    var birth = form.birth.value;
    var phone = form.phone.value;
    var address = form.address.value;
    var email = form.email.value;
    if (!sNo || !name || !sex || !birth || !phone || !phone || !address || !email) {
        alert('请输入完整的数据');
    }
    return {
        sNo: sNo,
        name: name,
        sex: sex,
        birth: birth,
        phone: phone,
        address: address,
        email: email
    }
}
// 传输数据
function transformData(url, data, callback) {
    data.appkey = 'pengjia_1587133068024';

    var result = saveData("http://open.duyiedu.com" + url, data);
    if (result.status == 'success') {
        callback(result)
    } else {
        alert(result.msg);
    }
}
// 改变toggle选项
function changeStyle(node) {
    var result = getSibling(node);
    for (var i = 0; i < result.length; i++) {
        result[i].classList.remove('active');
    }
    node.classList.add('active');
}
// 得到兄弟元素
function getSibling(node) {
    var nodeParent = node.parentElement;
    var childNodes = nodeParent.children;
    var result = [];
    for (var i = 0; i < childNodes.length; i++) {
        if (childNodes[i] != node) {
            result.push(childNodes[i]);
        }
    }
    return result;
}
// 发送http请求
function saveData(url, param) {
    var result = null;
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    if (typeof param == 'string') {
        xhr.open('GET', url + '?' + param, false);
    } else if (typeof param == 'object') {
        var str = "";
        for (var prop in param) {
            str += prop + '=' + param[prop] + '&';
        }
        xhr.open('GET', url + '?' + str, false);
    } else {
        xhr.open('GET', url + '?' + param.toString(), false);
    }
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                result = JSON.parse(xhr.responseText);
            }
        }
    }
    xhr.send();
    return result;
}