/**
 * Intervals.icu API Client
 * 用于与 Intervals.icu API 进行交互
 */

export interface IntervalsConfig {
  apiKey: string;
  athleteId: string;
  baseUrl?: string;
}

export interface Activity {
  id: string;
  start_date_local: string;
  type: string;
  name: string;
  description?: string;
  distance?: number;
  moving_time?: number;
  elapsed_time?: number;
  total_elevation_gain?: number;
  average_speed?: number;
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  average_watts?: number;
  icu_training_load?: number;
  icu_intensity?: number;
  icu_ftp?: number;
  icu_atl?: number;
  icu_ctl?: number;
  icu_weighted_avg_watts?: number;
  icu_average_watts?: number;
  icu_power_hr?: number;
  icu_efficiency_factor?: number;
  icu_decoupling?: number;
  icu_variability_index?: number;
  calories?: number;
  trainer?: boolean;
  tags?: string[];
}

export interface Wellness {
  id: string;
  ctl?: number;
  atl?: number;
  rampRate?: number;
  weight?: number;
  restingHR?: number;
  hrv?: number;
  sleepSecs?: number;
  sleepScore?: number;
  soreness?: number;
  fatigue?: number;
  stress?: number;
  mood?: number;
  motivation?: number;
  comments?: string;
  steps?: number;
}

export interface PowerCurve {
  secs: number[];
  values: number[];
  activity_id?: string[];
}

export interface AthleteProfile {
  id: string;
  name: string;
  firstname?: string;
  lastname?: string;
  weight?: number;
  sex?: string;
  city?: string;
  country?: string;
  timezone?: string;
}

export interface Event {
  id: number;
  start_date_local: string;
  category: string;
  name?: string;
  description?: string;
  type?: string;
  icu_training_load?: number;
  moving_time?: number;
}

export interface ActivitiesWithDetailsResponse {
  activities: Activity[];
  sorted_by: string;
  note: string;
  strava_limitation: string;
  window?: {
    oldest: string;
    newest: string;
    lookback_days?: number;
  };
  requested_count?: number;
}

export class IntervalsClient {
  private apiKey: string;
  private athleteId: string;
  private baseUrl: string;

