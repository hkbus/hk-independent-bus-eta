import { EtaDb, Freq } from "hk-bus-eta";

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
  isHoliday: boolean,
  serviceDayMap: EtaDb["serviceDayMap"]
): boolean => {
  if (!freq) return true;
  let isAvailable = false;
  let now = new Date();
  now.setTime(now.getTime() + 8 * 60 * 60 * 1000);
  let currentWts = getWeeklyTimestamp(
    isHoliday ? 0 : now.getUTCDay(),
    ("0" + now.getUTCHours()).slice(-2) + ("0" + now.getUTCMinutes()).slice(-2)
  );
  Object.entries(freq).forEach(([serviceId, startTimes]) => {
    try {
      serviceDayMap[serviceId].forEach((validDay, idx: number) => {
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
      isAvailable = true;
    }
  });
  return isAvailable;
};
