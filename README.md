# Intervals.icu MCP Server

让 AI 直接访问您的 Intervals.icu 运动数据进行分析的 MCP (Model Context Protocol) 服务器。

## 功能特性

这个 MCP Server 提供以下工具让 AI 可以：

### 📊 活动数据
- **get_activities** - 获取指定日期范围内的所有训练活动
- **get_activity_detail** - 获取单个活动的详细信息
- **get_activity_intervals** - 获取活动的间歇区间数据
- **get_activity_power_curve** - 获取活动的功率曲线
- **get_activity_streams** - 获取活动的详细数据流（心率、功率、配速等）
- **search_activities** - 根据名称或标签搜索活动

### 💪 体能分析
- **get_power_curves** - 获取功率曲线（MMP），显示不同时间段的最佳功率
- **get_pace_curves** - 获取配速曲线，显示不同距离的最佳配速
- **get_hr_curves** - 获取心率曲线
- **get_power_hr_curve** - 获取功率与心率关系曲线，分析有氧效率

### 🏃 健康与训练
- **get_athlete_profile** - 获取运动员基本信息
- **get_wellness** - 获取健康数据（体重、HRV、睡眠、疲劳度等）
- **get_wellness_for_date** - 获取特定日期的健康数据
- **get_athlete_summary** - 获取训练摘要（CTL/ATL/Form等）
- **get_events** - 获取计划的训练和事件
- **get_gear** - 获取装备信息

## 安装

### 1. 克隆并构建

```bash
cd intervals_icu_mcp
npm install
npm run build
```

### 2. 获取 Intervals.icu API 凭证

1. 登录 [Intervals.icu](https://intervals.icu)
2. 进入 **Settings** (设置)
3. 在 **API** 部分找到您的 **API Key**
4. 您的 **Athlete ID** 可以在个人主页 URL 中找到，格式如 `i12345`

### 3. 配置环境变量

创建 `.env` 文件（或在系统中设置环境变量）：

```bash
INTERVALS_API_KEY=your_api_key_here
INTERVALS_ATHLETE_ID=i12345
```

## 使用方式

### 与 Claude Desktop 集成

在 Claude Desktop 的配置文件中添加：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "intervals-icu": {
      "command": "node",
      "args": ["/path/to/intervals_icu_mcp/dist/index.js"],
      "env": {
        "INTERVALS_API_KEY": "your_api_key_here",
        "INTERVALS_ATHLETE_ID": "i12345"
      }
    }
  }
}
```

### 与 VS Code Copilot 集成

在 VS Code 设置中配置 MCP Server：

```json
{
  "mcp": {
    "servers": {
      "intervals-icu": {
        "command": "node",
        "args": ["/path/to/intervals_icu_mcp/dist/index.js"],
        "env": {
          "INTERVALS_API_KEY": "your_api_key_here",
          "INTERVALS_ATHLETE_ID": "i12345"
        }
      }
    }
  }
}
```

## 使用示例

配置完成后，您可以让 AI 执行以下操作：

### 训练分析
- "分析我过去30天的训练量"
- "查看我上周的骑行活动"
- "我今天的训练负荷是多少？"

### 体能评估
- "显示我过去一年的功率曲线变化"
- "我的FTP是多少？"
- "分析我的有氧效率趋势"

### 健康监测
- "查看我最近的HRV数据"
- "我的体重变化趋势如何？"
- "显示我的疲劳指数"

### 装备管理
- "列出我所有的自行车"
- "这辆车骑了多少公里？"

## 开发

```bash
# 开发模式（使用 tsx 实时运行）
npm run dev

# 构建
npm run build

# 监听模式构建
npm run watch
```

## API 文档

本项目基于 [Intervals.icu API](https://intervals.icu/api/v1/docs) 开发。

## 许可证

MIT
