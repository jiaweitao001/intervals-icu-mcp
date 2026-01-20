# Intervals.icu MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

An MCP (Model Context Protocol) server that allows AI assistants to access and analyze your Intervals.icu training data.

让 AI 直接访问您的 Intervals.icu 运动数据进行分析的 MCP 服务器。

## Features / 功能特性

### 📊 Activity Data / 活动数据
- **get_activities** - List training activities within a date range
- **get_activities_with_details** - List activities within a date range (includes richer fields; better for Strava-synced activities)
- **get_recent_activities_with_details** - Get the most recent N activities (sorted by start_date_local desc; avoids ordering ambiguity)
- **get_activity_detail** - Get detailed information for a single activity
- **get_activity_intervals** - Get interval data for an activity
- **get_activity_power_curve** - Get power curve for an activity
- **get_activity_streams** - Get detailed data streams (HR, power, pace, etc.)
- **search_activities** - Search activities by name or tag

### 💪 Performance Analysis / 体能分析
- **get_power_curves** - Get power curves (MMP) showing best power for various durations
- **get_pace_curves** - Get pace curves showing best pace for various distances
- **get_hr_curves** - Get heart rate curves
- **get_power_hr_curve** - Get power vs HR curve for aerobic efficiency analysis

### 🏃 Health & Training / 健康与训练
- **get_athlete_profile** - Get athlete basic information
- **get_wellness** - Get wellness data (weight, HRV, sleep, fatigue, etc.)
- **get_wellness_for_date** - Get wellness data for a specific date
- **get_athlete_summary** - Get training summary (CTL/ATL/Form)
- **get_events** - Get planned workouts and events
- **get_gear** - Get equipment information

## Installation / 安装

### 1. Clone and Build / 克隆并构建

```bash
git clone https://github.com/jiaweitao001/intervals-icu-mcp.git
cd intervals-icu-mcp
npm install
npm run build
```

### 2. Get Intervals.icu API Credentials / 获取 API 凭证

1. Log in to [Intervals.icu](https://intervals.icu)
2. Go to **Settings**
3. Find your **API Key** in the API section
4. Your **Athlete ID** can be found in your profile URL (e.g., `i12345`)

## Usage / 使用方式

### With Claude Desktop / 与 Claude Desktop 集成

Add to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "intervals-icu": {
      "command": "node",
      "args": ["/path/to/intervals-icu-mcp/dist/index.js"],
      "env": {
        "INTERVALS_API_KEY": "your_api_key_here",
        "INTERVALS_ATHLETE_ID": "i12345"
      }
    }
  }
}
```

### With VS Code / 与 VS Code 集成

Create `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "intervals-icu": {
      "command": "node",
      "args": ["${workspaceFolder}/dist/index.js"],
      "env": {
        "INTERVALS_API_KEY": "your_api_key_here",
        "INTERVALS_ATHLETE_ID": "your_athlete_id_here"
      }
    }
  }
}
```

## Example Prompts / 使用示例

After configuration, you can ask AI to:

### Training Analysis / 训练分析
- "Analyze my training volume over the past 30 days"
- "Show my cycling activities from last week"
- "Fetch my most recent 5 rides (with details)"
- "What's my current training load?"

Tip: For "recent N" queries, prefer **get_recent_activities_with_details**. It intentionally fetches a wider time window and then sorts by `start_date_local` before taking the top N, so the result is deterministic even if the upstream API response order changes.

### Performance Assessment / 体能评估
- "Show my power curve changes over the past year"
- "What's my current FTP?"
- "Analyze my aerobic efficiency trend"

### Health Monitoring / 健康监测
- "Show my recent HRV data"
- "What's my weight trend?"
- "Display my fatigue index"

## Development / 开发

```bash
# Development mode
npm run dev

# Build
npm run build

# Watch mode
npm run watch
```

## API Documentation / API 文档

This project is built on the [Intervals.icu API](https://intervals.icu/api/v1/docs).

## License / 许可证

MIT License - see [LICENSE](LICENSE) for details.

## Contributing / 贡献

Issues and Pull Requests are welcome!
