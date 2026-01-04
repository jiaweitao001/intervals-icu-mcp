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

    return this.request<Activity[]>(
      `/api/v1/athlete/${this.athleteId}/activities?${params}`
    );
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
    type: string = 'Ride'
  ): Promise<any> {
    // 计算日期范围的天数
    const start = new Date(oldest);
    const end = newest ? new Date(newest) : new Date();
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // 使用自定义日期范围的曲线查询
    const curveData = await this.request<any>(
      `/api/v1/athlete/${this.athleteId}/power-curves.json?type=${type}&oldest=${oldest}&newest=${newest || new Date().toISOString().split('T')[0]}`
    );
    
    // 从曲线数据中提取活动信息
    if (curveData && curveData.activities) {
      return Object.values(curveData.activities);
    }
    
    return [];
  }

  /**
   * 通过多种曲线端点聚合获取活动详情
   */
  async getActivityDetailsViaAggregation(activityId: string): Promise<any> {
    // 尝试从功率曲线获取活动信息
    try {
      const powerCurves = await this.request<any>(
        `/api/v1/athlete/${this.athleteId}/power-curves.json?type=Ride&curves=all`
      );
      
      if (powerCurves?.activities?.[activityId]) {
        return powerCurves.activities[activityId];
      }
    } catch (e) {
      // 忽略错误，尝试其他方法
    }
    
    return null;
  }
}
