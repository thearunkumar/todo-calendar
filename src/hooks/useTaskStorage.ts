import { useEffect, useState } from "react";
import { ITask } from "../calendar/widgets/task";
import { convertDateToTimestamp, convertTimestampToDate, formatDate } from "../utils/utils";

export const useTaskStorage = () => {
  const storedData = localStorage.getItem('calendarData');
  const initialCalendarData: Record<string, Record<string, ITask>> | null = storedData ? convertTimestampToDate(JSON.parse(storedData)) : null;

  const [calendarData, setCalendarData] = useState<Record<string, Record<string, ITask>>>(initialCalendarData as Record<string, Record<string, ITask>>);

  useEffect(() => {
    if (calendarData && Object.keys(calendarData).length) {
      localStorage.setItem('calendarData', JSON.stringify(convertDateToTimestamp(calendarData)));
    }
  }, [calendarData]);

  const getCalendarDataAfterDeletion = (task: ITask, oldTaskDate: string): typeof calendarData => {
    const cacheCalendarData = {
      ...calendarData
    }
    if (cacheCalendarData[oldTaskDate] && cacheCalendarData[oldTaskDate][task.identifier]) {
      delete cacheCalendarData[oldTaskDate][task.identifier];
    }

    return cacheCalendarData;
  }

  const storeOrUpdateTask = (task: ITask, oldTaskDate?: string) => {
    let updatedCalendarData: typeof calendarData = calendarData;
    if (oldTaskDate) {
      updatedCalendarData = getCalendarDataAfterDeletion(task, oldTaskDate);
    }

    const dateKey = formatDate(task.when);
    const updatedTasks = {
      ...updatedCalendarData,
      [dateKey]: {
        ...(updatedCalendarData?.[dateKey] || {}),
        [task.identifier]: task,
      }
    };

    const convertedCalendarData = convertTimestampToDate(updatedTasks);

    setCalendarData(convertedCalendarData);
  };

  return {
    calendarData,
    storeOrUpdateTask,
  };
};
