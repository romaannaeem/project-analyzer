import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Table } from 'antd';
import moment from 'moment';

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
      render: (item) => (item * 100).toFixed(2),
    },
    {
      title: 'Average Daily Completion (%)',
      dataIndex: 'averageDailyCompletion',
      key: 'averageDailyCompletion',
      render: (item) => (item * 100).toFixed(2),
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

        tableItem.totalCompletion = closedSubtasks / openSubtasks;

        tableItem.averageDailyCompletion = calculateAverageDailyCompletion(
          tableItem
        );
      });

      setTableData(tempTableData);
    };

    if (tasks != [] && subtasks != []) {
      constructTableData();
    }
  }, [tasks, subtasks]);

  useEffect(() => {
    const doSomething = () => {
      tableData.map((tableItem) => {
        calculateAverageDailyCompletion(tableItem);
      });
    };

    doSomething();
  }, [tableData]);

  function convertUnixTime(timestamp) {
    let date = new Date(parseInt(timestamp));
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');

    let formattedTime = `${day}/${month}/${year}`;

    return formattedTime;
  }

  // Takes (Array, Object, Number(Unix Time in ms))
  function fillCompletionArray(array, project, firstDay) {
    let startDate = parseInt(firstDay, 10); // coerce to number
    let counter = 0;

    for (
      let i = startDate;
      i <= startDate + ONE_DAY * array.length;
      i = i + ONE_DAY
    ) {
      project.subtasks.map((subtask) => {
        if (convertUnixTime(i) == convertUnixTime(subtask.date_closed)) {
          array[counter]++;
        }
      });
      counter++;
    }

    return array;
  }

  // If strings passed, they'll be coerced to numbers
  function daysBetween(d1, d2) {
    let date1 = new Date(parseInt(d1, 10)); // Earlier date
    let date2 = new Date(parseInt(d2, 10)); // Later date

    let differenceInTime = date2.getTime() - date1.getTime();
    let differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));

    return differenceInDays;
  }

  function arrayOfAverages(arr, toDivideBy) {
    return arr.map((num) => num / toDivideBy);
  }

  function findAverage(arr) {
    let total = 0;
    arr.map((num) => (total += num));
    let average = total / arr.length;
    return average;
  }

  function calculateAverageDailyCompletion(project) {
    let now = Date.now();
    let daysAgo = daysBetween(project.projectStartDate, now);
    let completionArray = new Array(daysAgo + 1).fill(0);

    let arr = fillCompletionArray(
      completionArray,
      project,
      project.projectStartDate
    );

    let averagedArray = arrayOfAverages(arr, project.subtasks.length);
    let averageDailyCompletionRate = findAverage(averagedArray);

    return averageDailyCompletionRate;
  }

  function getUniqueListBy(arr, key) {
    return [...new Map(arr.map((item) => [item[key], item])).values()];
  }

  return <Table columns={columns} dataSource={tableData} />;
}
