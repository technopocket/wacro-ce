- todo
    - os判定
    - 特殊DL切り分け処理

- 処理の概要
    - goto 以降の処理は次の goto 処理まで実行されます。

- actions
    - ページ遷移系:
        - goto
            - 概要：パラメータのURLに遷移します。（複数指定可能）
            - url[],
        - goto-link
            - 概要：link セレクターに設定されている url に進みます。
            - link-selector
        - add-goto
            - 概要：一つ前の goto にURLを追加します。
            - url[]
        - add-goto-link
            - 概要：link セレクターに設定されている url を一つ前の goto にURLを追加します。
            - link-selector
    - アクション系
        - set
            - 概要：対象のvalueに値を設定します。
            - selector, value
        - click
            - 概要：
            - selector, value
        - scroll
            - 概要：
            - x, y
        - wait
            - 概要：
            - mill seconds

    - 出力系
        - download
            - 概要：ファイルをダウンロードします。
            - link or img selector, +mode=1,2,3, +file_name, 
            - mode 3:リファラーを元サイトにしてDLします。
        - export
            - 概要：取得したデータがjson形式で出力されます。
            - selector, +file_name
        - export-var
            - 概要：取得したデータがjson形式で出力されます。
            - var_name, +file_name

    - 変数系:設定した値はvalue系の変数に{test}みたいな形で利用可能です。
        - var
            - 概要：変数にセレクターの値を格納します。
            - var_name, selector, +attr
        - var-add
            - 概要：変数にセレクターの値を追記します。
            - var_name, selector, +attr
        - var-value
            - 概要：変数に指定の値を格納します。
            - var_name, +value
        - var-add-value
            - 概要：変数に値を追加します。
            - var_name, value

    - 処理制御系
        - for
            - var_name, init_value, end_value, add_value
        - end-for
        - for-each
            - var_name, selector, 
        - if
            - a_value, b_param, check_type
        - if-exists
            - selector
            - セレクターが存在する場合のみ次の処理を行う。
        - end-if
        - continue
            - 現URLの処理を終了し、次のURLの処理を開始する。
        - exit
            - 概要：処理を強制終了します。

    - 変数処理
        - {$var_name}
    - tab
        - export data: 2 file
        - zip data: 2 file
        - macro progress: 8/10
        - download progress : 8/10;
    - macro editor
    - download stack

goto
    click
    page-link a
    link
        click
        export  

- 前処理文字列置き換え処理
    - .a[{var}]
        - 

- ブラウザ上でマクロ実行＆ウェブスクレイピングができるChrome拡張をつくってみた。
    - pixiv の作者の画像を一括DLしたい場合は以下のような感じのスクリプトを書けば可能
    - 需要があればリモートで実行できるサービスを作って見るかも



pixivの画像をDLするChrome拡張作ろうと思って、オリジン制約やらリファラー制約やらで色々検討した結果、別タブ開いてCanvasに描画してからDLするというよくわからん実装に収まりそう。
昔ならダウンロード属性やalt+clickイベントでできたけどセキュリティがうるさくなったのかな。そのうちこの方法も封印されそう。
