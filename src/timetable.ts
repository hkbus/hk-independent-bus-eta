import { Freq } from "hk-bus-eta";

export const ServiceIds = {
  "31": "星期一至五",
  "287": "星期一至五",
  "415": "星期一至五",
  "63": "星期一至六",
  "319": "星期一至六",
  "447": "星期一至六",
  "416": "星期六至日",
  "480": "星期六至日",
  "266": "星期二至四",
  "271": "星期一至四",
  "272": "星期五",
  "288": "星期六",
  "320": "星期日及公眾假期",
  "448": "星期日及公眾假期",
  "511": "所有日子",
  "111": "除星期三外",
};

const ServiceDayMap = {
  // from sunday to monday
  "266": [0, 0, 1, 1, 1, 0, 0],
  "271": [0, 1, 1, 1, 1, 0, 0],
  "272": [0, 0, 0, 0, 0, 1, 0],
  "287": [0, 1, 1, 1, 1, 1, 0],
  "288": [0, 0, 0, 0, 0, 0, 1],
  "319": [0, 1, 1, 1, 1, 1, 1],
  "320": [1, 0, 0, 0, 0, 0, 0],
  "415": [0, 1, 1, 1, 1, 1, 0],
  "416": [1, 0, 0, 0, 0, 0, 1],
  "447": [0, 1, 1, 1, 1, 1, 1],
  "448": [1, 0, 0, 0, 0, 0, 0],
  "480": [1, 0, 0, 0, 0, 0, 1],
  "511": [1, 1, 1, 1, 1, 1, 1],
  "31": [0, 1, 1, 1, 1, 1, 0],
  "63": [0, 1, 1, 1, 1, 1, 1],
  "111": [1, 1, 0, 1, 1, 1, 1],
};

// return minute offset start from sunday 00:00
const getWeeklyTimestamp = (day: number, dayTime: string): number => {
  let ret = day * 24 * 60;
  ret +=
    parseInt(dayTime.slice(0, 2), 10) * 60 + parseInt(dayTime.slice(2), 10);
  return ret;
};

const checkValueBetween = (
  start: number,
  end: number,
  target: number
): boolean => {
  if (start - 60 <= target && target <= end + 60) return true;

  // special handle for overnight route
  let wholeWeek = +24 * 7 * 60;
  if (start - 60 <= target + wholeWeek && target + wholeWeek <= end + 60)
    return true;
  return false;
};

export const isHoliday = (holidays: string[], date: Date): boolean => {
  return holidays.includes(
    `${date.getFullYear()}${("0" + (date.getMonth() + 1)).slice(-2)}${(
      "0" + date.getDate()
    ).slice(-2)}`
  );
};

export const isRouteAvaliable = (
  routeNo: string,
  freq: Freq | null,
  isHoliday: boolean
): boolean => {
  if (!freq) return true;
  let isAvailable = false;
  let now = new Date();
  let currentWts = getWeeklyTimestamp(
    isHoliday ? 0 : now.getDay(),
    ("0" + now.getHours()).slice(-2) + ("0" + now.getMinutes()).slice(-2)
  );
  Object.entries(freq).forEach(([serviceId, startTimes]) => {
    try {
      ServiceDayMap[serviceId].forEach((validDay, idx: number) => {
        if (validDay) {
          Object.entries(startTimes).forEach(([startTime, endTime]) => {
            let time_a = getWeeklyTimestamp(idx, startTime);
            let time_b = getWeeklyTimestamp(
              idx,
              endTime ? endTime[0] : startTime
            );
            isAvailable =
              isAvailable || checkValueBetween(time_a, time_b, currentWts);
          });
        }
      });
    } catch (e) {
      console.log(routeNo + " has unknown service ID");
    }
  });
  return isAvailable;
};
