# Nutstore WebDAV Secret CLI

一个基于 Bun、Solid 和 OpenTUI 的终端工具，用来查看和管理坚果云 WebDAV 第三方应用密码。

## 安装

- Bun `1.3+`

全局安装：

```bash
npm i -g nutstore-webdav-secret-cli
```

直接运行：

```bash
npx nutstore-webdav-secret-cli
bunx nutstore-webdav-secret-cli
```

全局安装后也可以用短命令：

```bash
nswds
```

注意：

- 这是 Bun CLI，机器上需要先安装 Bun
- npm 包当前分发的是预构建 JS，不是跨平台预编译二进制
- 如果你不想全局安装，也可以直接用源码开发模式

## 开发

安装依赖：

```bash
bun install
```

开发模式：

```bash
bun run dev
```

调试模式：

```bash
bun run debug
```

`debug` 脚本会：

- 关闭 alternate screen
- 打开 OpenTUI console overlay
- 更方便查看日志和错误

## 功能

- 读取并缓存本地 Cookie
- 拉取 `mobile_asp` 页面并解析已有 app passwords
- 创建新的 app password
- 删除已有 app password
- 复制：
  - secret
  - WebDAV URL
  - account

## 本地发布

这个项目支持两种本地产物：

- npm 发布用的 Bun JS bundle
- 本地单文件二进制

构建走的是：

- `Bun.build(...)`
- `@opentui/solid/bun-plugin`
- JS bundle 默认输出到 `dist/cli.js`
- 二进制模式下 `compile.target` 根据当前本机平台自动推断

类型检查：

```bash
bun run typecheck
```

构建 npm 发布用 JS：

```bash
bun run build
```

运行 JS 产物：

```bash
bun run run:dist
```

构建本地二进制：

```bash
bun run build:bin
```

产物路径：

```bash
./dist/cli.js
./dist/nswds
```

运行已构建二进制：

```bash
bun run run:bin
```

本地发布流程：

```bash
bun run release:local
```

它会执行：

- `bun run typecheck`
- `bun run build`

如果你要本地出单文件二进制：

```bash
bun run release:local:bin
```

如果你想手动指定目标平台，可以覆盖：

```bash
BUILD_TARGET=bun-darwin-arm64 bun run build
BUILD_TARGET=bun-linux-x64 bun run build
```

## npm 发布

发布前检查：

```bash
bun run typecheck
bun run pack:check
```

发布：

```bash
bun publish
```

如果你用 npm：

```bash
npm publish --access public
```

当前 `package.json` 已经配置：

- `bin.nswds -> ./dist/cli.js`
- `publishConfig.access = public`
- `prepublishOnly` 会先跑类型检查、构建 JS bundle 和 `npm pack --dry-run`

## GitHub 发布流

仓库现在按 `Changesets + GitHub Actions + npm trusted publishing` 设计。

日常流程：

1. 开功能分支
2. 改代码
3. 运行 `bun run changeset`
4. 提交 PR
5. `CI` workflow 会跑类型检查、二进制构建和 `npm pack --dry-run`
6. PR 合并到 `main`
7. `Release` workflow 会自动创建或更新一个 release PR
8. 合并这个 release PR
9. workflow 自动发布 npm

也就是说：

- 普通功能 PR 不会直接发 npm
- 只有 release PR 合并后才真正发布
- 版本号和 changelog 由 changesets 自动维护

### 在 npm 侧你需要做什么

1. 登录 npm
2. 进入这个包的设置页
3. 打开 `Trusted Publishers`
4. 添加一个 GitHub Actions publisher

建议填写：

- Owner: 你的 GitHub 用户名或组织名
- Repository: `nutstore-webdav-secret-cli`
- Workflow file: `release.yml`
- Environment: 留空

配置完成后，GitHub Action 就可以通过 OIDC 直接发布，不需要单独保存 `NPM_TOKEN`。

### 在 GitHub 侧你需要做什么

1. 把默认分支确认成 `main`
2. 打开仓库 `Settings -> Actions -> General`
3. 确保允许工作流读写 Pull Requests 和 Contents
4. 如果你启用了分支保护，允许 `GITHUB_TOKEN` 创建 release PR

### 创建 changeset

```bash
bun run changeset
```

常用选择：

- `patch`: 修 bug、文案调整、小优化
- `minor`: 新功能
- `major`: 破坏性变更

## Cookie

首次启动如果没有本地 Cookie，会进入手动输入流程。

Cookie 会保存到：

```bash
~/.config/nswds/cookie
```

这里保存的是完整的 `Cookie` header 内容。

## 快捷键

列表页：

- `Up/Down` 选择 secret
- `Enter` 复制当前 secret
- `U` 复制 WebDAV URL
- `A` 复制 account
- `N` 新增 secret
- `D` 删除当前 secret
- `R` 刷新列表
- `Q` 退出

新增 secret：

- `Enter` 提交创建
- `Esc` 取消

删除 secret：

- `D` 进入确认
- `Y` 确认删除
- `Esc` 取消

## 请求接口

当前已经接上的接口：

- 列表：`https://www.jianguoyun.com/d/mobile_asp`
- 创建：`https://www.jianguoyun.com/d/ajax/userop/generateAsp`
- 删除：`https://www.jianguoyun.com/d/ajax/userop/revokeAsp`

创建和删除接口都按浏览器同源 AJAX 请求的方式发送：

- `application/x-www-form-urlencoded`
- `X-Requested-With: XMLHttpRequest`
- `Origin: https://www.jianguoyun.com`
- `Referer: https://www.jianguoyun.com/d/mobile_asp`

如果创建或删除返回 `403`，优先检查：

- 本地保存的 Cookie 是否完整
- Cookie 是否仍然有效
- 是否包含接口依赖的关键字段

## 当前限制

- account 目前是从返回 HTML 里做启发式提取，不是严格结构化字段
- 自动检测浏览器 Cookie 入口还没有启用
- 删除和创建成功后依赖刷新列表同步状态