  constructor(config: IntervalsConfig) {
    this.apiKey = config.apiKey;
    this.athleteId = config.athleteId;
    this.baseUrl = config.baseUrl || 'https://intervals.icu';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const auth = Buffer.from(`API_KEY:${this.apiKey}`).toString('base64');

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Intervals.icu API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  private formatDateYYYYMMDD(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private sortByStartDateLocalDesc<T extends { start_date_local?: string }>(
    items: T[]
  ): T[] {
    return [...items].sort((a, b) => {
      const aTime = a.start_date_local ? Date.parse(a.start_date_local) : Number.NEGATIVE_INFINITY;
      const bTime = b.start_date_local ? Date.parse(b.start_date_local) : Number.NEGATIVE_INFINITY;
      return bTime - aTime;
    });
  }

  /**
   * 获取运动员信息
   */
  async getAthlete(): Promise<AthleteProfile> {
    return this.request<AthleteProfile>(
      `/api/v1/athlete/${this.athleteId}/profile`
    );
  }

  /**
   * 获取活动列表
   * @param oldest 最早日期 (ISO-8601)
   * @param newest 最新日期 (ISO-8601)
   */
  async getActivities(oldest: string, newest?: string): Promise<Activity[]> {
    const params = new URLSearchParams({ oldest });
    if (newest) params.append('newest', newest);

    const activities = await this.request<Activity[]>(
      `/api/v1/athlete/${this.athleteId}/activities?${params}`
    );

    // Do not rely on API ordering; always sort deterministically.
    return this.sortByStartDateLocalDesc(activities);
  }

  /**
   * 获取单个活动详情
   */
  async getActivity(activityId: string): Promise<Activity> {
    return this.request<Activity>(`/api/v1/activity/${activityId}`);
  }

  /**
   * 获取活动区间数据
   */
  async getActivityIntervals(activityId: string): Promise<any> {
    return this.request(`/api/v1/activity/${activityId}/intervals`);
  }

  /**
   * 获取活动功率曲线
   */
  async getActivityPowerCurve(activityId: string): Promise<PowerCurve> {
    return this.request<PowerCurve>(
      `/api/v1/activity/${activityId}/power-curve.json`
    );
  }

  /**
   * 获取活动数据流
   */
  async getActivityStreams(
    activityId: string,
    types?: string[]
  ): Promise<any[]> {
    const params = types ? `?types=${types.join(',')}` : '';
    return this.request(`/api/v1/activity/${activityId}/streams.json${params}`);
  }

  /**
   * 获取健康数据列表
   */
  async getWellness(oldest?: string, newest?: string): Promise<Wellness[]> {
    const params = new URLSearchParams();
    if (oldest) params.append('oldest', oldest);
    if (newest) params.append('newest', newest);

    const queryString = params.toString() ? `?${params}` : '';
    return this.request<Wellness[]>(
      `/api/v1/athlete/${this.athleteId}/wellness.json${queryString}`
    );
  }

  /**
   * 获取特定日期的健康数据
   */
  async getWellnessForDate(date: string): Promise<Wellness> {
    return this.request<Wellness>(
      `/api/v1/athlete/${this.athleteId}/wellness/${date}`
    );
  }

  /**
   * 获取运动员功率曲线
   */
  async getPowerCurves(
    type: string = 'Ride',
    curves: string = '1y'
  ): Promise<any> {
    return this.request(
      `/api/v1/athlete/${this.athleteId}/power-curves.json?type=${type}&curves=${curves}`
    );
  }

  /**
   * 获取运动员配速曲线
   */
  async getPaceCurves(
    type: string = 'Run',
    curves: string = '1y'
  ): Promise<any> {
    return this.request(
      `/api/v1/athlete/${this.athleteId}/pace-curves.json?type=${type}&curves=${curves}`
    );
  }

  /**
   * 获取心率曲线
   */
  async getHRCurves(type: string = 'Ride', curves: string = '1y'): Promise<any> {
    return this.request(
      `/api/v1/athlete/${this.athleteId}/hr-curves.json?type=${type}&curves=${curves}`
    );
  }

  /**
   * 获取日程事件
   */
  async getEvents(oldest?: string, newest?: string): Promise<Event[]> {
    const params = new URLSearchParams();
    if (oldest) params.append('oldest', oldest);
    if (newest) params.append('newest', newest);

    const queryString = params.toString() ? `?${params}` : '';
    return this.request<Event[]>(
      `/api/v1/athlete/${this.athleteId}/events.json${queryString}`
    );
  }

  /**
   * 获取运动员装备
   */
  async getGear(): Promise<any[]> {
    return this.request(`/api/v1/athlete/${this.athleteId}/gear.json`);
  }

  /**
   * 获取运动设置
   */
  async getSportSettings(): Promise<any[]> {
    return this.request(`/api/v1/athlete/${this.athleteId}`);
  }

  /**
   * 搜索活动
   */
  async searchActivities(query: string, limit: number = 10): Promise<any[]> {
    return this.request(
      `/api/v1/athlete/${this.athleteId}/activities/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  /**
   * 获取运动员摘要
   */
  async getAthleteSummary(start?: string, end?: string): Promise<any> {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);

    const queryString = params.toString() ? `?${params}` : '';
    return this.request(
      `/api/v1/athlete/${this.athleteId}/athlete-summary.json${queryString}`
    );
  }

  /**
   * 获取功率与心率关系曲线
   */
  async getPowerHRCurve(start: string, end: string): Promise<any> {
    return this.request(
      `/api/v1/athlete/${this.athleteId}/power-hr-curve?start=${start}&end=${end}`
    );
  }

  /**
   * 获取活动列表（包含完整数据，绕过 Strava 限制）
   * 通过功率曲线端点获取活动详情
   */
  async getActivitiesWithDetails(
    oldest: string,
    newest?: string,
    type: string = 'Ride',
    limit?: number
  ): Promise<ActivitiesWithDetailsResponse> {
    // 获取功率曲线数据（这个端点会返回活动的基本信息）
    const newestDate = newest || this.formatDateYYYYMMDD(new Date());
    const curves = `r.${oldest}.${newestDate}`;
    
    const curveData = await this.request<any>(
      `/api/v1/athlete/${this.athleteId}/power-curves.json?type=${type}&curves=${curves}`
    );
    
    // 从曲线数据中提取活动信息
    if (curveData && curveData.activities) {
      const rawActivities = Object.values(curveData.activities) as Activity[];
      const activitiesSorted = this.sortByStartDateLocalDesc(rawActivities);
      const activities = typeof limit === 'number' ? activitiesSorted.slice(0, Math.max(0, limit)) : activitiesSorted;
      return {
        activities,
        sorted_by: 'start_date_local_desc',
        note: activities.length > 0 
          ? '活动基本信息已获取。如需完整数据（心率流、功率流等），请使用 Strava Bulk Export 导入数据到 Intervals.icu'
          : '未找到活动数据',
        strava_limitation: '由于 Strava API 政策限制，从 Strava 同步的活动无法通过 API 获取完整详情。解决方案：1) 使用 Strava Bulk Export 导入数据；2) 配置 Garmin/Wahoo/Zwift 直接同步到 Intervals.icu'
      };
    }
    
    return {
      activities: [],
      sorted_by: 'start_date_local_desc',
      note: '未找到活动数据',
      strava_limitation: '由于 Strava API 政策限制，从 Strava 同步的活动无法通过 API 获取完整详情。解决方案：1) 使用 Strava Bulk Export 导入数据；2) 配置 Garmin/Wahoo/Zwift 直接同步到 Intervals.icu'
    };
  }

  /**
   * 获取最近 N 次活动列表（包含基本详情，绕过 Strava 限制）
   * 实现方式：拉取一个足够大的时间窗 -> 按 start_date_local 降序排序 -> 截取前 N
   */
  async getRecentActivitiesWithDetails(
    count: number = 5,
    type: string = 'Ride',
    lookbackDays: number = 120,
    newest?: string
  ): Promise<ActivitiesWithDetailsResponse> {
    const safeCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 5;
    const safeLookbackDays = Number.isFinite(lookbackDays)
      ? Math.max(1, Math.floor(lookbackDays))
      : 120;

    const newestDate = newest || this.formatDateYYYYMMDD(new Date());
    // 使用本地时间日期对象，避免时区偏移问题
    const newestParsed = new Date(newestDate + 'T00:00:00');
    const oldestAsDate = new Date(newestParsed.getTime() - safeLookbackDays * 24 * 60 * 60 * 1000);
    const oldestDate = this.formatDateYYYYMMDD(oldestAsDate);

    const result = await this.getActivitiesWithDetails(oldestDate, newestDate, type);
    const activities = Array.isArray(result?.activities) ? result.activities.slice(0, safeCount) : [];

    return {
      ...result,
      activities,
      window: { oldest: oldestDate, newest: newestDate, lookback_days: safeLookbackDays },
      requested_count: safeCount,
    };
  }

  /**
   * 获取活动功率曲线数据（包含活动列表）
   * 这是获取 Strava 活动信息的最佳方法
   */
  async getActivityPowerCurvesWithActivities(
    oldest: string,
    newest: string,
    type: string = 'Ride'
  ): Promise<any> {
    return this.request<any>(
      `/api/v1/athlete/${this.athleteId}/activity-power-curves.json?oldest=${oldest}&newest=${newest}&type=${type}`
    );
  }

  /**
   * 全文搜索活动（返回完整活动数据）
   * 注意：对于 Strava 活动，可能只返回部分数据
   */
  async searchActivitiesFull(query: string, limit: number = 10): Promise<any[]> {
    return this.request<any[]>(
      `/api/v1/athlete/${this.athleteId}/activities/search-full?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  /**
   * 检查活动来源
   * 返回活动是否来自 Strava（受 API 限制）
   */
  async checkActivitySource(activityId: string): Promise<{isStrava: boolean, source: string | null, message: string}> {
    try {
      const activity = await this.request<any>(`/api/v1/activity/${activityId}`);
      
      // 检查是否是 Strava 活动的空壳
      if (activity._note?.includes('STRAVA')) {
        return {
          isStrava: true,
          source: 'STRAVA',
          message: '此活动来自 Strava，由于 Strava API 政策限制，无法通过 API 获取完整数据。建议：使用 Strava Bulk Export 功能导入数据，或配置 Garmin/Wahoo/Zwift 直接同步。'
        };
      }
      
      return {
        isStrava: false,
        source: activity.source || 'UNKNOWN',
        message: '此活动可以通过 API 完整访问'
      };
    } catch (e) {
      // 422 错误通常意味着是 Strava 活动
      if (e instanceof Error && e.message.includes('422')) {
        return {
          isStrava: true,
          source: 'STRAVA',
          message: '此活动来自 Strava，由于 Strava API 政策限制，无法通过 API 获取完整数据。'
        };
      }
      throw e;
    }
  }

  /**
   * 获取活动的最大可用数据
   * 尝试多种方法获取尽可能多的活动信息
   */
  async getMaxAvailableActivityData(activityId: string): Promise<any> {
    const result: any = {
      id: activityId,
      dataSource: [],
      strava_limited: false
    };

    // 1. 尝试直接获取活动详情
    try {
      const activity = await this.request<any>(`/api/v1/activity/${activityId}`);
      if (!activity._note?.includes('STRAVA')) {
        result.activity = activity;
        result.dataSource.push('activity_detail');
      } else {
        result.strava_limited = true;
        result.activity = { id: activityId, _note: activity._note };
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('422')) {
        result.strava_limited = true;
      }
    }

    // 2. 从功率曲线获取活动基本信息
    try {
      const powerCurves = await this.request<any>(
        `/api/v1/athlete/${this.athleteId}/power-curves.json?type=Ride&curves=all`
      );
      if (powerCurves?.activities?.[activityId]) {
        result.basicInfo = powerCurves.activities[activityId];
        result.dataSource.push('power_curves');
      }
    } catch (e) {
      // 忽略错误
    }

    // 3. 如果是 Strava 活动，添加解决方案说明
    if (result.strava_limited) {
      result.solution = {
        description: '此活动来自 Strava，由于 Strava API 政策限制，无法获取完整数据',
        options: [
          '1. 使用 Strava Bulk Export: 在 Strava 设置中申请数据导出，然后在 Intervals.icu 设置中导入',
          '2. 配置直接同步: 将 Garmin/Wahoo/Zwift/Coros 等设备直接连接到 Intervals.icu',
          '3. 手动上传: 从设备或 Strava 下载 FIT/TCX 文件，手动上传到 Intervals.icu'
        ]
      };
    }

    return result;
  }
}
