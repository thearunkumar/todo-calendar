import React, { useEffect, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import styled from 'styled-components';
import { formatDate, get24HoursInADay, getCurrentTimeInHourAndMin, getDayInFull, getDaysOfWeekInView, getFormattedTime, getInTwoDigits, getTimeFromDate, isCurrentDate } from '../utils/utils';
import CreateTask from './create-task';
import CurrentTimeWidget from './widgets/current-time';
import DayWidget from './widgets/day';
import TaskWidget, { ITask, TaskEventType, TaskStatus } from './widgets/task';
import TimeWidget from './widgets/time';
import { v4 as uuidv4 } from 'uuid';
import { useTaskStorage } from '../hooks/useTaskStorage';

export interface ICalendar {
    current: Date;
    active: Date;
    start?: Date;
    end?: Date;
    tasks?: Record<string, Record<string, ITask>>;
}

export interface ITime {
    hour: string;
    minutes: string;
}

const StyledCalendarContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 95vh;
`;

const StyledCalendar = styled.div`
    display: flex;
    flex: 1;
    position: relative;
`;

const StyledRow = styled.div`
    display: flex;
    flex: 1;
    flex-direction: row;
`;

const StyledDiv = styled.div`
    border: 1px solid #f7f8fa;
    border-right: 0;
    border-top: 0;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    color: #b9b9b9;
    font-weight: bold;
    position: relative;

    ${(props: any) => props && props['data-active'] && `
        border: 1px solid blue;
        border-bottom: 0;
        border-left: 0;
        border-right: 0;
    `}
`;

const StyledHeader = styled.header`
    display: flex;
    height: 5vh;
    justify-content: right;
    align-items: center;
    margin-right: 100px;

    .task-create, .navigation {
        border: 0;
        font-size: 20px;
        padding: 5px 10px;
        margin: 0 10px;
        color: #fff;
        cursor: pointer;
    }

    .task-create {
        background: #ea4c89;
    }

    .navigation {
        background: #000;
    }
`;

const StyledCreateTaskModal = styled.div`
    position: fixed;
    top: 20%;
    right: 10%;
    z-index: 99;
    background-color: #fff;
    box-shadow: 0 24px 38px 3px rgba(0,0,0,.14), 0 9px 46px 8px rgba(0,0,0,.12), 0 11px 15px -7px rgba(0,0,0,.2);
    padding: 25px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
`;

const CloseIcon = styled.span`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 2px;
    background-color: #888;
  }

  &::before {
    transform: translate(-50%, -50%) rotate(-45deg);
  }

  &::after {
    transform: translate(-50%, -50%) rotate(45deg);
  }
