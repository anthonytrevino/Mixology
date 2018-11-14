const express = require('express')
const app = express()
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')

app.engine('mustache', mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')
app.use(bodyParser.urlencoded({extended : false}))
app.use(express.static('public'))

app.post('/login', function(req,res){
  res.redirect('login')
})

app.get('/', function(req,res){
  res.render('navbar')
})

app.listen(3000,function(req,res){
  console.log("Server is running...")
})
