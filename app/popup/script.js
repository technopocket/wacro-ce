document.querySelector('#open_editor').onclick = function () {
    console.log('console');
    let win = window.open('./manager/index.html');
};

document.querySelector('#open_quick_mode').onclick = function () {
    window.open('./manager/index.html', 'newwindow', 'width=500,height=800,top=0,left=0');
};