`;

const isCurrentTime = (hour: number, columnIndex: number, rowIndex: number, date: Date): boolean => {
    return date && isCurrentDate(date) && hour + 1 === rowIndex;
}

const getTasksForThisCell = ({ columnIndex, rowIndex, tasks, onTaskEvent }: any): JSX.Element => {
    if (!tasks) {
        return <></>;
    }
    if (columnIndex === 0 || rowIndex === 0) {
        return <></>;
    }
    const arr: Array<JSX.Element> = [];
    // console.log(columnIndex, rowIndex, tasks);
    Object.values(tasks).forEach((task: any) => {
        const { hour } = getTimeFromDate(task.when);
        if (hour + 1 === rowIndex) {
            arr.push(<TaskWidget key={`${task.identifier}-${columnIndex}-${rowIndex}`} identifier={task.identifier} showDescription={task.showDescription} title={task.title} description={task.description} when={task.when} onEvent={onTaskEvent} style={task.style} status={task.status} />);
        }
    });
    return <>{arr}</>;
}

const Cell = ({ columnIndex, rowIndex, style, config, data, onTaskEvent }: any) => {
    if (!data) {
        return null;
    }
    const date = data.week[columnIndex % 8];
    const times = data.times[columnIndex];
    const { hour } = getCurrentTimeInHourAndMin();
    const isActiveDate = date ? date.getDate() === new Date().getDate() && rowIndex === 0 : false;

    return <StyledDiv key={`${columnIndex}-${rowIndex}`} data-active={isActiveDate}>
        {columnIndex === 0 && rowIndex !== 0 && <TimeWidget time={`${times[rowIndex - 1].hour}:${times[rowIndex - 1].minutes}`} />}
        {columnIndex !== 0 && rowIndex === 0 && <DayWidget active={isActiveDate} day={getDayInFull(date)} date={getInTwoDigits(date.getDate())} month={getInTwoDigits(date.getMonth() + 1)} />}
        {isCurrentTime(hour, columnIndex, rowIndex, date) && (
            <CurrentTimeWidget />
        )}
        {date ? getTasksForThisCell({
            columnIndex,
            rowIndex,
            tasks: config.tasks?.[formatDate(date)],
            onTaskEvent
        }) : null}
    </StyledDiv>
}

const getRowData = (index: number, style: any, data: any, config: ICalendar, onTaskEvent: (type: TaskEventType, value?: any) => void) => {
    const rowData: Array<JSX.Element> = [];

    for (let i = 0; i < 8; ++i) {
        rowData.push(<Cell key={`${i}-${index}`} columnIndex={i} rowIndex={index} data={data} onTaskEvent={onTaskEvent} config={config} />)
    }

    return <StyledRow style={style}>{rowData}</StyledRow>
}

const getData = (config: ICalendar): any => {
    const daysOfWeek = getDaysOfWeekInView(config.active);
    return {
        week: daysOfWeek,
        times: [get24HoursInADay()]
    }
}

const getTaskFromDateAndId = (tasks: Record<string, Record<string, ITask>>, date: Date | string, id: string): ITask | undefined => {
    if (tasks) {
        const tasksByDate = tasks[typeof date === 'string' ? date : formatDate(date)];
        let task: ITask | undefined = tasksByDate?.[id] || undefined;
        return task as ITask;
    }
    return undefined;
}

const updateTaskWithChanges = (task: ITask, changes: ITask): ITask => {
    const newTask: ITask = {
        ...task,
        ...changes
    };
    return newTask;
}

const getInitialScrollTopBasedOnCurrentTime = (): number => {
    const { hour } = getCurrentTimeInHourAndMin();
    return hour * 150;
}

const Calendar = () => {

    const { calendarData, storeOrUpdateTask } = useTaskStorage();

    const [config, setConfig] = useState<ICalendar>({
        current: new Date(),
        active: new Date(),
        tasks: calendarData
    });

    useEffect(() => {
        setConfig({
            ...config,
            tasks: calendarData
        })
    }, [calendarData, config]);

    const [data, setData] = useState<any>();

    const [openCreateTask, setOpenCreateTask] = useState<boolean>(false);
    const [focusedTask, setFocusedTask] = useState<ITask>({} as any);

    const handleData = (data: any) => {
        if (data) {
            const daysOfWeek = data.week;
            setConfig({
                ...config,
                start: daysOfWeek[1],
                end: daysOfWeek[daysOfWeek.length - 1]
            });
        }
    }

    useEffect(() => {
        const data = getData(config);
        setData(data)
        handleData(data);
        // eslint-disable-next-line
    }, [config])

    useEffect(() => {
        const data = getData(config);
        setData(data)
        handleData(data);
        // eslint-disable-next-line
    }, [config.active, config]);

    const getPreviousAndNextDate = (date: Date, num: number) => {
        // Create a new Date object at the same time as the input date
        let newDate = new Date(date.getTime());

        // Adjust the date by the num parameter
        newDate.setDate(newDate.getDate() + num);

        return newDate;
    }

    const handleCalendarNavigation = (num: number) => {
        let d = null;
        if (num === -1) {
            d = getPreviousAndNextDate(config.start as Date, num);
        } else if (num === 1) {
            d = getPreviousAndNextDate(config.end as Date, num);
        }
        setConfig({
            ...config,
            active: d as Date
        })
    }

    const Row = ({ index, style, data }: any) => {
        // console.log(config.tasks);
        return getRowData(index, style, data, config, (type: TaskEventType, value?: any) => {
            if (type === TaskEventType.Click) {
                // Toggle description
                const { id, date } = value;
                let task: ITask | undefined = getTaskFromDateAndId(config.tasks as Record<string, Record<string, ITask>>, date, id);
                if (task) {
                    task = updateTaskWithChanges(task, {
                        ...task,
                        showDescription: !task.showDescription
                    })
                    const formattedDate = formatDate(date);
                    (config.tasks as any)[formattedDate] = {
                        ...config.tasks?.[formattedDate],
                        [id]: task
                    };
                    setFocusedTask(task);
                    setConfig({
                        ...config,
                        tasks: config.tasks
                    });
                }
            }
        })
    };

    const onOpenCreateTask = (from?: string) => {
        if (from === 'button') {
            setFocusedTask({} as any);
        }
        setOpenCreateTask(true);
    }

    const onCloseCreateTask = () => {
        setOpenCreateTask(false);
        setFocusedTask({} as any);
    }

    const modalRef = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     const handleClickOutside = (event: MouseEvent) => {
    //         if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
    //             onCloseCreateTask();
    //         }
    //     };

    //     document.addEventListener('mousedown', handleClickOutside);

    //     return () => {
    //         document.removeEventListener('mousedown', handleClickOutside);
    //     };
    // }, [onCloseCreateTask]);

    const handleTaskCompletion = (identifier: string, date: string): void => {
        const task = getTaskFromDateAndId(config.tasks as Record<string, Record<string, ITask>>, date, identifier);
        storeOrUpdateTask({
            ...task,
            status: TaskStatus.Complete,
        } as ITask)
        onCloseCreateTask();
    }

    return <StyledCalendarContainer>
        <StyledHeader>
            <button className="task-create" onClick={onOpenCreateTask.bind(null, 'button')}>Create Task</button>
            <button className="navigation" onClick={handleCalendarNavigation.bind(null, -1)}>&lt;</button>
            <button className="navigation" onClick={handleCalendarNavigation.bind(null, 1)}>&gt;</button>
        </StyledHeader>
        {openCreateTask || Object.keys(focusedTask)?.length ? <StyledCreateTaskModal ref={modalRef}>
            <CloseButton onClick={onCloseCreateTask}>
                <CloseIcon />
            </CloseButton>
            <CreateTask identifier={focusedTask?.identifier || ''} initialCompletion={focusedTask?.status === 'Complete'} initialColor={focusedTask?.style?.bgColor || ''} initialDate={focusedTask?.when ? formatDate(focusedTask?.when) : ''} initialDescription={focusedTask?.description || ''} initialTime={focusedTask?.when ? getFormattedTime(focusedTask?.when) : ''} initialTitle={focusedTask?.title || ''} onCompleteTask={(identifier: string, date: string) => {
                handleTaskCompletion(identifier, date);
            }} onCreateTask={(identifier: string, title: string, description: string, date: string, time: string, color: string, oldTask: any) => {
                // HAndle deletion of the old task during the update flow.
                const task: ITask = {
                    identifier: identifier || uuidv4(),
                    title,
                    description,
                    when: new Date(`${date}T${time}`),
                    showDescription: false,
                    status: TaskStatus.Open,
                    style: {
                        bgColor: color,
                    },
                };

                storeOrUpdateTask(task, oldTask?.oldTaskDate);

                if (oldTask?.oldTaskDate) {
                    onCloseCreateTask();
                }

            }} />
        </StyledCreateTaskModal> : null}
        <StyledCalendar>
            <AutoSizer>
                {({ height, width }: any) => (
                    <FixedSizeList
                        itemData={data}
                        height={height}
                        width={width}
                        itemCount={25}
                        itemSize={150}
                        initialScrollOffset={getInitialScrollTopBasedOnCurrentTime()}
                    >
                        {Row}
                    </FixedSizeList>
                )}
            </AutoSizer>
        </StyledCalendar>
    </StyledCalendarContainer>
}

export default Calendar;