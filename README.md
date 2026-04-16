# OrgVista

<p align="center">
  <img src="https://raw.githubusercontent.com/K130-dev/OrgVista/main/hero.png" alt="OrgVista" />
</p>
  <img src="https://img.shields.io/badge/version-2.8.4-blue.svg" alt="version">
  <img src="https://img.shields.io/badge/React-19-61dafb.svg" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-6-646cfa.svg" alt="Vite">
</p>

<h3 align="center">企业级组织架构透视专家</h3>

<p align="center">
  一键构建全景组织视图，深入洞察企业人才分布与层级关系
</p>

---

## 功能特性

### 交互式组织架构图

- **缩放与平移** — 滚轮缩放（30%-250%），拖拽自由漫游
- **节点展开/折叠** — 点击 +/- 按钮快速展开或收起分支
- **节点选择** — 点击任意节点，右侧即时展示详细信息

### 智能筛选

- **国家/地区筛选** — 多选下拉框，支持全选/重置
- **实时搜索** — 按单位名称或 ID 快速定位目标节点
- **联动视图** — 筛选条件同步影响树状图、架构图和花名册

### 双视图模式

| 视图 | 用途 |
|------|------|
| 左侧组织列表 | 层级树状图，清晰展示汇报关系 |
| 右侧人员详情 | 员工花名册，显示详细职位、职级信息 |

### 数据导入

- CSV 格式数据，开箱即用
- 自动解析组织层级与人员归属
- 支持大规模组织结构

---

## 快速开始

### 环境要求

- Node.js 18+

### 安装

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
npm run preview
```

---

## 数据格式

将 `structure.csv` 和 `employee.csv` 放入项目根目录：

### structure.csv（组织结构）

```csv
org_id,name,parent_id,type,leader_code,leader_name,leader_level,leader_position,leader_country
ORG001,北京总部,,Headquarters,L001,张三,Senior,总经理,China
```

| 字段 | 说明 |
|------|------|
| org_id | 单位唯一标识 |
| name | 单位名称 |
| parent_id | 父级单位 ID（空表示根节点）|
| type | 单位类型 |
| leader_* | 负责人信息 |

### employee.csv（员工信息）

```csv
org_id,_,emp_code,emp_name,level,position,country
ORG001,,E001,李四,Junior,工程师,China
```

---

## 技术栈

<p align="center">
  <img width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React">
  <img width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" alt="TypeScript">
  <img width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vite/vite-original.svg" alt="Vite">
</p>

- **React 19** — UI 框架
- **TypeScript 5.8** — 类型安全
- **Vite 6** — 极速构建
- **Lucide React** — 图标库
- **Tailwind CSS** — 原子化样式（通过 className）

---

## 项目结构

```
orgvista/
├── index.html          # 入口 HTML
├── index.tsx           # 应用入口
├── structure.csv      # 组织结构数据
├── employee.csv       # 员工数据
└── package.json
```

---

## License

MIT
