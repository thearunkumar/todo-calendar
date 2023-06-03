import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface CreateTaskProps {
    onCreateTask: (identifier: string, title: string, description: string, date: string, time: string, color: string, oldTask: any) => void;
    onCompleteTask: (identifier: string, date: string) => void;
    identifier?: string;
    initialTitle?: string;
    initialDescription?: string;
    initialDate?: string;
    initialTime?: string;
    initialColor?: string;
    initialCompletion?: boolean;
}

const CreateTask: React.FC<CreateTaskProps> = ({
    onCreateTask,
    onCompleteTask,
    identifier = '',
    initialTitle = '',
    initialDescription = '',
    initialDate = '',
    initialTime = '',
    initialColor = '',
    initialCompletion = false,
}) => {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState(initialTime);
    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [completion, setCompletion] = useState(initialCompletion);

    const colors = ['#2eab62', '#3f51b5', '#f44336', '#ff9800', '#607d8b'];

    const handleCreateTask = () => {
        const oldTask: any = identifier !== '' ? {
            oldTaskDate: initialDate
        } : null;
        onCreateTask(identifier || '', title, description, date, time, selectedColor, oldTask);
        resetInputs();
    };

    const handleCompleteTask = () => {
        if (completion) {
            onCreateTask(identifier, title, description, date, time, selectedColor, null);
            setCompletion(false);
        } else {
            onCompleteTask(identifier, date);
        }
    };

    useEffect(() => {
        setTitle(initialTitle);
        setDescription(initialDescription);
        setDate(initialDate);
        setTime(initialTime);
        setSelectedColor(initialColor);
        setCompletion(initialCompletion);
    }, [initialTime, initialColor, initialDate, initialDescription, initialTitle, initialCompletion])

    const resetInputs = () => {
        setTitle(initialTitle);
        setDescription(initialDescription);
        setDate(initialDate);
        setTime(initialTime);
        setSelectedColor(initialColor);
    };

    return (
        <StyledCreateTask>
            <Label>Title</Label>
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />

            <Label>Description</Label>
            <TextArea value={description} onChange={(e) => setDescription(e.target.value)} />

            <Label>Date</Label>
            <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />

            <Label>Time</Label>
            <Select value={time} onChange={(e) => setTime(e.target.value)}>
                {Array.from({ length: 96 }, (_, i) => {
                    const minutes = i * 15;
                    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
                    const mins = (minutes % 60).toString().padStart(2, '0');
                    const timeValue = `${hours}:${mins}`;

                    return (
                        <option key={timeValue} value={timeValue}>
                            {timeValue}
                        </option>
                    );
                })}
            </Select>

            <Label>Color</Label>
            <ColorPalette>
                {colors.map((color) => (
                    <ColorSwatch
                        key={color}
                        color={color}
                        selected={selectedColor === color}
                        onClick={() => setSelectedColor(color)}
                    />
                ))}
            </ColorPalette>

            <Button onClick={handleCreateTask}>{identifier !== '' ? 'Update Task' : 'Create Task'}</Button>
            {identifier !== '' ? <Button onClick={handleCompleteTask}>{completion ? 'Undo Complete' : 'Complete Task'}</Button> : null}
        </StyledCreateTask>
    );
};

const StyledCreateTask = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 12px;
  text-align: left;
`;

const TextInput = styled.input`
  margin-bottom: 10px;
  padding: 5px;
    font-size: 20px;
    border: 1px solid #ccc;
`;

const TextArea = styled.textarea`
  margin-bottom: 10px;
  height: 100px;
    resize: none;
    border: 1px solid #ccc;
    padding: 5px;
    font-size: 20px;
`;

const Select = styled.select`
  margin-bottom: 10px;
  font-size: 20px;
    padding: 5px;
    border: 1px solid #ccc;
`;

const ColorPalette = styled.div`
  display: flex;
  gap: 10px;
`;

const ColorSwatch = styled.div<{ color: string; selected: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  border: ${(props) => (props.selected ? '2px solid #000' : 'none')};
  cursor: pointer;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #3f51b5;
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 20px;
  margin-top: 10px;
`;

export default CreateTask;
