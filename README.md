# 一起住 · 合租生活管家

面向四位室友的中文交互原型，使用 React、Vite、JavaScript 和 localStorage，无后端、登录或真实支付。

## 本地运行

```sh
npm install
npm run dev
npm run build
npm run preview
```

建议 Node.js 22.12+。生产产物位于 `dist/`。

## 功能

- 首页：待办、汇总、室友动态、演示合租指数和生活建议。
- 费用 AA：新增费用、选择付款人与参与人、精确到分的均摊、结算明细、模拟结清。
- 清洁值日：周视图、逾期状态和打卡。
- 公共物品：库存、阈值、采购清单、模拟提醒、新增及更新库存。
- 室友公约：确认状态、新公约和当前用户确认。
- 本地持久化、全局反馈、弹窗键盘操作、移动端导航及数据重置。

演示日期固定为 2026 年 9 月 12 日。清洁页展示当周排班和轮换方案，没有后台定时任务。提醒仅记录在本地，不发送消息；结算不发起转账。右上角重置按钮可在所有尺寸恢复演示数据。

## 部署

沿用现有 GitHub 仓库的 main 分支及现有 Vercel 项目，不创建新项目。

- Framework preset: Vite
- Root directory: 仓库根目录
- Build command: `npm run build`
- Output directory: `dist`

生产地址保持为 https://roommate-life-manager-mu.vercel.app 。若现有项目仍使用空仓库时期的设置，请在该项目核对上述配置并重新部署。
