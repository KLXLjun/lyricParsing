# lyricParsing

解析歌词
使用canvas显示lrc歌词

支持卡拉ok式(酷狗那种的lrc)歌词读取与显示

> 如果有什么疑问请开issues
>
> 我的代码可能有些不规范XD

---
## 演示
[演示地址](https://klxljun.github.io/lyricParsing/index.html)
[博客链接](https://huyaoi.moe/2020/lyricparsing.html)
---
## 参数
```javascript
var lrPar = new lyricParsing({
    //音频标签
    audio:document.getElementById("audios"),
    //画布标签
    canvas:document.getElementById('canvas'),
    //音频链接
    audiourl:"music/lty_qcj.m4a",
    //歌词全局偏移值
    offset:60,
    //调试模式
    debug:false,
    //画布刷新时间(毫秒)
    reftime:7,
    //渲染字体
    rander_font:"32px Microsoft YaHei"
});
```
----
## 使用方法

先new一个
```javascript
var lrPar = new lyricParsing({
    //音频标签
    audio:document.getElementById("audios"),
    //画布标签
    canvas:document.getElementById('canvas'),
    //音频链接
    audiourl:"在这填入音频链接",
    //歌词全局偏移值
    offset:60,
    //调试模式
    debug:false,
    //画布刷新时间(毫秒)
    reftime:7,
    //渲染字体
    rander_font:"32px Microsoft YaHei"
});
```

然后初始化
```javascript
lrPar.init(歌词字符串变量)
```

就能使用了

其他的请看index.html文件