操作手册为独立静态 HTML，随 qybrowser-web 的 Cloudflare 静态站点发布，无须编译。

正式地址：https://qybrowser.com/customer/help/ 。客户端可用 QIYUAN_MANUAL_URL 覆盖。
发布整个站点根目录，保留根目录的 _redirects 和 customer/help 下的 HTML、CSS、images 中 7 张图片。
旧 /customer/ 路径与无末尾斜线的 /customer/help 会跳转到 /customer/help/。

usefullc.com 当前由另一台 Nginx 提供服务，其 /customer/help 返回 404；仅发布 Cloudflare 站点不会改变该 Nginx 配置。
若保留 usefullc.com 入口，在该域名对应的 Nginx server 中添加以下规则，nginx -t 成功后 reload：

    location = /customer { return 302 https://qybrowser.com/customer/help/; }
    location = /customer/ { return 302 https://qybrowser.com/customer/help/; }
    location = /customer/help { return 302 https://qybrowser.com/customer/help/; }
    location ^~ /customer/help/ { return 302 https://qybrowser.com$request_uri; }

图片使用隔离模拟数据，不含客户个人资料。发布后检查页面、CSS、7 张图片和旧路径跳转。
