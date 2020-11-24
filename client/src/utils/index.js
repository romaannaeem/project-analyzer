const ONE_DAY = 86400000;

export function calculateAverageDailyCompletion(project) {
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

export function findProjectedEndDate(
  totalCompletionRate,
  averageDailyCompletionRate
) {
  let today = Date.now();
  let days = 0;

  let completionRate = Number(totalCompletionRate);
  let avgDaily = Number(averageDailyCompletionRate);

  for (let i = completionRate; i <= 100; i += avgDaily) {
    days++;
  }

  let projectedEndDate = convertUnixTime(today + ONE_DAY * days);

  return projectedEndDate;
}

export function getUniqueListBy(arr, key) {
  return [...new Map(arr.map((item) => [item[key], item])).values()];
}

// Takes (Array, Object, Number(Unix Time in ms)) and calculates how many subtasks have been completed per day
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

function convertUnixTime(timestamp) {
  let date = new Date(parseInt(timestamp));
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, '0');
  let day = date.getDate().toString().padStart(2, '0');

  let formattedTime = `${day}/${month}/${year}`;

  return formattedTime;
}
