# CloudWeather(C-Weather)
> C-WEATHER
## 🖥 应用界面（web）
![CloudWeather](screen/1.png)
## 🖥 应用界面（electron）
![CloudWeather](screen/2.png)


## 项目说明
### 这个项目由Cloud使用命令分割生成，隶属于CloudWeb项目
### 支持web和electron


## 🛠 使用的技术栈
- [Electron](https://electronjs.org/)
- [electron-builder](https://www.electron.build/) 
- [Vue](https://vuejs.org/)
- [VueX](https://vuex.vuejs.org/)
- [Element](https://element.eleme.io)

## ⌨️ 本地开发

### 克隆代码
```bash
git clone https://github.com/zjinh/CloudWeather.git
```

### 安装依赖
```bash
cd CloudWeather
npm i
```
### 淘宝的npm源
```bash
npm config set registry 'https://registry.npm.taobao.org'
npm config set ELECTRON_MIRROR='https://npm.taobao.org/mirrors/electron/'
```

### 运行项目
```bash
npm run dev:web
npm run dev:electron
```
### 打包项目
```bash
npm run build:web
npm run build:electron
```
