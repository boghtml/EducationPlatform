import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { TextField, Button, MenuItem, Typography, Container, Paper } from '@mui/material';
import API_URL from '../../api';
import { useNavigate } from 'react-router-dom';

function CreateCourse() {
  const userId = useSelector((state) => state.user.user.id);
    const navigate = useNavigate();

  const [courseData, setCourseData] = useState({
    "title": '',
    "description": '',
    "teacher": userId,
    "status": 'free',
    "price": 0,
    "start_date": '',
    "end_date": '',
    "duration": '',
    "batch_number": 1
  });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/courses/`, courseData);
      setMessage({ type: 'success', text: 'Курс створено успішно!' });
      navigate('/dashboard-teacher')

    } catch (error) {
      setMessage({ type: 'error', text: 'Помилка при створенні курсу!' });
      console.error('Error creating course:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Typography variant="h4" gutterBottom>Створення нового курсу</Typography>
        {message && <Typography color={message.type === 'success' ? 'green' : 'red'}>{message.text}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Назва курсу" name="title" value={courseData.title} onChange={handleChange} required margin="normal" />
          <TextField fullWidth label="Опис" name="description" value={courseData.description} onChange={handleChange} required multiline rows={3} margin="normal" />
          
          <TextField fullWidth select label="Статус" name="status" value={courseData.status} onChange={handleChange} margin="normal">
            <MenuItem value="free">Безкоштовний</MenuItem>
            <MenuItem value="paid">Платний</MenuItem>
          </TextField>
          <TextField fullWidth label="Ціна" type="number" name="price" value={courseData.price} onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Дата початку" type="date" name="start_date" value={courseData.start_date} onChange={handleChange} required margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Дата закінчення" type="date" name="end_date" value={courseData.end_date} onChange={handleChange} required margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Тривалість (днів)" type="number" name="duration" value={courseData.duration} onChange={handleChange} required margin="normal" />
          <TextField fullWidth label="Номер групи" type="number" name="batch_number" value={courseData.batch_number} onChange={handleChange} required margin="normal" />

          <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '15px' }}>Створити курс</Button>
        </form>
      </Paper>
    </Container>
  );
}

export default CreateCourse;