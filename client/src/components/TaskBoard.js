import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Menu, Dropdown, Button, message, Table } from 'antd';

export default function TaskBoard() {
  let auth = useSelector((state) => state.auth);
  let [tasks, setTasks] = useState([]);
  let [tableData, setTableData] = useState([]);

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
            { key: res.data.id, taskName: res.data.name },
          ]);
        });
      });
    };

    fetchTasksById();
  }, []);

  console.log(tableData);

  return <Table columns={columns} dataSource={tableData} />;
}
