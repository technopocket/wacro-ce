class Wacro {
    static ACTIONS = {
        goto: {
            url: {}
        },
    }

    static CONFIG = {
        PROCESS_WINDOW_WIDTH:600,
        PROCESS_WINDOW_HEIGHT:400,
        IS_SHOW_PROCESS_WINDOW: true,
    }

    static REMOTE_METHODS = {
        EXECUTE_ACTION: 'executeAction',
        GET_REMAINING_PROCESS_LIST: 'getRemainingProcess',
        DOWNLOAD_FILE: 'downloadFile',
    }

    static isChromeExtension() {
        return (typeof chrome !== "undefined" && typeof chrome.extension !== "undefined");
    }

    static replaceStr(str, params) {
        let text = str;
        if (typeof(text) == 'string') {
            let match_str_list = text.match(/{\w*}/g);
            if (match_str_list) {
                for (let match_str of match_str_list) {
                    let match_info = match_str.match(/\w+/);
                    let key = match_info[0];
                    text = text.replaceAll("{"+key+"}", params[key]);
                }        
            }
        }
        return text;
    }

    // domObjに対して、selector array を実行
    static getValueList(url, element, selector, attr, is_null_skip = false) {
        let value_list = [];
        if (url && element && find) {
            let find_element_list = element.querySelectorAll(selector);
            for (let find_element of find_element_list) {
                let tmp = Wacro.getValue(url, find_element, attr);
                if (!is_null_skip || tmp) {
                    value_list.push(tmp);
                }
            }
        }
        return value_list;
    };

    static getValue(url, find_element, attr) {
        let value = null;
        if (attr == 'file-link') {
            if (find_element.tagName == 'IMG') {
                attr = 'src';
            } else {
                attr = 'href';
            }
            console.log(attr);
        }
        if (!attr || attr === '' || attr == 'html' || attr == 'outerHTML') {
            value = find_element.outerHTML;
        } else if (attr === 'innerHTML') {
            value = find_element.innerHTML;
        } else if (attr === 'text') {
            value = find_element.textContent;
        } else {
            value = find_element.getAttribute(attr);
            if (attr === 'href' || attr === 'src' || attr === 'link') {
                value = Wacro.convertAbsUrl(url, value);
            }
        }
        return value;
    }

    static url2UrlInfo(url) {
        const matchedList = url.match(/^(?:[^:\/?#]+:)?(?:\/\/[^\/?#]*)?(?:([^?#]*\/)([^\/?#]*))?(\?[^#]*)?(?:#.*)?$/) ?? [];
        let [, dir, file_name_ext, query_string] = matchedList.map(match => match ?? '');
        query_string = query_string ? query_string.slice(1) : "";
        //
        let query = {};
        if (query_string) {
            query_string.split('&').forEach((get_string) => {
                var get_list = get_string.split('=');
                query[get_list[0]] = get_list[1];
            });
        }
        //
        const matchedExt = file_name_ext.match(/^(.+?)(\.[^.]+)?$/) ?? [];
        let [, file_name, file_ext] = matchedExt.map(match => match ?? '');
        file_ext = file_ext ? file_ext.split(".").join("") : file_ext;
        //
        return {url, dir, file_name, file_ext, query, query_string};
    }

    //ベースURLと相対パスから絶対パスを取得できます。
    static convertAbsUrl(base_url, path) {
        if (!path) {
            return null;
        }
        if (path.substr(0, 4) === 'http') {
            return path;
        }
        let base_url_array = base_url.split('://');
        let base_url_scheme = base_url_array[0];
        let base_url_path_array = base_url_array[1].split('/');
        let absolute_url;
        base_url_path_array.pop();
        if (path.substr(0, 2) === '//') {
            absolute_url = base_url_scheme + ':' + path;
        } else if (path.charAt(0) === '/') { //root
            absolute_url = base_url_scheme + '://' + base_url_path_array[0] + path;
        } else if (path.substr(0, 2) === './') { //
            path = path.replace('./', '');
            absolute_url = base_url_scheme + '://' + base_url_path_array.join('/') + '/' + path;
        } else if (path.substr(0, 3) === '../') { //
            let i = 0;
            while (path.substr(i * 3, 3) === '../') {
                base_url_path_array.pop();
                i += 1;
            }
            absolute_url = base_url_scheme + '://' + base_url_path_array.join('/') + '/' + path.substr(i * 3);
        } else { //
            absolute_url = base_url_scheme + '://' + base_url_path_array.join('/') + '/' + path;
        }
        return absolute_url;
    };

    static async sleep(time) {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                resolve(true);
            }, time);
        });
    }

    static DOWNLOAD_CHECK_INTERVAL_TIME = 100;
    /**
     * ダウンロード処理 await を利用しない場合　ダウンロードの完了を待たず次の処理に進みます。
     * @param {*} url 
     */
    static async downloadForCE(url, file_name = null) {
        async function check(downloadId) {
            return new Promise((resolve, reject) => {
                chrome.downloads.search({id:downloadId}, (downloadItemList) => {
                    resolve(downloadItemList[0]);
                });
            });
        }
        return new Promise(async (resolve, reject) => {
            chrome.downloads.download({
                url:url,
                filename: file_name,
            }, async (downloadId) => {
                let tryCount = 0;
                let isComplete = false;
                let downloadItem = null;
                for (;!isComplete && tryCount < 10;) {
                    await this.sleep(Wacro.DOWNLOAD_CHECK_INTERVAL_TIME);
                    downloadItem = await check(downloadId);
                    tryCount++;
                    isComplete = downloadItem && (downloadItem.state == chrome.downloads.State.COMPLETE || downloadItem.state == chrome.downloads.State.INTERRUPTED);
                }
                console.log(downloadItem);
                resolve(downloadItem && downloadItem.state == chrome.downloads.State.COMPLETE);
            });
        });
    }

    /**
     * alt + click で DLさせるパターン　参照元と参照先のドメインが違うと動作しない。
     * @param {*} url 
     * @param {*} filename 
     */
    static download2(url, filename = null) {
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.download = url;
        a.href = url;
        console.log(a);
        a.click();
        a.remove();
        return true;
    }
    
    /**
     * blobデータをDLしてダウンロードさせるパターン
     * @param {*} url 
     * @param {*} file_name 
     */
    static async downloadForBlob(url, file_name = null, callback=null) {
        if (file_name == null) {
            let urlInfo = Wacro.url2UrlInfo(url);
            file_name = urlInfo.file_name + '.' + urlInfo.file_ext;
        }
        let res = await fetch(url);
        let blob = await res.blob();
        var blob_url = URL.createObjectURL(blob);
        console.log(blob_url);
        
        await Wacro.sendMessageToBackgroundPage({
            method:Wacro.REMOTE_METHODS.DOWNLOAD_FILE,
            params: {url:blob_url, file_name:file_name},
        });
        await this.sleep(200)
        callback();
    }

    // chrome function
    static async createChromeTab() {
        return new Promise((resolve, reject) => {
            chrome.windows.create({
                type: 'popup',
                width: Wacro.CONFIG.PROCESS_WINDOW_WIDTH,
                height: Wacro.CONFIG.PROCESS_WINDOW_HEIGHT,
                top: 0,
                left: 500,
            }, function (windowInfo) {
                chrome.tabs.create({
                    windowId: windowInfo.id,
                    active: true
                }, function (info) {
                    console.log(info);
                    resolve(info);
                });
            });
        });
    };

    static async getChromeTabInfo(tab_id) {
        return new Promise((resolve, reject) => {
            try {
                chrome.tabs.get(tab_id, resolve);
            } catch (e) {
                resolve(null);
            }
        });
    };

    static async sendMessageToChromePage(chrome_tab_id, message) {
        console.log('send main:', chrome_tab_id, message);
        return new Promise((resolve, reject) => {
            console.log(message);
            chrome.tabs.sendMessage(chrome_tab_id, message, resolve);
        });
    };

    static async sendMessageToBackgroundPage(message) {
        return new Promise((resolve, reject) => {
            console.log(message);
            chrome.runtime.sendMessage(message, resolve);
        });
    }

    static async getCompleteChromePageInfo(chrome_tab_id, url) {
        return new Promise((resolve, reject) => {
            try {
                chrome.tabs.update(chrome_tab_id, { url: url }, async function (res) {
                    let tab_info = null;
                    //ロードがん完了するまで待機
                    let is_set_window_size = false;
                    for (; ;) {
                        tab_info = await Wacro.getChromeTabInfo(chrome_tab_id);
                        if (!is_set_window_size) {
                            is_set_window_size = true;
                            chrome.windows.update(tab_info.windowId, {
                            });
                        }
                        //console.log(tab_info, tab_info.status);
                        if (tab_info.status == "complete") break;
                        await Wacro.sleep(100);
                    }
                    chrome.windows.update(tab_info.windowId, {
                    });
                    await Wacro.sleep(100);
                    resolve(tab_info);
                });
            } catch (e) {
                console.log(e);
                resolve(null);
            }
        });
    }

    static replaceVarValue(value) {
        return value;
    }

    // process function
    constructor() {
        console.log("constructor");
        this.recursive = function() {
            // chrome.runtime.sendMessage
        }
    }

    async execute(action_list, success, error, progress = () => { }) {
        if (!Wacro.isChromeExtension()) {
            console.log('this plugin can execute on chrome extension only.');
            return false;
        }
        this.success = success;
        this.error = error;
        this.progress = progress        
        this.chrome_tab = null;
        
        this.export_list = [];
        this.var_hash = {};

        this.action_list = action_list;
        this.action_number = 0;

        this.download_list = [];
        this.download_number = -1;

        // 最初のgotoまでaction_numberを進める。
        let url_list = [];
        for (let action of this.action_list) {
            if (action.type == "goto") {
                url_list = action.params.url_list;
                break;
            }
            this.action_number++;
        }
        this.action_number++;
        await this.recursiveExecuteActionList(url_list, 0);
        success();
    }

    // すべての処理が完了してるかチェックするフラグ
    static remaining_process_list = [];
    static process_id = 0;
    //contentscriptのみ実行
    static executeActionForBrowser(action) {
        let result = {};
        if (action.type == "wait") {
            //non cosole
            //sawait Wacro.sleep(action.params.time);
        } else if (action.type == "goto") {
            //todo:url加工
            result.url_list = action.url_list;
        } else if (action.type == "click") {
            let dom_list = document.querySelectorAll(action.params.selector);
            for (let dom of dom_list) {
                dom.click();
            }
            result = true;
        } else if (action.type == "goto-link") {
            result.url_list = Wacro.getValueList(location.href, document, action.params.selector, 'href');
        } else if (action.type == "if-exists") {
            result.value_list = Wacro.getValueList(location.href, document, action.params.selector, action.params.attr, true);
        } else if (action.type == "export") {
            result.value_list = Wacro.getValueList(location.href, document, action.params.selector, action.params.attr);
        } else if (action.type == "download") {
            result.url_list = Wacro.getValueList(location.href, document, action.params.selector, action.params.attr);
            for (let url of result.url_list) {                ;
                Wacro.remaining_process_list.push(Wacro.process_id++);
                Wacro.downloadForBlob(url, null, () => {
                    Wacro.remaining_process_list.pop();
                });
            }
        }
        return result;
    }

    static isStartActionType(type) {
        return type == 'if' || type == 'for';
    }

    static isEndActionType(type) {
        return type == 'end-if' || type == 'end-for';
    }

    async recursiveExecuteActionList(url_list, level) {
        let next_url_list = [];
        let for_data_list = [];
        let if_data_list = [];
        let start_action_number = this.action_number;
        let is_skip = false;
        for (let url of url_list) {
            if (!this.chrome_tab) {
                this.chrome_tab = await Wacro.createChromeTab();
            }
            this.chrome_tab = await Wacro.getCompleteChromePageInfo(this.chrome_tab.id, url);
            for (this.action_number = start_action_number; this.action_number < this.action_list.length; this.action_number++) {
                //todo
                await Wacro.sleep(1000);
                //deep copyする
                let action = JSON.parse(JSON.stringify(this.action_list[this.action_number]));
                let params = action.params;

                // skip処理
                if (is_skip) {
                    let start_action_count = 0;
                    for (;this.action_number < this.action_list.length;) {
                        console.log(this.action_number);
                        if (Wacro.isStartActionType(action.type)) {
                            start_action_count++;
                        } 
                        if (Wacro.isEndActionType(action.type)) {
                            if (start_action_count <= 0) {
                                is_skip = false;
                                break;
                            } else {
                                start_action_count--;
                            }
                        } 
                        this.action_number++;
                        action = JSON.parse(JSON.stringify(this.action_list[this.action_number]));
                        params = action.params;
                    }
                }

                console.log("前処理",action);
                if (params) {
                    //変数置換処理
                    for (let key in params) {
                        params[key] = Wacro.replaceStr(params[key], this.var_hash);
                        if (!isNaN(params[key])) {
                            params[key] = parseFloat(params[key]);
                        }
                    }
                }
                //todo:method化する
                let result = await Wacro.sendMessageToChromePage(this.chrome_tab.id, {
                    method: Wacro.REMOTE_METHODS.EXECUTE_ACTION,
                    action,
                });
                console.log("後処理",result);
                if (action.type == "wait") {
                    await Wacro.sleep(params.time);
                } else if (action.type == "alert") {
                    alert(params.text);
                } else if (action.type == "page-link") {
                    //@note：ループ途中で加算して大丈夫か未確認
                    Array.prototype.push.apply(url_list, result.url_list);
                    break;
                } else if (action.type == "goto" || action.type == "goto-link") {
                    Array.prototype.push.apply(next_url_list, result.url_list);
                    break;
                } else if (action.type == "if") {
                    console.log("if-start");
                    params['action_number'] = this.action_number;
                    if_data_list.push(params);
                    let check_type = params['check_type'];
                    let a_val = params['a_value'];
                    let b_val = params['b_value'];
                    if (check_type == 1 && a_val == b_val) {
                        is_skip = true;
                    } else if (check_type == 2 && a_val != b_val) {
                        is_skip = true;
                    } else if (check_type == 3 && a_val <= b_val) {
                        is_skip = true;
                    } else if (check_type == 4 && a_val < b_val) {
                        is_skip = true;
                    }
                } else if (action.type == "if-exists") {
                    console.log("if-exists");
                    params['action_number'] = this.action_number;
                    if_data_list.push(params);
                    if (result.value_list.length <= 0) {
                        is_skip = true;
                        console.log("SKIP!!!!!!!");
                    }
                } else if (action.type == "end-if") {
                    console.log("end-if");
                    if_data_list.pop();
                } else if (action.type == "for") {
                    console.log("for-start");
                    params['action_number'] = this.action_number;
                    this.var_hash[params['var_name']] = params['init_value'];
                    for_data_list.push(params);
                    if (params['end_value'] < this.var_hash[params['var_name']]) {
                        is_skip = true;
                    }
                } else if (action.type == "end-for") {
                    let for_data = for_data_list[for_data_list.length-1];
                    console.log(for_data, this.var_hash);
                    if (for_data['end_value'] <= this.var_hash[for_data['var_name']]) {
                        for_data_list.pop();
                        console.log("for-end");
                    } else {
                        console.log("for-return");
                        this.var_hash[for_data['var_name']] += for_data["add_value"];
                        this.action_number = for_data['action_number'];
                    }
                } else if (action.type == "download") {
                    //
                    /*
                    console.log(result);
                    for (let url of result.url_list) {
                        console.log(url);
                        await Wacro.downloadForCE(url);
                    }
                    */
                } else if (action.type == "export") {
                    Array.prototype.push.apply(this.export_list, result.value_list);
                }
            }
            //ページ内の全てのプロセスが終了しているか。
            for (;;) {
                let result2 = await Wacro.sendMessageToChromePage(this.chrome_tab.id, {
                    method: Wacro.REMOTE_METHODS.GET_REMAINING_PROCESS_LIST,
                });
                console.log(result2);
                if (result2.remaining_process_list.length <= 0) {
                    break;
                }
                Wacro.sleep(1000);
            }
        }
        if (next_url_list.length > 0) {
            level++;
            this.action_number++;
            await this.recursiveExecuteActionList(next_url_list, level);
        }
        //クローズする
        chrome.tabs.remove(this.chrome_tab.id);
        return true;
    }

    kill() {

    }
}
console.log(chrome);
console.log(Wacro.isChromeExtension());

if (Wacro.isChromeExtension()) {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log(request);
        if (request.method == Wacro.REMOTE_METHODS.EXECUTE_ACTION) {
            sendResponse(Wacro.executeActionForBrowser(request.action));
        } else if (request.method == Wacro.REMOTE_METHODS.GET_REMAINING_PROCESS_LIST) {
            sendResponse({remaining_process_list:Wacro.remaining_process_list});
        } else if (request.method == Wacro.REMOTE_METHODS.DOWNLOAD_FILE) {
            Wacro.downloadForCE(request.params.url, request.params.file_name);
            sendResponse({});
        }
    });
}