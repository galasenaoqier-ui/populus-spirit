# 胡杨精灵 · POPULUS SPIRIT

额济纳旗胡杨节主题的互动文创展馆，使用原生 HTML、CSS、JavaScript 与本地 model-viewer。

在线展馆：https://galasenaoqier-ui.github.io/populus-spirit/

`qr-code/` 中的焦糖棕二维码直接打开在线展馆。

## 本地预览

在项目文件夹运行：

```sh
python3 -m http.server 8765
```

打开 http://localhost:8765/code_artifact.html 。3D 模型需通过 HTTP 预览加载。

## 功能

- 首次进入播放 3 秒 Logo 动画与「三千年的等候只为等候你的到来」，支持跳过与页脚重看
- 双视图 GLB 手办展示、旋转与缩放
- 金色种子表面发光、角色亮点说明
- 双面典藏卡、本地保存收藏编号
- 背景音乐、自然声景与本地音乐导入
- 胡杨文化故事与守护纪念凭据

网站所需模型、查看器、种子发光贴图和配乐均放在项目目录中。Blender/STL 源文件和未使用的参考图片保留在本地，不纳入网站仓库。

音乐来源和许可参见 [MUSIC-LICENSE.md](MUSIC-LICENSE.md)。

入场动画位于 `logo-intro/`，每个标签页会话默认播放一次；深链接与减少动态效果模式直接进入展馆。动画结束后停留 600ms 阅读文案，再淡出进入展馆，不自动播放声音。素材加载失败会自动放行。独立动画预览、图层素材与验收记录保留在本地 `设计/logo-motion/`。
