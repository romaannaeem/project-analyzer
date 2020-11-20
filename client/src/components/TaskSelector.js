import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Menu, Dropdown, Button, message } from 'antd';
import { DownOutlined, InfoCircleOutlined } from '@ant-design/icons';

export default function TaskSelector() {
  let auth = useSelector((state) => state.auth);
  let [teams, setTeams] = useState([]);
  let [tasks, setTasks] = useState([]);

  const clickupApi = axios.create({
    baseURL: 'https://cors-duck.herokuapp.com/https://api.clickup.com/api/v2',
    headers: { Authorization: auth.token },
  });

  const menu = (
    <Menu onClick={handleMenuClick}>
      {tasks.map((task) => (
        <Menu.Item key={task.id} icon={<InfoCircleOutlined />}>
          {task.name}
        </Menu.Item>
      ))}
    </Menu>
  );

  function handleMenuClick(e) {
    console.log('click', e);
  }

  useEffect(() => {
    const fetchClickupTeams = async () => {
      let teamArray = [];

      await clickupApi.get(`/team`).then((res) => {
        res.data.teams.map((team) => {
          teamArray.push(team.id);
        });
      });

      setTeams(teamArray);
    };

    fetchClickupTeams();
  }, []);

  useEffect(() => {
    const fetchClickupTasks = async () => {
      teams.map(async (team) => {
        await clickupApi
          .get(`/team/${team}/task`)
          .then((res) => setTasks(res.data.tasks));
      });
    };

    fetchClickupTasks();
  }, [teams]);

  console.log('tasks', tasks);

  return (
    <Dropdown overlay={menu}>
      <Button>
        Select Task You'd Like To Track <DownOutlined />
      </Button>
    </Dropdown>
  );
}
