import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Table } from 'antd';
import {
  calculateAverageDailyCompletion,
  findProjectedEndDate,
} from '../utils';

export default function TaskBoard() {
  let auth = useSelector((state) => state.auth);
  let [tasks, setTasks] = useState([]);
  let [tableData, setTableData] = useState([]);
  let [subtasks, setSubtasks] = useState([]);
  let [teamId, setTeamId] = useState('');

  const ONE_DAY = 86400000;

  const clickupApi = axios.create({
    baseURL: 'https://cors-duck.herokuapp.com/https://api.clickup.com/api/v2',
    headers: { Authorization: auth.token },
  });

  // const clickupApi = axios.create({
  //   baseURL: 'https://api.clickup.com/api/v2',
  //   headers: { Authorization: auth.token },
  // });

  const columns = [
    {
      title: 'Task Name',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: 'Number of Subtasks',
      dataIndex: 'subTaskCount',
      key: 'subTaskCount',
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

  // Sets Team ID
  useEffect(() => {
    const saveTeamId = async () => {
      await clickupApi
        .get(`/team`)
        .then((res) => setTeamId(res.data.teams[0].id));
    };

    saveTeamId();
  }, [tasks]);

  // Fetch tasks and set initial table data
  useEffect(() => {
    const fetchTasksById = () => {
      auth.trackedTasks.map(async (task) => {
        await clickupApi.get(`/task/${task}`).then((res) => {
          setTasks((oldArray) => [...oldArray, res.data]);
        });
      });
    };

    fetchTasksById();
  }, []);

  // Saves all subtasks into subtask array
  useEffect(() => {
    const fetchSubtasks = () => {
      for (let i = 0; i < 5; i++) {
        clickupApi
          .get(
            `/team/${teamId}/task?page=${i}&subtasks=true&include_closed=true`
          )
          .then((res) => {
            res.data.tasks.map((subtask) => {
              if (subtask.parent != null) {
                setSubtasks((oldArray) => [...oldArray, subtask]);
              }
            });
          });
      }
    };

    if (tasks != [] && teamId != '') {
      fetchSubtasks();
    }
  }, [teamId]);

  // Constructs the table data
  useEffect(() => {
    const constructTableData = () => {
      let tempTableData = [];

      tasks.map((task) => {
        tempTableData.push({
          key: task.id,
          taskName: task.name,
          subtasks: [],
          projectStartDate: task.date_created,
        });
      });

      subtasks.map((subtask) => {
        tempTableData.map((tableItem) => {
          if (tableItem.key == subtask.parent) {
            tableItem.subtasks.push(subtask);
          }
        });
      });

      tempTableData.map((tableItem) => {
        let openSubtasks = 0;
        let closedSubtasks = 0;
        tableItem.subTaskCount = tableItem.subtasks.length;

        tableItem.subtasks.map((subtask) => {
          if (subtask.status.type == 'open') openSubtasks++;
          if (subtask.status.type == 'closed') closedSubtasks++;
        });

        tableItem.totalCompletion = (
          (closedSubtasks / openSubtasks) *
          100
        ).toFixed(2);

        tableItem.averageDailyCompletion = (
          calculateAverageDailyCompletion(tableItem) * 100
        ).toFixed(2);

        if (tableItem.averageDailyCompletion == 0.0) {
          tableItem.projectedEndDate = 'N/A';
        } else {
          tableItem.projectedEndDate = findProjectedEndDate(
            tableItem.totalCompletion,
            tableItem.averageDailyCompletion
          );
        }
      });

      setTableData(tempTableData);
    };

    if (tasks != [] && subtasks != []) {
      constructTableData();
    }
  }, [tasks, subtasks]);

  return <Table columns={columns} dataSource={tableData} />;
}
