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

  const storeOrUpdateTask = (task: ITask) => {
    const dateKey = formatDate(task.when);
    const updatedTasks = {
      ...calendarData,
      [dateKey]: {
        ...(calendarData?.[dateKey] || {}),
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

// export const useTaskStorage = (initialData: any) => {
//   const storedData = localStorage.getItem('calendarData');
//   const initialCalendarData = storedData ? JSON.parse(storedData) : initialData;

//   const [calendarData, setCalendarData] = useState<any>(initialCalendarData);

//   useEffect(() => {
//     localStorage.setItem('calendarData', JSON.stringify(calendarData));
//   }, [calendarData]);

//   const convertTimestampToDate = (data: any): any => {
//     const convertedData: any = {};

//     for (const dateKey in data) {
//       const taskByDate = data[dateKey];
//       const convertedTasks: { [taskId: string]: ITask } = {};

//       for (const taskId in taskByDate.tasks) {
//         const task = taskByDate.tasks[taskId];
//         convertedTasks[taskId] = {
//           ...task,
//           when: new Date(task.when), // Convert timestamp to Date object
//         };
//       }

//       convertedData[dateKey] = {
//         ...taskByDate,
//         tasks: convertedTasks,
//       };
//     }

//     return convertedData;
//   };

//   const storeOrUpdateTask = (task: ITask) => {
//     const dateKey = formatDate(task.when);
//     const taskByDate: any = calendarData[dateKey] || {
//       date: dateKey,
//       tasks: {},
//     };

//     const updatedTask = {
//       ...task,
//       when: task.when.getTime(), // Convert Date object to timestamp
//     };

//     const updatedTasks = {
//       ...taskByDate.tasks,
//       [task.identifier]: updatedTask,
//     };

//     const updatedTaskByDate = {
//       ...taskByDate,
//       tasks: updatedTasks,
//     };

//     const updatedCalendarData = {
//       ...calendarData,
//       [dateKey]: updatedTaskByDate,
//     };

//     const convertedCalendarData = convertTimestampToDate(updatedCalendarData);

//     setCalendarData(convertedCalendarData);
//   };



//   return {
//     calendarData,
//     storeOrUpdateTask,
//   };
// };