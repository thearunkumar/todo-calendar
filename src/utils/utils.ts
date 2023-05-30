import { ITime } from "../calendar/calendar";
import { ITask, TaskEventType, TaskStatus } from "../calendar/widgets/task";

export const isCurrentDate = (date: Date): boolean => {
    // Create a new Date object representing the current date
    var currentDate = new Date();

    // Compare the year, month, and day of the given date with the current date
    return (
        date.getFullYear() === currentDate.getFullYear() &&
        date.getMonth() === currentDate.getMonth() &&
        date.getDate() === currentDate.getDate()
    );
}

export const getCurrentTimeInHourAndMin = (): { hour: number, min: number } => {
    return getTimeFromDate(new Date());
}

// hh:mm
export const getFormattedTime = (date: Date): string => {
    const { hour, min } = getTimeFromDate(date);
    return `${getInTwoDigits(hour)}:${getInTwoDigits(min)}`;
}

export const getTimeFromDate = (date: Date): { hour: number, min: number } => {
    const time = date.toLocaleString([], { hour12: false, hour: '2-digit', minute: "2-digit" });
    const hour = Number(time.split(':')[0]) % 24;
    const min = Number(time.split(':')[1]);
    return {
        hour, min
    }
}

export const getDaysOfWeekInView = (date: Date) => {
    const currentDayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    const currentDate = date.getDate();
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    const startDayOfWeek = new Date(currentYear, currentMonth, currentDate - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1));

    const dates = [null as unknown as Date];
    for (let i = 0; i < 7; i++) {
        const newDate = new Date(startDayOfWeek);
        newDate.setDate(startDayOfWeek.getDate() + i);
        dates.push(newDate);
    }

    return dates;
}

export const getDayInFull = (date: Date): string => {
    const options: any = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options).split(',')[0];
}

export const getInTwoDigits = (num: number): string => {
    return num < 10 ? `0${num.toString()}` : num.toString();
}

export const get24HoursInADay = (): Array<ITime> => {
    const times: Array<ITime> = [];
    for (let i = 0; i < 24; ++i) {
        times.push({
            hour: getInTwoDigits(i),
            minutes: getInTwoDigits(0)
        })
    }
    return times;
}

export const formatDate = (date: Date): string => {
    if (date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return '';
};

export const convertTimeStampToDateUtil = (timestamp: number): Date => {
    return new Date(timestamp);
}

export const convertTimestampToDate = (data: Record<string, Record<string, any>>): Record<string, Record<string, ITask>> => {
    const map: Record<string, Record<string, ITask>> = {};

    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            const record: Record<string, ITask> = {};
            for (let identifier in data[key]) {
                if (data[key].hasOwnProperty(identifier)) {
                    const taskAny: any = data[key][identifier];
                    record[identifier] = {
                        ...taskAny,
                        when: convertTimeStampToDateUtil(taskAny.when),
                    }
                }
            }
            map[key] = record;
        }
    }

    return map;
}

export const convertDateToTimestamp = (map: Record<string, Record<string, ITask>>): any => {
    const result: any = {};

    for (let key in map) {
        if (map.hasOwnProperty(key)) {
            const value = map[key];
            result[key] = {
                ...(result[key] || {})
            };
            for (let identifier in value) {
                if (value.hasOwnProperty(identifier)) {
                    result[key][identifier] = {
                        ...(result[key][identifier] || {}),
                        ...value[identifier],
                        when: value[identifier].when.getTime(),
                    }
                    if (result[key][identifier].onEvent) {
                        delete result[key][identifier].onEvent;
                    }
                }
            }
        }
    }

    return result;
}

export const getDummyTasks = (): Record<string, Record<string, ITask>> => {
    const map: Record<string, Record<string, ITask>> = {};

    const startDate = new Date(); // Start from the current date
    startDate.setHours(0, 0, 0, 0); // Set the time to midnight

    const endDate = new Date(startDate.getTime());
    endDate.setDate(startDate.getDate() + 6); // Add 6 days to get the end date (total of 7 days)

    for (let date = new Date(startDate.getTime()); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateString = formatDate(date);
        const tasksForDate: Record<string, ITask> = {};

        for (let i = 0; i < 5; i++) {
            const taskDate = new Date(date);
            taskDate.setHours(8 + i, 45, 0, 0); // Set the task time (starting from 8 AM, incrementing by 1 hour for each task)

            const dummyTask: ITask = {
                identifier: `task-${taskDate.getTime()}`,
                title: `Task ${i}`,
                description: `Description for Task ${i}`,
                when: taskDate,
                onEvent: (type: TaskEventType, value?: any) => {
                    // Handle task event here
                },
                showDescription: false, // Optional: Specify whether to show the description or not
                status: TaskStatus.Open, // Optional: Specify the task status
            };

            tasksForDate[`task-${taskDate.getTime()}`] = dummyTask;
        }

        map[dateString] = tasksForDate;
    }

    return map;
};