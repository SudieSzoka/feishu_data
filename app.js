  window.onload = function() {
      displayHistory();
    };
  document.addEventListener('DOMContentLoaded', function() {
    // let activationCode = localStorage.getItem('activationCode');
    let activationCode = 'ab';
    if (!activationCode) {
      //showActivationModal(); // 显示激活码输入框
      checkActivationCode(activationCode)
    } else {
      checkActivationCode(activationCode);
    }
});

function showActivationModal(message = '') {
  if (message) {
    alert(message); // 显示错误信息
  }
  document.getElementById('activationModal').style.display = 'block'; // 显示激活码输入框
}

function submitActivationCode() {
    let code = document.getElementById('activationCode').value;
    localStorage.setItem('activationCode', code);
    checkActivationCode(code);
}

function checkActivationCode(code) {
    fetch(`config/${code}.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Activation code error.');
        }
        return response.json();
      })
      .then(data => {
        let expiryDate = new Date(data.data);
        let currentDate = new Date();
        if (currentDate > expiryDate) {
          showActivationModal('Activation code has expired.'); // 显示过期信息并显示输入框
        } else {
          document.getElementById('activationModal').style.display = 'none';
          document.getElementById('mainContent').style.display = 'block';
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        // 显示错误提示框，并显示激活码输入框
        showActivationModal('Failed to fetch activation code file. ' + error.message);
      });
}
  
function createQuery() {
  let query = document.getElementById('queryInput').value;
  fetch(`data/${query}.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error('用户信息未找到！需要联系作者手动添加。');
      }
      return response.json();
    })
    .then(data => {
      // 分割日期和粉丝数据
      let dates = data.date.split(',').map(date => date.trim());
      let fans = data.fans.split(',').map(fan => parseFloat(fan.trim()));

      // 确保日期和粉丝数据的数量匹配
      if (dates.length !== fans.length) {
        throw new Error('粉丝、日期数据长度不匹配！');
      }

      // 分别提取日期和粉丝数值
      let labels = dates;
      let valuesArray = fans;

      // 调用 displayChart 并传入处理后的数据以及名称
      displayChart(labels, valuesArray, data.name);
      // 更新历史记录，同时传递 query 和 name
      updateHistory(query, data.name);
    })
    .catch(error => {
      alert(error.message);
    });
}

var currentChart = null;

function displayChart(labels, data, chartName) {
  // 获取 canvas 元素
  var ctx = document.getElementById('chartCanvas').getContext('2d');

  // 如果当前已经有图表实例存在，则销毁它
  if (currentChart) {
    currentChart.destroy();
  }

  // 创建并配置新的图表实例
  currentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels, // 使用传入的 labels 作为 X轴 标签
      datasets: [{
        label: chartName,
        data: data, // 使用传入的 data 作为数据点
        backgroundColor: 'rgba(0, 123, 255, 0.5)',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true // Y轴从0开始
        }
      },
      title: {
        display: true,
        text: chartName // 图表标题设置为传入的名称
      }
    }
  });
}
function updateHistory(query, name) {
  let history = JSON.parse(localStorage.getItem('history')) || [];
  // 创建一个包含 query 和 name 的对象
  let historyItem = { query: query, name: name };
  if (history.some(item => item.query === query)) {
    return; // Query is already in history
  }
  history.unshift(historyItem); // Add the new history item to the beginning of the history array
  if (history.length > 5) {
    history.pop(); // Remove the oldest history item if history exceeds 5 items
  }
  localStorage.setItem('history', JSON.stringify(history));
  displayHistory();
}

function displayHistory() {
  let history = JSON.parse(localStorage.getItem('history')) || [];
  let historyElement = document.getElementById('history');
  historyElement.innerHTML = ''; // Clear previous history

  // 创建一个容器div，用于横排显示历史记录
  let historyContainer = document.createElement('div');
  historyContainer.style.display = 'flex';
  historyContainer.style.flexDirection = 'row';
  historyContainer.style.flexWrap = 'wrap'; // 如果空间不足，允许换行
  historyContainer.style.alignItems = 'center';

  history.forEach(item => {
    // 创建一个包裹每个历史记录的div
    let historyItem = document.createElement('div');
    historyItem.style.marginRight = '10px'; // 为每个历史项添加右边距

    let link = document.createElement('a');
    link.href = '#';
    link.textContent = item.name; // 使用 name 作为链接文本
    // 当点击链接时，设置输入框的值为对应的 query 并执行查询
    link.onclick = function() {
      document.getElementById('queryInput').value = item.query;
      createQuery();
    };

    historyItem.appendChild(link); // 将链接添加到历史项div中
    historyContainer.appendChild(historyItem); // 将历史项添加到容器中
  });

  historyElement.appendChild(historyContainer); // 将容器添加到历史记录元素中
}