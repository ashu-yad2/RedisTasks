var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var redis = require('redis');
const { redirect } = require('express/lib/response');

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// create client
const client = redis.createClient()
client.connect();
  

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async(req, res) => {
  var title = "Task List";
  var tasks = await client.lRange('tasks', 0, -1);
  var call = await client.hGetAll('call');

    res.render('index', {
      title: title,
      tasks: tasks,
      call: call
    });  
});

app.post('/task/add', async(req, res) => {
  var task = req.body.task;
  await client.rPush('tasks', task);
  res.redirect('/');
});

app.post('/tasks/delete', async(req, res) => {
  var taskToDel = req.body.tasks;
   var tasks = await client.lRange('tasks', 0, -1);
    for(var i = 0; i < tasks.length; i++) {
      if(taskToDel.indexOf(tasks[i]) > -1) {
        await client.lRem('tasks', 0, tasks[i]);
      }
    }
  res.redirect('/');
});

app.post('/call/add', async (req, res) => {
  var newCall = {};
  newCall.name = req.body.name;
  newCall.company = req.body.company;
  newCall.phone = req.body.phone;
  newCall.time = req.body.time;

  await client.hSet('call', ['name', newCall.name, 'company', newCall.company, 'phone', newCall.phone, 'time', newCall.time]);

  res.redirect('/');
});

app.listen(3000);
console.log('server started on port 3000');


module.exports = app;