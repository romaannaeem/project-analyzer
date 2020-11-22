import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Table } from 'antd';

export default function TaskBoard() {
  let auth = useSelector((state) => state.auth);
  let [tasks, setTasks] = useState([]);
  let [tableData, setTableData] = useState([]);
  let [subtasks, setSubtasks] = useState([]);
  let [teamId, setTeamId] = useState('');

  const clickupApi = axios.create({
    baseURL: 'https://cors-duck.herokuapp.com/https://api.clickup.com/api/v2',
    headers: { Authorization: auth.token },
  });

  const columns = [
    {
      title: 'Task Name',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: 'Total Completion (%)',
      dataIndex: 'totalCompletion',
      key: 'totalCompletion',
    },
    {
      title: 'Average Daily Completion (%)',
      dataIndex: 'averageDailyCompletion',
      key: 'averageDailyCompletion',
    },
    {
      title: 'Projected End Date',
      dataIndex: 'projectedEndDate',
      key: 'projectedEndDate',
    },
  ];

  useEffect(() => {
    const fetchTasksById = () => {
      auth.trackedTasks.map(async (task) => {
        await clickupApi.get(`/task/${task}`).then((res) => {
          setTasks((oldArray) => [...oldArray, res.data]);

          setTableData((oldArray) => [
            ...oldArray,
            { key: res.data.id, taskName: res.data.name, subtasks: [] },
          ]);
        });
      });
    };

    fetchTasksById();
  }, []);

  // Sets Team ID
  useEffect(() => {
    const saveTeamId = async () => {
      await clickupApi
        .get(`/team`)
        .then((res) => setTeamId(res.data.teams[0].id));
    };
    saveTeamId();
  }, []);

  useEffect(() => {
    // Clickup API is bugged for subtasks so we're gonna have to do this the long way
    //* 1. Get team ID
    //* 2. Get all subtasks from the team
    //! 3. Check individual subtasks for matching parent ID to existing tracked task ID
    //! 4. If theres a match, push to subtasks array inside object

    const fetchSubtasks = () => {
      let trackedTasks = tasks;
      // console.log('tracked tasks', trackedTasks);

      for (let i = 0; i < 5; i++) {
        clickupApi
          .get(`/team/${teamId}/task?page=${i}&subtasks=true`)
          .then((res) => {
            if (res.data.tasks.length != 0) {
              // console.log(`subtasks for team page ${i}`, res.data.tasks);

              // Mapping through all subtasks
              res.data.tasks.map((subtask) => {
                // Mapping through all tracked tasks
                tasks.map((trackedTask) => {
                  console.log('subtask', subtask);
                  console.log('Task from state', trackedTask);
                });
              });
            }
          });
      }
    };

    if (tasks != [] && teamId != '') {
      fetchSubtasks();
    }
  }, [tasks, teamId]);

  return <Table columns={columns} dataSource={tableData} />;
}
