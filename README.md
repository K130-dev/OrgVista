# OrgViz - 企业组织架构可视化工具

![OrgViz](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## 核心优势

**1. 交互友好，操作直观**
- 支持缩放、平移、展开/折叠节点
- 点击即可查看部门及员工详情
- 搜索框快速定位目标单位

**2. 多维度筛选，高效定位**
- 支持按国家/地区筛选
- 可同时选择多个筛选条件
- 实时更新视图，数据洞察一目了然

**3. 双视图模式，灵活切换**
- 左侧：层级树状图，清晰展示汇报关系
- 右侧：员工花名册，显示详细职位、职级信息

**4. 数据驱动，洞察全局**
- CSV 数据导入，开箱即用
- 自动解析组织架构层级
- 支持大规模组织（百人级团队）

## 快速启动

**环境要求：** Node.js

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 构建生产版本

```bash
npm run build
npm run preview
```

## 技术栈

- React 19 + TypeScript
- Vite 6 构建工具
- Tailwind CSS 样式
- Lucide React 图标库
