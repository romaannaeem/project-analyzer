import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Input, Button } from 'antd';
import Autosuggest from 'react-autosuggest';

const { Search } = Input;

export default function TaskSearch() {
  let auth = useSelector((state) => state.auth);
  let [teams, setTeams] = useState([]);
  let [tasks, setTasks] = useState([]);
  let [value, setValue] = useState('');
  let [selectedValue, setSelectedValue] = useState({});
  let [suggestions, setSuggestions] = useState([]);

  const clickupApi = axios.create({
    baseURL: 'https://cors-duck.herokuapp.com/https://api.clickup.com/api/v2',
    headers: { Authorization: auth.token },
  });

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : tasks.filter(
          (task) => task.name.toLowerCase().slice(0, inputLength) === inputValue
        );
  };

  useEffect(() => {
    const fetchTeams = async () => {
      let teamArray = [];

      await clickupApi.get(`/team`).then((res) => {
        res.data.teams.map((team) => {
          teamArray.push(team.id);
        });
      });

      setTeams(teamArray);
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      teams.map(async (team) => {
        await clickupApi.get(`/team/${team}/task`).then((res) => {
          setTasks(res.data.tasks);
        });
      });
    };

    fetchTasks();
  }, [teams]);

  const getSuggestionValue = (suggestion) => {
    setSelectedValue(suggestion);

    return suggestion.name;
  };

  const renderSuggestion = (suggestion) => <div>{suggestion.name}</div>;

  const onChange = (event, { newValue }) => {
    setValue(newValue);
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const submitSelected = async () => {
    if (
      Object.keys(selectedValue).length === 0 &&
      selectedValue.constructor === Object
    ) {
      return null;
    } else {
      await axios.post('/api/trackedTask', {
        userId: auth._id,
        taskId: selectedValue.id,
      });

      window.location.href = `/`;
    }
  };

  const inputProps = {
    placeholder: 'Type a task name',
    value,
    onChange: onChange,
  };

  return (
    <div className="autosuggest-section">
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
      />
      <Button type="primary" onClick={submitSelected}>
        Add Task
      </Button>
    </div>
  );
}
