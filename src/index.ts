#!/usr/bin/env node
/**
 * Intervals.icu MCP Server
 * 
 * 这个 MCP Server 允许 AI 访问您的 Intervals.icu 运动数据进行分析
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { IntervalsClient } from './intervals-client.js';

// 从环境变量获取配置
const INTERVALS_API_KEY = process.env.INTERVALS_API_KEY;
const INTERVALS_ATHLETE_ID = process.env.INTERVALS_ATHLETE_ID;

if (!INTERVALS_API_KEY || !INTERVALS_ATHLETE_ID) {
  console.error('错误: 请设置环境变量 INTERVALS_API_KEY 和 INTERVALS_ATHLETE_ID');
  console.error('您可以在 https://intervals.icu/settings 找到您的 API Key');
  console.error('Athlete ID 可以在您的 Intervals.icu 个人主页 URL 中找到');
  process.exit(1);
}

const client = new IntervalsClient({
  apiKey: INTERVALS_API_KEY,
  athleteId: INTERVALS_ATHLETE_ID,
});

// 定义可用的工具
const tools: Tool[] = [
  {
    name: 'get_athlete_profile',
    description: '获取运动员的基本信息,包括姓名、体重、时区等',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_activities',
    description: '获取指定日期范围内的所有活动(训练记录)列表。返回活动的基本信息如类型、距离、时间、心率、功率等',
    inputSchema: {
      type: 'object',
      properties: {
        oldest: {
          type: 'string',
          description: '最早日期,ISO-8601格式 (如: 2024-01-01)',
        },
        newest: {
          type: 'string',
          description: '最新日期,ISO-8601格式 (如: 2024-12-31),可选,默认为今天',
        },
      },
      required: ['oldest'],
    },
  },
  {
    name: 'get_activity_detail',
    description: '获取单个活动的详细信息,包括完整的统计数据',
    inputSchema: {
      type: 'object',
      properties: {
        activity_id: {
          type: 'string',
          description: '活动ID',
        },
      },
      required: ['activity_id'],
    },
  },
  {
    name: 'get_activity_intervals',
    description: '获取活动的区间数据,包括每个间歇段的详细统计',
    inputSchema: {
      type: 'object',
      properties: {
        activity_id: {
          type: 'string',
          description: '活动ID',
        },
      },
      required: ['activity_id'],
    },
  },
  {
    name: 'get_activity_power_curve',
    description: '获取活动的功率曲线数据,显示不同时间段的最大功率输出',
    inputSchema: {
      type: 'object',
      properties: {
        activity_id: {
          type: 'string',
          description: '活动ID',
        },
      },
      required: ['activity_id'],
    },
  },
  {
    name: 'get_activity_streams',
    description: '获取活动的详细数据流,如心率、功率、速度、海拔等随时间变化的数据',
    inputSchema: {
      type: 'object',
      properties: {
        activity_id: {
          type: 'string',
          description: '活动ID',
        },
        types: {
          type: 'array',
          items: { type: 'string' },
          description: '需要的数据流类型,如: watts, heartrate, cadence, speed, altitude, distance, time',
        },
      },
      required: ['activity_id'],
    },
  },
  {
    name: 'get_wellness',
    description: '获取健康数据记录,包括体重、静息心率、HRV、睡眠、疲劳度、压力等',
    inputSchema: {
      type: 'object',
      properties: {
        oldest: {
          type: 'string',
          description: '最早日期,ISO-8601格式',
        },
        newest: {
          type: 'string',
          description: '最新日期,ISO-8601格式',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_wellness_for_date',
    description: '获取特定日期的健康数据',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: '日期,ISO-8601格式 (如: 2024-12-30)',
        },
      },
      required: ['date'],
    },
  },
  {
    name: 'get_power_curves',
    description: '获取运动员的功率曲线(MMP曲线),显示不同时间段的最佳功率表现',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: '运动类型: Ride(骑行), Run(跑步), Swim(游泳)等,默认Ride',
        },
        curves: {
          type: 'string',
          description: '曲线范围: 1y(过去一年), 42d(过去42天), all(所有时间)等,默认1y',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_pace_curves',
    description: '获取运动员的配速曲线,显示不同距离的最佳配速表现(适用于跑步/游泳)',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: '运动类型: Run(跑步), Swim(游泳)等,默认Run',
        },
        curves: {
          type: 'string',
          description: '曲线范围: 1y(过去一年), 42d(过去42天), all(所有时间)等,默认1y',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_hr_curves',
    description: '获取运动员的心率曲线,显示不同时间段的最高心率表现',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: '运动类型,默认Ride',
        },
        curves: {
          type: 'string',
          description: '曲线范围,默认1y',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_events',
    description: '获取日程事件,包括计划的训练、比赛、休息日等',
    inputSchema: {
      type: 'object',
      properties: {
        oldest: {
          type: 'string',
          description: '最早日期,ISO-8601格式',
        },
        newest: {
          type: 'string',
          description: '最新日期,ISO-8601格式',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_gear',
    description: '获取运动员的装备信息,如自行车、跑鞋等',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'search_activities',
    description: '根据名称或标签搜索活动',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索关键词,或以#开头的标签',
        },
        limit: {
          type: 'number',
          description: '返回结果数量限制,默认10',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_athlete_summary',
    description: '获取运动员训练摘要,包括总训练量、体能(CTL)、疲劳(ATL)、状态(Form)等',
    inputSchema: {
      type: 'object',
      properties: {
        start: {
          type: 'string',
          description: '开始日期,ISO-8601格式',
        },
        end: {
          type: 'string',
          description: '结束日期,ISO-8601格式',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_power_hr_curve',
    description: '获取功率与心率关系曲线,用于分析有氧效率',
    inputSchema: {
      type: 'object',
      properties: {
        start: {
          type: 'string',
          description: '开始日期,ISO-8601格式',
        },
        end: {
          type: 'string',
          description: '结束日期,ISO-8601格式',
        },
      },
      required: ['start', 'end'],
    },
  },
  {
    name: 'get_activities_with_details',
    description: '获取活动列表（包含完整数据）。此方法可以绕过 Strava 数据限制，获取活动的名称、距离、时间、训练负荷等详细信息。推荐使用此方法代替 get_activities。',
    inputSchema: {
      type: 'object',
      properties: {
        oldest: {
          type: 'string',
          description: '最早日期,ISO-8601格式 (如: 2024-01-01)',
        },
        newest: {
          type: 'string',
          description: '最新日期,ISO-8601格式 (如: 2024-12-31),可选,默认为今天',
        },
        type: {
          type: 'string',
          description: '运动类型: Ride(骑行), Run(跑步), Swim(游泳)等,默认Ride',
        },
        limit: {
          type: 'number',
          description: '返回结果数量限制（按 start_date_local 倒序排序后截取）',
        },
      },
      required: ['oldest'],
    },
  },
  {
    name: 'get_recent_activities_with_details',
    description: '获取最近 N 次活动列表（包含基本详情，按 start_date_local 倒序排序）。内部会用 lookback_days 扩大窗口后再截取，避免“最近N次取错”。',
    inputSchema: {
      type: 'object',
      properties: {
        n: {
          type: 'number',
          description: '最近活动数量,默认5',
        },
        type: {
          type: 'string',
          description: '运动类型: Ride(骑行), Run(跑步), Swim(游泳)等,默认Ride',
        },
        lookback_days: {
          type: 'number',
          description: '向前回溯天数（用于扩大候选集），默认120',
        },
        newest: {
          type: 'string',
          description: '最新日期,ISO-8601格式 (如: 2026-01-20),可选,默认为今天',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_max_activity_data',
    description: '获取单个活动的最大可用数据。对于 Strava 同步的活动，会尝试多种方法获取尽可能多的信息，并提供解决方案说明。',
    inputSchema: {
      type: 'object',
      properties: {
        activity_id: {
          type: 'string',
          description: '活动ID',
        },
      },
      required: ['activity_id'],
    },
  },
  {
    name: 'check_activity_source',
    description: '检查活动的数据来源，判断是否来自 Strava（受 API 限制）',
    inputSchema: {
      type: 'object',
      properties: {
        activity_id: {
          type: 'string',
          description: '活动ID',
        },
      },
      required: ['activity_id'],
    },
  },
];

// 创建 MCP Server
const server = new Server(
  {
    name: 'intervals-icu-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 处理工具列表请求
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// 处理工具调用请求
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: any;

    switch (name) {
      case 'get_athlete_profile':
        result = await client.getAthlete();
        break;

      case 'get_activities':
        result = await client.getActivities(
          args?.oldest as string,
          args?.newest as string | undefined
        );
        break;

      case 'get_activity_detail':
        result = await client.getActivity(args?.activity_id as string);
        break;

      case 'get_activity_intervals':
        result = await client.getActivityIntervals(args?.activity_id as string);
        break;

      case 'get_activity_power_curve':
        result = await client.getActivityPowerCurve(args?.activity_id as string);
        break;

      case 'get_activity_streams':
        result = await client.getActivityStreams(
          args?.activity_id as string,
          args?.types as string[] | undefined
        );
        break;

      case 'get_wellness':
        result = await client.getWellness(
          args?.oldest as string | undefined,
          args?.newest as string | undefined
        );
        break;

      case 'get_wellness_for_date':
        result = await client.getWellnessForDate(args?.date as string);
        break;

      case 'get_power_curves':
        result = await client.getPowerCurves(
          (args?.type as string) || 'Ride',
          (args?.curves as string) || '1y'
        );
        break;

      case 'get_pace_curves':
        result = await client.getPaceCurves(
          (args?.type as string) || 'Run',
          (args?.curves as string) || '1y'
        );
        break;

      case 'get_hr_curves':
        result = await client.getHRCurves(
          (args?.type as string) || 'Ride',
          (args?.curves as string) || '1y'
        );
        break;

      case 'get_events':
        result = await client.getEvents(
          args?.oldest as string | undefined,
          args?.newest as string | undefined
        );
        break;

      case 'get_gear':
        result = await client.getGear();
        break;

      case 'search_activities':
        result = await client.searchActivities(
          args?.query as string,
          (args?.limit as number) || 10
        );
        break;

      case 'get_athlete_summary':
        result = await client.getAthleteSummary(
          args?.start as string | undefined,
          args?.end as string | undefined
        );
        break;

      case 'get_power_hr_curve':
        result = await client.getPowerHRCurve(
          args?.start as string,
          args?.end as string
        );
        break;

      case 'get_activities_with_details':
        result = await client.getActivitiesWithDetails(
          args?.oldest as string,
          args?.newest as string | undefined,
          (args?.type as string) || 'Ride',
          args?.limit as number | undefined
        );
        break;

      case 'get_recent_activities_with_details':
        result = await client.getRecentActivitiesWithDetails(
          (args?.n as number) || 5,
          (args?.type as string) || 'Ride',
          (args?.lookback_days as number) || 120,
          args?.newest as string | undefined
        );
        break;

      case 'get_max_activity_data':
        result = await client.getMaxAvailableActivityData(args?.activity_id as string);
        break;

      case 'check_activity_source':
        result = await client.checkActivitySource(args?.activity_id as string);
        break;

      default:
        throw new Error(`未知的工具: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `错误: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Intervals.icu MCP Server 已启动');
}

main().catch((error) => {
  console.error('服务器错误:', error);
  process.exit(1);
});
