document.querySelector('#run_console').onclick = () => {
    let action_list = [];
    action_list.push({
        type:'goto',
        params:{
            url_list: ["http://localhost:8888/main/"]
        }
    });
    action_list.push({
        type:'goto-link',
        params: {
            selector: 'a'
        }
    });
    action_list.push({
        type:'download',
        params:{
            selector: 'img'
        }
    });
    action_list.push({
        type:'export',
        params:{
            selector: 'div'
        }
    });
    let wacro = new Wacro();
    console.log(wacro);
    wacro.execute(action_list, function() {
        console.log(wacro.export_list);
    }, console.log);
};


document.querySelector('#run_pixiv').onclick = () => {
    let action_list = [];
    action_list.push({
        type:'goto',
        params:{
            url_list: ["https://www.pixiv.net/users/36612463/illustrations"]
        }
    });
    action_list.push({
        type:'goto-link',
        params: {
            selector: '.iasfms-4'
        }
    });
    action_list.push({
        type:'click',
        params: {
            selector: '.emr523-1'
        }
    });
    action_list.push({
        type:'wait',
        params: {
            time: '200'
        }
    });
    action_list.push({
        type:'download',
        params: {
            selector: '.sc-1qpw8k9-1'
        }
    });
    let wacro = new Wacro();
    console.log(wacro);
    wacro.execute(action_list, function() {
        console.log(wacro.export_list);
    }, console.log);
};


document.querySelector('#run_fortest').onclick = () => {
    let action_list = [];
    action_list.push({
        type:'goto',
        params:{
            url_list: ["http://localhost:8888/main/fortest.html"]
        }
    });
    action_list.push({
        type:'for',
        params: {
            var_name: 'i',
            init_value: 1,
            end_value: 10,
            add_value: 1,
        }
    });
    
    action_list.push({
        type: 'if-exists',
        params: {
            selector: ".open_js_area2:nth-of-type({i})"
        }
    });
    
    action_list.push({
        type:'click',
        params:{
            selector: '.open_js_area2:nth-of-type({i})'
        }
    });
    
    action_list.push({
        type: 'end-if',
        params: {}
    });
    
    action_list.push({
        type:'wait',
        params: {
            time: '1000'
        }
    });
    action_list.push({
        type:'end-for',
        params:{
        }
    });
    let wacro = new Wacro();
    console.log(wacro);
    wacro.execute(action_list, function() {
        console.log(wacro.export_list);
    }, console.log);
};

