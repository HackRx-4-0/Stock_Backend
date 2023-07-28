const fs = require('fs');

function modifyDataAndSave() {
  // Read the JSON data from a file (assuming the file is named "data.json")
  const rawData = fs.readFileSync('./data.json');
  const data = JSON.parse(rawData);

  // Function to generate a random number between -50 and 50
  function getRandomOffset() {
    return Math.floor(Math.random() * 51) - 25;
  }

  function incrementTime(time) {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    let newSeconds = seconds + 1;
    let newMinutes = minutes;
    let newHours = hours;

    if (newSeconds === 60) {
      newSeconds = 0;
      newMinutes += 1;
      if (newMinutes === 60) {
        newMinutes = 0;
        newHours += 1;
      }
    }

    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(
      2,
      '0'
    )}:${String(newSeconds).padStart(2, '0')}`;
  }

  // Loop through each key in the data object
  for (const key of Object.keys(data)) {
    const selected_array = data[key] || [];

    // Increment the "time" value of the last object by 1
    let new_time = '00:00:00';
    if (selected_array.length > 0) {
      const last_object = selected_array[selected_array.length - 1];
      new_time = incrementTime(last_object.time);
    }

    // Get the value of the last object (if available) or use 500 as a default value
    const previous_value =
      selected_array.length > 0
        ? parseInt(selected_array[selected_array.length - 1].amount)
        : 500;

    // Generate a new value based on the previous value and the random offset
    const randomOffset = getRandomOffset();
    const new_value = previous_value + randomOffset;

    // Create the new object with the new_time and new_value
    const new_object = { time: new_time, amount: new_value.toString() };

    // Add the new object to the chosen array
    selected_array.push(new_object);

    // Update the data with the modified array
    data[key] = selected_array;
  }

  // Convert the data back to JSON format
  const updatedData = JSON.stringify(data, null, 2);

  // Write the updated JSON back to the file
  fs.writeFileSync('./data.json', updatedData);

  console.log('Data updated and saved.');
}

// Call the function at an interval of 2 seconds
setInterval(modifyDataAndSave, 1000);
